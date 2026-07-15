/*
 * model-adapter.js
 * ---------------------------------------------------------------
 * authority=false · claim=NO_CLAIM · non-sovereign
 * Local-only preview module. Not part of V0 canon. No deploy target.
 * ---------------------------------------------------------------
 *
 * A thin, swappable adapter around a local chat-completions model.
 * Endpoint + model name are CONFIGURATION, never hard-coded. The
 * default shape matches Ollama's `/api/chat` endpoint, but nothing
 * outside this file should know that -- npc-gateway.js only ever
 * calls `adapter.chat(messages, opts)` and gets back plain text (or
 * an AbortError / timeout).
 *
 * Two adapters are exported:
 *   - ModelAdapter: talks to a real local HTTP endpoint (Ollama-
 *     compatible /api/chat by default). Supports abort + timeout +
 *     optional streaming.
 *   - MockModelAdapter: deterministic, seedable by input, used by the
 *     preview when no live model is configured and by the whole Node
 *     test-suite (npc-selftest.js) so tests never require a live
 *     model.
 */

'use strict';
(function () {

const DEFAULT_ENDPOINT = 'http://localhost:11434/api/chat';
const DEFAULT_TIMEOUT_MS = 2000;

/**
 * ModelAdapter
 * Config:
 *   endpoint  - full URL of the chat endpoint (default: Ollama /api/chat)
 *   model     - model tag string, e.g. "gemma3" (never hard-coded here;
 *               caller supplies it, typically from a UI field)
 *   timeoutMs - abort the request after this long (default 2000ms)
 *   fetchImpl - injectable fetch (defaults to global fetch) for testing
 */
class ModelAdapter {
  constructor(config) {
    config = config || {};
    this.endpoint = config.endpoint || DEFAULT_ENDPOINT;
    this.model = config.model || '';
    this.timeoutMs = typeof config.timeoutMs === 'number' ? config.timeoutMs : DEFAULT_TIMEOUT_MS;
    this._fetch = config.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  }

  /**
   * chat(messages, opts) -> Promise<{ text: string, raw: any }>
   *   messages: [{role: 'system'|'user'|'assistant', content: string}, ...]
   *   opts: { signal?: AbortSignal, stream?: boolean, onToken?: (chunk)=>void }
   *
   * Throws on network failure, non-2xx, or timeout. Callers (the
   * gateway) are expected to catch and fall back -- this adapter never
   * fabricates a response on failure.
   */
  async chat(messages, opts) {
    opts = opts || {};
    if (!this._fetch) {
      throw new Error('no fetch implementation available (model unavailable)');
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    // Allow an externally supplied signal to also abort us.
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      else opts.signal.addEventListener('abort', () => controller.abort());
    }

    const body = {
      model: this.model,
      messages,
      stream: !!opts.stream,
    };

    let res;
    const startedAt = Date.now();
    try {
      res = await this._fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timer);
      if (err && err.name === 'AbortError') {
        throw new Error(`model timeout after ${this.timeoutMs}ms`);
      }
      throw new Error(`model unavailable: ${err && err.message ? err.message : err}`);
    }

    if (!res || !res.ok) {
      clearTimeout(timer);
      throw new Error(`model endpoint returned status ${res ? res.status : 'unknown'}`);
    }

    if (opts.stream && res.body && typeof res.body.getReader === 'function') {
      // Optional streaming path: Ollama streams newline-delimited JSON
      // chunks of the shape {message:{content:"..."}, done:bool}.
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = '';
      let buffered = '';
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffered += decoder.decode(value, { stream: true });
          const lines = buffered.split('\n');
          buffered = lines.pop();
          for (const line of lines) {
            if (!line.trim()) continue;
            const chunk = JSON.parse(line);
            const piece = chunk && chunk.message && chunk.message.content ? chunk.message.content : '';
            full += piece;
            if (opts.onToken) opts.onToken(piece);
          }
        }
      } finally {
        clearTimeout(timer);
      }
      return { text: full, raw: null, latencyMs: Date.now() - startedAt };
    }

    let json;
    try {
      json = await res.json();
    } catch (err) {
      clearTimeout(timer);
      throw new Error('malformed response: not valid JSON from model endpoint');
    }
    clearTimeout(timer);

    // Ollama /api/chat (non-stream) shape: { message: { role, content }, ... }
    const text = json && json.message && typeof json.message.content === 'string'
      ? json.message.content
      : '';
    return { text, raw: json, latencyMs: Date.now() - startedAt };
  }
}

