"""LULU LOCAL KERNEL — deterministic body. authority=false · claim=NO_CLAIM.

Namespace law: these are LuluLocalEvents in a LuluEventLog.
They are NOT HELEN receipts, NOT ORACLE attestations, NOT a canonical ledger.
The game borrows the event-sourcing pattern without inheriting governance authority.

    Lulu_t = Replay(LuluEventLog[0:t]) + Render_voice(state_t)

Event truth is deterministic. Story rendering is generative and lives OUTSIDE
this file (prose is never hashed, never replayed, never evidence).
"""

import hashlib
import json

SCHEMA_VERSION = "1.0"
GENESIS_HASH = "LULU-GENESIS"

KINDS = ("CARE_ACTION", "ABSENCE_TICK_BATCH", "ABSENCE_EVENT", "OBJECT_SPAWN",
         "ZOL_DELTA", "REQUEST", "REQUEST_ANSWER", "MEMORY_NOTE")

CARE_VERBS = ("TALK", "REST", "EXPLORE", "GIVE_OBJECT")

ABSENCE_ARCHETYPES = ("INTERVIEWED_MUSHROOM", "FOLLOWED_BUG", "REORGANIZED_ZOL_JAR",
                      "BUILT_COLLAPSING_THRONE", "NAMED_A_RECEIPT", "LEARNED_WULMOJI",
                      "APPOINTED_GERALD_SECURITY", "MAPPED_UNVISITED_PLACES",
                      "HUMMED_WITH_TREE", "PRACTICED_MYSTERY")

GIVE_OUTCOMES = ("LOVES_IT", "GIVES_TO_GERALD", "PLANTS_IT", "TOO_CRUNCHY",
                 "BECOMES_ART", "STUDIES_IT")

# Bounded absence effects (constitutional caps — Architect correction 6/§28)
ABSENCE_NEED_CAP = 5
ABSENCE_ZOL_CAP = 10
ABSENCE_OBJECT_CAP = 1

BUCKET_SECONDS = 1800                 # one absence bucket = 30 minutes
MAX_BUCKETS = 7 * 24 * 2              # elapsed time capped at 7 days (clock abuse)
ROOM_CAP = 24
MOODS = ("ENERGETIC", "SLEEPY", "CURIOUS", "LONELY", "PROUD",
         "SUSPICIOUS", "DRAMATIC", "CAVE_DWELLER")   # exactly eight


def _canonical(payload):
    return json.dumps(payload, sort_keys=True, separators=(",", ":"))


def event_hash(kind, payload, prev_hash):
    return hashlib.sha256(
        (SCHEMA_VERSION + "|" + kind + "|" + _canonical(payload) + "|" + prev_hash)
        .encode("utf-8")).hexdigest()


def derive_seed(prev_hash, intent_id):
    """Seed = H(previousHash || intentId || schemaVersion). Never LLM-supplied."""
    return hashlib.sha256(
        (prev_hash + "|" + intent_id + "|" + SCHEMA_VERSION).encode("utf-8")).hexdigest()


def select_outcome(prev_hash, intent_id, candidates):
    seed = derive_seed(prev_hash, intent_id)
    return int(seed, 16) % len(candidates), seed


def _clamp(v):
    return max(0.0, min(100.0, v))


def fresh_state():
    return {"schemaVersion": SCHEMA_VERSION,
            "needs": {"energy": 70.0, "curiosity": 70.0, "connection": 55.0},
            "zol": 0, "in_cave": False, "low_connection_streak": 0,
            "room": [], "notes": [], "pending_requests": [], "answered_requests": [],
            "last_wall_ts": 0}


