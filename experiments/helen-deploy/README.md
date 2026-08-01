<!-- authority=false · claim=NO_CLAIM · non-sovereign -->

# HELEN DEPLOY 0.1

**Context Player · asynchronous `/api/run` · execution capsule · receipt state machine.**

Node built-ins only. Zero dependencies. No build step. Nothing here writes outside
`experiments/helen-deploy/` and its temp workdirs; `index.html` and `selftest.js` are read,
hashed, and **copied** — never modified.

---

## The law

> No agent endpoint returns a finished-and-trust-me verdict. An execution may return
> **CERTIFIED** only when: declared context matches actual context · permissions were
> respected · outputs were stored · postconditions were evaluated · the complete receipt
> is replayable.

States, complete and closed:

```
QUEUED → RUNNING → PARTIAL | INVALID | CERTIFIED | FAILED
```

No other state exists. The four-letter token that would mean *"finished, trust me"* is
**absent from this entire tree by construction**, and that absence is grep-checkable. The
token is assembled below rather than typed, so that stating the check does not violate it:

```bash
grep -rn "$(printf 'DO')$(printf 'NE')" experiments/helen-deploy/   # must print nothing
```

The law above is carried in `runtime/store.js` as the `LAW` constant, embedded verbatim in
**every receipt** the runtime emits, and restated in the Context Player. It is deliberately
paraphrased at the one word the grep forbids: a law that violates its own invariant in order
to quote itself is not a law, it is a slogan.

---

## The mapping — from private artifact to governed capability

The HyperFrames vocabulary describes a working private pipeline: a person drives a player,
feeds it a frame, gets a result. Nothing in it is inspectable by anyone else, and nothing in
it can be inherited. HELEN Deploy is the same pipeline with each step forced to leave
evidence.

| HyperFrames (private) | HELEN Deploy 0.1 | What changed |
|---|---|---|
| the operator's player UI | `apps/context-player.html` | reads receipts; it can render a verdict but never produce one |
| a prompt / frame you send | **context packet** (`schemas/context-packet.schema.json`) | the inputs are *declared by digest* before anything runs |
| "run it" | `POST /api/run` → `{run_id, state:"QUEUED"}` | identity is minted before work starts; the call cannot return a verdict |
| whatever process happened to execute | **capsule** (`runtime/capsule.js`, `capsules/*.cjs`) | a named, registered unit; the submitter cannot name a command |
| the output you eyeball | **run receipt** (`schemas/run-receipt.schema.json`) | five independent conditions, each separately readable |
| files on someone's disk | **content-addressed store** (`runtime/store.js`) | outputs live under their own sha256; `receipts.jsonl` is append-only |
| reusable presets | **capsule registry** (`CAPSULE_REGISTRY`) | templates become declarations of *required capabilities*, checked before execution |
| "it worked" | `certified: true` | settable only by `runtime/evaluator.js`, only when all five conditions hold |

---

## The five conditions

`runtime/evaluator.js` is the only file permitted to write `certified: true`, and it does so
only when every one of these is true:

1. **context verified** — every declared file was hashed at provision time and matched.
2. **capabilities respected** — the capsule's required set was granted, and its self-reported
   used set sits inside the grant.
3. **outputs stored** — every output was written to `artifact_store/` under its own digest.
4. **postconditions passed** — every declared postcondition was evaluated and held.
5. **replay verified** — a *second* execution over the same packet produced identical output
   digests.

Failure mapping:

| what went wrong | state |
|---|---|
| declared digest ≠ bytes on disk; ungranted capability; unregistered capsule | `INVALID` (nothing executes) |
| the capsule could not spawn, crashed, or wrote no readable result | `FAILED` |
| outputs stored but a postcondition failed, or the replay digests differ | `PARTIAL` |
| all five | `CERTIFIED` |

A `PARTIAL` is not a soft pass. It is the runtime saying: *work happened, evidence exists,
and the claim you asked me to make is not the claim I can make.*

---

## Why the API is asynchronous (the Modal-shaped choice)

`POST /api/run` answers `202 {run_id, state:"QUEUED"}` the moment identity exists, and the
execution starts **after** the response has been written. This is not an ergonomic
preference about long-running jobs. It is how the law is enforced at the transport layer:

- If the POST blocked until execution finished, its response body would *be* the verdict, and
  every caller would treat "HTTP 200" as certification. The law would live only in a
  convention that clients are free to ignore.
- Because the POST returns a handle instead, there is **no code path in this runtime where an
  HTTP response is a judgement**. A caller must come back and read a receipt, and the receipt
  carries five separately falsifiable claims rather than one opaque status.
- Serverless async platforms (Modal and its kin) arrived at the same shape for throughput
  reasons. Here the same shape is load-bearing for governance reasons — a happy convergence,
  not an inheritance.

Identity follows the same discipline: `run_id = sha256(canonical(packet) + ":" + counter)`,
where `counter` is a persisted monotonic integer. **No clock participates in identity or in
ordering.** Wall-clock strings appear in receipts only as `observed_at`, explicitly labelled
observational, and the Context Player labels them that way in the transitions table.

---

## Endpoints