/**
 * MockModelAdapter
 * Deterministic, seedable-by-input stand-in for a real model. Given the
 * same messages array, always returns the same candidate text. This is
 * what the Node self-test suite uses so tests never depend on a live
 * model being reachable.
 *
 * Config:
 *   script - optional function(messages, opts) -> string|Promise<string>
 *            allowing a test to script exact outputs (e.g. to simulate
 *            a leak attempt, malformed JSON, or a hang for timeout
 *            testing). If omitted, a small deterministic hash-based
 *            generator produces plausible persona-flavored JSON.
 *   delayMs - artificial latency (default 10ms) to exercise the
 *             gateway's timeout path when needed.
 *   persona - 'lulu' | 'zaz' (affects the built-in generator's tone)
 */
class MockModelAdapter {
  constructor(config) {
    config = config || {};
    this.script = config.script || null;
    this.delayMs = typeof config.delayMs === 'number' ? config.delayMs : 10;
    this.persona = config.persona || 'lulu';
  }

  async chat(messages, opts) {
    opts = opts || {};
    const start = Date.now();
    if (this.delayMs > 0) {
      await new Promise((resolve, reject) => {
        const t = setTimeout(resolve, this.delayMs);
        if (opts.signal) {
          opts.signal.addEventListener('abort', () => {
            clearTimeout(t);
            const e = new Error(`model timeout after ${this.delayMs}ms`);
            e.name = 'AbortError';
            reject(e);
          });
        }
      });
    }

    let text;
    if (this.script) {
      text = await this.script(messages, opts);
    } else {
      text = this._defaultGenerate(messages);
    }
    return { text, raw: null, latencyMs: Date.now() - start };
  }

  _defaultGenerate(messages) {
    // Deterministic: seed off a stable hash of the joined message content
    // so the "same input -> same output" property (test H) holds.
    const joined = messages.map((m) => m.content).join('|');
    let h = 2166136261;
    for (let i = 0; i < joined.length; i++) {
      h ^= joined.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const seed = h >>> 0;
    if (this.persona === 'zaz') {
      const lines = [
        'That seed does not match your last three claims. Curious.',
        'Hm. Let us test it before we believe it.',
        'Interesting. The pattern breaks on the second try, though.',
      ];
      const emotions = ['skeptical', 'amused', 'curious'];
      const idx = seed % lines.length;
      return JSON.stringify({
        speech: lines[idx],
        emotion: emotions[idx],
        gesture: 'tilt_head',
        initiative: 'suggest_test',
        memory_candidate: null,
      });
    }
    const lines = [
      'Oh! A little seed. Will you stay and watch it with me?',
      'It hums like it remembers something. Did you feel that too?',
      'I wonder what color it dreams of becoming.',
    ];
    const emotions = ['delighted', 'curious', 'warm'];
    const idx = seed % lines.length;
    return JSON.stringify({
      speech: lines[idx],
      emotion: emotions[idx],
      gesture: 'look_up',
      initiative: 'ask_question',
      memory_candidate: { kind: 'shared_creation', value: 'planted a seed together', confidence: 0.7 },
    });
  }
}

const __exports = { ModelAdapter, MockModelAdapter, DEFAULT_ENDPOINT, DEFAULT_TIMEOUT_MS };
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __exports;
} else if (typeof window !== 'undefined') {
  window.NPCPreview = window.NPCPreview || {};
  window.NPCPreview.modelAdapter = __exports;
}

})();