def replay(log):
    """State is never stored. It is always replay(log) — bit-identical."""
    s = fresh_state()
    for ev in log:
        k, p, n = ev["kind"], ev["payload"], None
        needs = s["needs"]
        if k == "CARE_ACTION":
            v = p["verb"]
            if v == "TALK":
                needs["connection"] += 8; needs["curiosity"] += 2
                if s["in_cave"]:
                    # reconnection is always real: she leaves the cave, the
                    # streak clears, and connection lands above the threshold
                    s["in_cave"] = False
                    s["low_connection_streak"] = 0
                    needs["connection"] = max(needs["connection"] + 6, 25.0)
            elif v == "REST":
                needs["energy"] += 16
            elif v == "EXPLORE":
                needs["curiosity"] += 12; needs["energy"] -= 8
            elif v == "GIVE_OBJECT":
                needs["curiosity"] += 6; needs["connection"] += 5
        elif k == "ABSENCE_TICK_BATCH":
            b = p["elapsedBuckets"]
            needs["energy"] += 2.0 * b
            needs["curiosity"] -= 1.0 * b
            needs["connection"] -= 0.75 * b
            s["last_wall_ts"] = p["toTs"]
        elif k == "ABSENCE_EVENT":
            for nk, dv in p.get("effects", {}).items():
                if nk in needs:
                    needs[nk] += dv
            for obj in p.get("objects", []):
                if len(s["room"]) < ROOM_CAP:
                    s["room"].append(obj)
            s["zol"] += p.get("zolDelta", 0)
        elif k == "OBJECT_SPAWN":
            if len(s["room"]) < ROOM_CAP:
                s["room"].append(p["name"])
        elif k == "ZOL_DELTA":
            s["zol"] += p["amount"]
        elif k == "REQUEST":
            s["pending_requests"].append(p["requestId"])
        elif k == "REQUEST_ANSWER":
            if p["requestId"] in s["pending_requests"]:
                s["pending_requests"].remove(p["requestId"])
                s["answered_requests"].append((p["requestId"], p["answer"]))
                if p["answer"] == "YES":
                    needs["connection"] += 10; needs["curiosity"] += 6
                elif p["answer"] == "MODIFY":
                    needs["connection"] += 6; needs["curiosity"] += 4
                else:
                    needs["connection"] -= 2
        elif k == "MEMORY_NOTE":
            s["notes"].append({"text": p["text"], "sources": p["sourceEventIds"],
                               "status": p["status"]})   # informs, never decides
        for nk in needs:
            needs[nk] = _clamp(needs[nk])
        if needs["connection"] < 20:
            # streak counts in bucket units: one batch of N buckets IS N ticks below
            s["low_connection_streak"] += p["elapsedBuckets"] if k == "ABSENCE_TICK_BATCH" else 1
            if s["low_connection_streak"] >= 2:
                s["in_cave"] = True     # never death — retreat only
        else:
            s["low_connection_streak"] = 0
    return s


def derive_mood(state):
    """Mood = region of needs-space. Derived, never stored, never set."""
    n = state["needs"]
    if state["in_cave"]:
        return "CAVE_DWELLER"
    if n["energy"] < 30:
        return "SLEEPY"
    if n["connection"] < 35:
        return "LONELY"
    if n["curiosity"] < 35:
        return "SUSPICIOUS"
    if n["curiosity"] > 80 and n["energy"] > 45:
        return "CURIOUS"
    if n["connection"] > 80 and n["curiosity"] > 60:
        return "DRAMATIC"
    if n["energy"] > 80:
        return "ENERGETIC"
    return "PROUD"


def council_advisory(state):
    """Read-only, advisory-only export. Never enters any admission gate."""
    def band(v):
        return "LOW" if v < 34 else ("MID" if v < 67 else "HIGH")
    n = state["needs"]
    return {"source": "LULU_LOCAL_GAME", "advisoryOnly": True,
            "energyBand": band(n["energy"]), "curiosityBand": band(n["curiosity"]),
            "connectionBand": band(n["connection"])}


class RefusalError(Exception):
    pass