| method | route | answer |
|---|---|---|
| `POST` | `/api/run` | `202 {run_id, state:"QUEUED", receipt_url}`; `400` with schema violations if the packet is malformed |
| `GET` | `/api/run/:id` | the live receipt for that run (`404` if this process never minted it) |
| `GET` | `/api/receipts` | the append-only ledger, latest snapshot per run |

There are no other endpoints. There is no endpoint that executes a submitter-supplied
command, and no endpoint that mutates a receipt.

**Durability, stated honestly:** `GET /api/run/:id` serves the live in-process receipt, so it
answers `404` for a run minted by a previous process. The durable record is `receipts.jsonl`,
which is append-only and survives restarts; `GET /api/receipts` reads it from disk. 0.1 does
not rehydrate the in-process map from the ledger at boot — a receipt is readable from the
ledger, not resumable.

---

## The first capsule: `warren-selftest`

`capsules/warren-selftest.cjs` runs `node selftest.js index.html` against **hash-pinned
copies** of the Goblin Warren canon, provisioned into a temp workdir. It parses the
`selftest: N passed, M failed` summary and emits two outputs: `output.json` (structured,
clock-free, hashable) and `transcript.txt`.

Note the separation that makes the state machine mean anything: a selftest that *reports
failures* is not a capsule fault. The capsule's duty is to observe and report honestly; the
judgement of whether `passed === 35 && failed === 0` is acceptable belongs to the
**postconditions the packet declared**. So:

- packet asks for 35 → `CERTIFIED` — *the canon law held, twice, replayed.*
- packet asks for 36 → `PARTIAL` — the run is sound, the claim is refused.
- one declared digest tampered → `INVALID` — refused before a single line executes.

---

## Capsule isolation — what it does and does not guarantee

**It does:**

- create a fresh temp workdir per attempt, empty at the start;
- hash every declared context file against its declared digest and **abort before executing**
  on any mismatch;
- copy only the verified, declared files into that workdir — nothing else is present;
- spawn the capsule as a **child process** with `cwd` = that workdir and a **sanitized
  environment containing `PATH` and nothing else** — no `HOME`, no proxy variables, no store
  root, no port, no inherited secrets;
- pass the packet on **stdin**;
- collect results only from `.helen/result.json` inside the workdir, then delete the workdir.
  Only hashed outputs survive.

**It does not:**

- constitute a security boundary. The child runs as the **same user**, with the **same
  filesystem visibility** and the **same network reachability** as the server. There is no
  namespace, no seccomp profile, no container, no chroot, no user separation.
- enforce capabilities at the kernel. In 0.1 a capability is a **declaration**, checked at two
  honest seams — *required ⊆ granted* before execution, *self-reported used ⊆ granted* after.
  A capsule that lies about its use, or reads `/etc/passwd`, or opens a socket while holding
  no `net:outbound` grant, will not be stopped by this runtime.
- protect against a hostile capsule at all. The registry is the real control: a packet names a
  **registered capsule**, never a command, so the trust boundary in 0.1 is *"who may add files
  to `capsules/`"*, not *"what may a capsule do"*.

This caveat is stated here, in `runtime/capsule.js`'s header, and nowhere softened. Claiming
sandboxing that does not exist would be exactly the kind of unearned certification this
component was built to refuse.

---

## Running it

```bash
# 1. start the runtime (default port 8787, or PORT=0 to let the OS choose)
node api/server.js

# 2. the proof — starts its own server on a free port, uses an isolated store,
#    runs the three scenarios, prints the three receipts, exits 0 only if the
#    verdicts are CERTIFIED / INVALID / PARTIAL
node e2e.cjs

# 3. read a receipt: open apps/context-player.html in a browser,
#    point it at http://127.0.0.1:8787, paste a run_id — or paste a receipt JSON directly
```

Environment (both optional):

| variable | default | meaning |
|---|---|---|
| `PORT` | `8787` | `0` asks the OS for a free port; the chosen port is printed |
| `HELEN_STORE_ROOT` | `experiments/helen-deploy/var` | where `artifact_store/`, `receipts.jsonl` and `counter` live |
| `HELEN_CONTEXT_ROOT` | the repo root | the root that declared context paths resolve against |

`e2e.cjs` is the component's admission evidence. A green run is not "the tests passed"; it is
a demonstration that **the gate discriminates** — that the same runtime, given three packets
differing only in what they declared, produces three different and correct verdicts.

---

## Layout

```
experiments/helen-deploy/
├── schemas/
│   ├── context-packet.schema.json   what a submitter declares
│   └── run-receipt.schema.json      what an execution returns
├── runtime/
│   ├── store.js                     content-addressed store, append-only ledger, monotonic counter
│   ├── capsule.js                   provisioning + sanitized subprocess execution
│   └── evaluator.js                 the five conditions; the only writer of certified:true
├── api/
│   └── server.js                    node:http, three endpoints, async by law
├── capsules/
│   └── warren-selftest.cjs          the first governed capability
├── apps/
│   └── context-player.html          self-contained receipt reader, dual theme
├── e2e.cjs                          the admission evidence
└── README.md
```

---

## CONQUEST

> Conquest is the passage from an inaccessible private artifact to a governed capability that
> can be inspected, invoked, and inherited. Myth is fuel; the ledger remains law.

---

`authority=false · claim=NO_CLAIM · non-sovereign`