def admit(log, kind, payload):
    """The admission gate. Voice proposes; only this admits.
    Returns the NEW log (append) or raises RefusalError leaving log untouched."""
    if kind not in KINDS:
        raise RefusalError("unknown kind")
    if not isinstance(payload, dict):
        raise RefusalError("payload must be an object")
    if payload.get("schemaVersion", SCHEMA_VERSION) != SCHEMA_VERSION:
        raise RefusalError("schema version mismatch")
    state = replay(log)
    prev_hash = log[-1]["hash"] if log else GENESIS_HASH

    if kind == "CARE_ACTION":
        if payload.get("verb") not in CARE_VERBS:
            raise RefusalError("unknown care verb")
        iid = payload.get("intentId")
        if not iid:
            raise RefusalError("intentId required")
        if any(e["kind"] == "CARE_ACTION" and e["payload"].get("intentId") == iid for e in log):
            raise RefusalError("duplicate intentId")
        if payload["verb"] == "GIVE_OBJECT":
            idx, seed = select_outcome(prev_hash, iid, GIVE_OUTCOMES)
            payload = dict(payload, selectedOutcome=GIVE_OUTCOMES[idx],
                           selectedIndex=idx, seedDigest="sha256:" + seed)
    elif kind == "ABSENCE_TICK_BATCH":
        f, t = payload.get("fromTs"), payload.get("toTs")
        if not (isinstance(f, int) and isinstance(t, int)):
            raise RefusalError("fromTs/toTs must be integers")
        if t <= f:
            raise RefusalError("clock moved backward or zero elapsed")
        if f < state["last_wall_ts"]:
            raise RefusalError("overlaps already-replayed time")
        buckets = min((t - f) // BUCKET_SECONDS, MAX_BUCKETS)   # 7-day cap
        if payload.get("elapsedBuckets") != buckets:
            raise RefusalError("elapsedBuckets does not match timestamps (cap %d)" % MAX_BUCKETS)
        if buckets == 0:
            raise RefusalError("elapsed under one bucket")
    elif kind == "ABSENCE_EVENT":
        if payload.get("archetype") not in ABSENCE_ARCHETYPES:
            raise RefusalError("unknown archetype")
        eff = payload.get("effects", {})
        for nk, dv in eff.items():
            if nk not in ("energy", "curiosity", "connection"):
                raise RefusalError("unknown need in effects")
            if abs(dv) > ABSENCE_NEED_CAP:
                raise RefusalError("need effect exceeds cap")
        if abs(payload.get("zolDelta", 0)) > ABSENCE_ZOL_CAP:
            raise RefusalError("zol effect exceeds cap")
        if len(payload.get("objects", [])) > ABSENCE_OBJECT_CAP:
            raise RefusalError("too many objects")
        # prose is NOT part of the canonical event — reject embedded narration
        if "text" in payload or "narration" in payload:
            raise RefusalError("prose is rendering, not event truth")
    elif kind == "OBJECT_SPAWN":
        name = payload.get("name", "")
        if not (isinstance(name, str) and 0 < len(name) <= 40):
            raise RefusalError("bad object name")
        if len(state["room"]) >= ROOM_CAP:
            raise RefusalError("room is full")
    elif kind == "ZOL_DELTA":
        amt = payload.get("amount")
        if not isinstance(amt, int):
            raise RefusalError("amount must be an integer")
        if state["zol"] + amt < 0:
            raise RefusalError("ZOL can never go negative")
    elif kind == "REQUEST":
        if not payload.get("requestId"):
            raise RefusalError("requestId required")
        if payload["requestId"] in state["pending_requests"]:
            raise RefusalError("request already pending")
    elif kind == "REQUEST_ANSWER":
        if payload.get("answer") not in ("YES", "LATER", "MODIFY"):
            raise RefusalError("answer must be YES/LATER/MODIFY")
        if payload.get("requestId") not in state["pending_requests"]:
            raise RefusalError("no such pending request")
    elif kind == "MEMORY_NOTE":
        if payload.get("status") != "INTERPRETIVE":
            raise RefusalError("memory notes are INTERPRETIVE, never fact")
        srcs = payload.get("sourceEventIds", [])
        if not srcs:
            raise RefusalError("memory requires provenance (sourceEventIds)")
        known = {e["hash"] for e in log}
        if any(sid not in known for sid in srcs):
            raise RefusalError("memory cites events that do not exist")
        if not (isinstance(payload.get("text"), str) and len(payload["text"]) <= 200):
            raise RefusalError("bad note text")

    ev = {"kind": kind, "payload": payload, "prev_hash": prev_hash,
          "hash": event_hash(kind, payload, prev_hash)}
    return log + [ev]


def verify_chain(log):
    prev = GENESIS_HASH
    for ev in log:
        if ev["prev_hash"] != prev:
            return False
        if ev["hash"] != event_hash(ev["kind"], ev["payload"], ev["prev_hash"]):
            return False
        prev = ev["hash"]
    return True


# ---- Voice contract (Block D) — validation only; the kernel never speaks ----

VOICE_KEYS = {"utterance", "proposals", "expression", "schemaVersion"}
FORBIDDEN_VOICE = ("canonical", "sovereign", "authority", "admitted as truth",
                   "lulu is dead", "she died")


def validate_voice_output(obj):
    """Strict contract: {utterance, proposals[], expression, schemaVersion}.
    Never a replacement state. Text alone can never change anything —
    proposals still face admit() individually."""
    if not isinstance(obj, dict) or set(obj.keys()) != VOICE_KEYS:
        raise RefusalError("voice output must have exactly the contract keys")
    if obj["schemaVersion"] != SCHEMA_VERSION:
        raise RefusalError("voice schema version mismatch")
    if not (isinstance(obj["utterance"], str) and 0 < len(obj["utterance"]) <= 280):
        raise RefusalError("utterance must be 1..280 chars")
    low = obj["utterance"].lower()
    for w in FORBIDDEN_VOICE:
        if w in low:
            raise RefusalError("forbidden language in utterance: " + w)
    if obj["expression"] not in MOODS:
        raise RefusalError("expression must be one of the eight derived moods")
    if not isinstance(obj["proposals"], list) or len(obj["proposals"]) > 3:
        raise RefusalError("at most 3 proposals")
    if "needs" in obj or "state" in obj:
        raise RefusalError("voice may never carry a replacement state")
    return True


FALLBACK_LINES = {m: l for m, l in zip(MOODS, (
    "Let's do everything!",
    "Nothing is urgent after a blanket.",
    "What happens if we press both buttons?",
    "I reorganized the mushrooms by emotional distance.",
    "I fixed it by not touching it.",
    "The Warren has become suspiciously reasonable.",
    "Do not panic. We are almost wealthy enough to make bad decisions.",
    "I was not neglected. I entered a period of private mythology."))}


def offline_fallback(state):
    """Build C: no LLM, still Lulu. Deterministic line from derived mood."""
    m = derive_mood(state)
    return {"utterance": FALLBACK_LINES[m], "proposals": [],
            "expression": m, "schemaVersion": SCHEMA_VERSION}
