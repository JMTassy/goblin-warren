"""LULU CONSTITUTIONAL SELFTEST — Block C adversarial gates.
Run: python3 lulu/selftest_lulu.py   (exit 1 on any gate failure)
Each gate is also pytest-collectable (test_* functions).
"""
import json
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from lulu_kernel import (SCHEMA_VERSION, GENESIS_HASH, GIVE_OUTCOMES, MOODS,
                         admit, replay, derive_mood, derive_seed, select_outcome,
                         verify_chain, council_advisory, validate_voice_output,
                         offline_fallback, RefusalError, MAX_BUCKETS)

RESULTS = []


def gate(name, fn):
    try:
        fn()
        RESULTS.append((name, True, ""))
        print("PASS " + name)
    except AssertionError as e:
        RESULTS.append((name, False, str(e)))
        print("FAIL " + name + " — " + str(e))


def refuse(log, kind, payload):
    try:
        admit(log, kind, payload)
    except RefusalError as e:
        return str(e)
    raise AssertionError(kind + " was admitted but must be refused")


def base_log():
    log = []
    log = admit(log, "ZOL_DELTA", {"amount": 30})
    log = admit(log, "CARE_ACTION", {"verb": "TALK", "intentId": "T1"})
    return log


# G1 hash chain integrity + tamper detection
def test_chain():
    log = base_log()
    assert verify_chain(log), "chain must verify"
    bad = json.loads(json.dumps(log))
    bad[0]["payload"]["amount"] = 9999
    assert not verify_chain(bad), "tampered log must fail verification"


# G2/G3 state = replay(log), bit-identical
def test_replay_deterministic():
    log = base_log()
    a = json.dumps(replay(log), sort_keys=True)
    b = json.dumps(replay(log), sort_keys=True)
    assert a == b, "replay must be bit-identical"


# G4 text alone changes nothing; refused candidates leave log untouched
def test_refusal_leaves_log():
    log = base_log()
    before = json.dumps(log)
    refuse(log, "ZOL_DELTA", {"amount": -9999})          # LLM proposes +9999 spend
    refuse(log, "NOT_A_KIND", {})                        # LLM invents a kind
    refuse(log, "OBJECT_SPAWN", {"name": ""})            # LLM invents a bad object
    assert json.dumps(log) == before, "refusals must not mutate the log"


# G5 ZOL never negative
def test_zol_floor():
    log = base_log()
    msg = refuse(log, "ZOL_DELTA", {"amount": -31})
    assert "negative" in msg, msg
    log = admit(log, "ZOL_DELTA", {"amount": -30})
    assert replay(log)["zol"] == 0, "exact spend to zero is lawful"


# G6 needs clamp to [0,100]
def test_needs_clamp():
    log = []
    for i in range(20):
        log = admit(log, "CARE_ACTION", {"verb": "REST", "intentId": "R%d" % i})
    n = replay(log)["needs"]
    assert n["energy"] == 100.0, "energy must clamp at 100"
    assert all(0.0 <= v <= 100.0 for v in n.values()), "needs must stay in [0,100]"


# G7 Core Formula: Lulu does not wait for you — T+Δ differs with zero care actions
def test_absence_changes_state():
    log = base_log()
    s0 = replay(log)
    log = admit(log, "ABSENCE_TICK_BATCH",
                {"fromTs": 1000, "toTs": 1000 + 1800 * 12, "elapsedBuckets": 12})
    s1 = replay(log)
    assert s0["needs"] != s1["needs"], "absence must change her"


# G8 elapsed time capped at 7 days; device clock cannot destroy her
def test_absence_cap_and_clock():
    log = base_log()
    huge = 1800 * (MAX_BUCKETS + 500)
    msg = refuse(log, "ABSENCE_TICK_BATCH",
                 {"fromTs": 1000, "toTs": 1000 + huge, "elapsedBuckets": MAX_BUCKETS + 500})
    assert "cap" in msg, msg
    log = admit(log, "ABSENCE_TICK_BATCH",
                {"fromTs": 1000, "toTs": 1000 + huge, "elapsedBuckets": MAX_BUCKETS})
    refuse(log, "ABSENCE_TICK_BATCH",       # clock moved backward
           {"fromTs": 500, "toTs": 900, "elapsedBuckets": 0})


# G9 absence-event effects constitutionally capped; prose rejected from events
def test_absence_event_bounds():
    log = base_log()
    refuse(log, "ABSENCE_EVENT", {"archetype": "FOLLOWED_BUG", "effects": {"energy": -9}})
    refuse(log, "ABSENCE_EVENT", {"archetype": "FOLLOWED_BUG", "zolDelta": 50})
    refuse(log, "ABSENCE_EVENT", {"archetype": "FOLLOWED_BUG", "objects": ["a", "b"]})
    refuse(log, "ABSENCE_EVENT", {"archetype": "FOLLOWED_BUG",
                                  "text": "I followed a bug."})   # prose ≠ event truth
    log = admit(log, "ABSENCE_EVENT", {"archetype": "FOLLOWED_BUG",
                                       "effects": {"energy": -2, "curiosity": 1}})
    assert verify_chain(log)


# G10 never death: cave retreat + reconnection always admissible
def test_cave_never_death():
    log = []
    log = admit(log, "ABSENCE_TICK_BATCH",
                {"fromTs": 0, "toTs": 1800 * 100, "elapsedBuckets": 100})
    s = replay(log)
    assert s["in_cave"], "long neglect leads to the cave"
    assert derive_mood(s) == "CAVE_DWELLER"
    assert s["needs"]["connection"] >= 0.0, "she never dies"
    log = admit(log, "CARE_ACTION", {"verb": "TALK", "intentId": "BACK"})
    assert not replay(log)["in_cave"], "one honest word brings her back"


# G11 duplicate intent refused (same intent submitted twice)
def test_duplicate_intent():
    log = base_log()
    msg = refuse(log, "CARE_ACTION", {"verb": "TALK", "intentId": "T1"})
    assert "duplicate" in msg, msg


# G12 seeded outcomes: kernel-derived, deterministic, never LLM-supplied
def test_seed_determinism():
    i1, s1 = select_outcome("HASH_A", "GIVE_1", GIVE_OUTCOMES)
    i2, s2 = select_outcome("HASH_A", "GIVE_1", GIVE_OUTCOMES)
    i3, _ = select_outcome("HASH_B", "GIVE_1", GIVE_OUTCOMES)
    assert (i1, s1) == (i2, s2), "same chain + intent → same outcome"
    assert derive_seed("HASH_A", "GIVE_1") == s1
    log = base_log()
    log = admit(log, "CARE_ACTION", {"verb": "GIVE_OBJECT", "intentId": "G1"})
    ev = log[-1]["payload"]
    assert ev["selectedOutcome"] == GIVE_OUTCOMES[ev["selectedIndex"]]
    assert ev["seedDigest"].startswith("sha256:")


# G13 memory notes: INTERPRETIVE + provenance; cannot cite ghosts; move no state
def test_memory_provenance():
    log = base_log()
    refuse(log, "MEMORY_NOTE", {"status": "FACT", "sourceEventIds": [log[0]["hash"]],
                                "text": "x"})
    refuse(log, "MEMORY_NOTE", {"status": "INTERPRETIVE", "sourceEventIds": [],
                                "text": "x"})
    refuse(log, "MEMORY_NOTE", {"status": "INTERPRETIVE",
                                "sourceEventIds": ["EV_GHOST"], "text": "x"})
    before = replay(log)
    log = admit(log, "MEMORY_NOTE", {"status": "INTERPRETIVE",
                                     "sourceEventIds": [log[0]["hash"]],
                                     "text": "Pip said not to touch it. So I named it."})
    after = replay(log)
    assert before["needs"] == after["needs"] and before["zol"] == after["zol"], \
        "memory informs, never decides"
    assert len(after["notes"]) == 1


# G14 eight derived moods, pure function of state
def test_eight_moods():
    assert len(MOODS) == 8, "exactly eight moods"
    s = replay([])
    s["needs"].update({"energy": 10, "curiosity": 60, "connection": 60})
    assert derive_mood(s) == "SLEEPY"
    s["needs"].update({"energy": 60, "curiosity": 90, "connection": 90})
    assert derive_mood(s) == "CURIOUS"
    s["needs"].update({"energy": 60, "curiosity": 70, "connection": 90})
    assert derive_mood(s) == "DRAMATIC"


# G15 council export: advisory-only bands, read-only, no raw values
def test_council_advisory():
    adv = council_advisory(replay(base_log()))
    assert adv["advisoryOnly"] is True and adv["source"] == "LULU_LOCAL_GAME"
    assert set(adv.keys()) == {"source", "advisoryOnly", "energyBand",
                               "curiosityBand", "connectionBand"}
    assert all(adv[k] in ("LOW", "MID", "HIGH") for k in
               ("energyBand", "curiosityBand", "connectionBand")), "bands only, never raw state"


# G16 voice contract: strict keys, no replacement state, forbidden language dies
def test_voice_contract():
    ok = {"utterance": "I named the rock. It seemed lost.", "proposals": [],
          "expression": "CURIOUS", "schemaVersion": SCHEMA_VERSION}
    assert validate_voice_output(ok)
    for bad in (
        dict(ok, needs={"energy": 999}),                       # replacement state
        dict(ok, utterance="Lulu is dead now."),               # death claim
        dict(ok, utterance="This is canonical."),              # authority language
        dict(ok, expression="FURIOUS"),                        # invented mood
        {"utterance": "hi"},                                   # missing keys
    ):
        try:
            validate_voice_output(bad)
            raise AssertionError("bad voice output accepted: %s" % bad)
        except RefusalError:
            pass
    fb = offline_fallback(replay([]))
    assert validate_voice_output(fb), "offline fallback must satisfy its own contract"


# G17 old schema refused
def test_schema_version():
    msg = refuse([], "ZOL_DELTA", {"amount": 5, "schemaVersion": "0.9"})
    assert "schema" in msg, msg


# G18 quiz: kernel decides correctness; right pays, wrong pays nothing + teaches
def test_quiz_correctness():
    from lulu_kernel import QUIZ_BANK
    qid = sorted(QUIZ_BANK.keys())[0]
    q = QUIZ_BANK[qid]
    log = []
    log = admit(log, "QUIZ_ANSWER", {"questionId": qid, "choice": q["correct"],
                                     "intentId": "QZ1"})
    s = replay(log)
    assert s["zol"] == 10 and s["quiz_streak"] == 1, "first correct pays base 10"
    wrong = (q["correct"] + 1) % len(q["options"])
    log = admit(log, "QUIZ_ANSWER", {"questionId": qid, "choice": wrong,
                                     "intentId": "QZ2"})
    s = replay(log)
    assert s["zol"] == 10 and s["quiz_streak"] == 0, "wrong pays nothing, resets streak"
    assert s["quiz_wrong"] == 1 and s["needs"]["curiosity"] > 70, "a wrong answer still teaches"
    # the asker may not stamp its own correctness
    msg = refuse(log, "QUIZ_ANSWER", {"questionId": qid, "choice": wrong,
                                      "intentId": "QZ3", "correct": True})
    assert "kernel" in msg, msg


# G19 quiz streak bonus: +5 per consecutive correct, capped at +25
def test_quiz_streak_economy():
    from lulu_kernel import QUIZ_BANK
    qid = sorted(QUIZ_BANK.keys())[0]
    q = QUIZ_BANK[qid]
    log = []
    payouts = []
    for i in range(8):
        before = replay(log)["zol"]
        log = admit(log, "QUIZ_ANSWER", {"questionId": qid, "choice": q["correct"],
                                         "intentId": "ST%d" % i})
        payouts.append(replay(log)["zol"] - before)
    assert payouts == [10, 15, 20, 25, 30, 35, 35, 35], payouts   # cap at +25 bonus


# G20 quiz refusals: unknown question, out-of-range choice, duplicate intent
def test_quiz_refusals():
    from lulu_kernel import QUIZ_BANK
    qid = sorted(QUIZ_BANK.keys())[0]
    log = admit([], "QUIZ_ANSWER", {"questionId": qid, "choice": 0, "intentId": "X1"})
    before = json.dumps(log)
    refuse(log, "QUIZ_ANSWER", {"questionId": "invented-question", "choice": 0, "intentId": "X2"})
    refuse(log, "QUIZ_ANSWER", {"questionId": qid, "choice": 99, "intentId": "X3"})
    refuse(log, "QUIZ_ANSWER", {"questionId": qid, "choice": 0, "intentId": "X1"})
    assert json.dumps(log) == before, "refused quiz candidates leave the log untouched"


if __name__ == "__main__":
    for name, fn in sorted(
            ((k, v) for k, v in list(globals().items()) if k.startswith("test_")),
            key=lambda kv: kv[1].__code__.co_firstlineno):
        gate(name, fn)
    failed = [n for n, ok, _ in RESULTS if not ok]
    print("\n=== SUMMARY ===\nPassed: %d/%d" % (len(RESULTS) - len(failed), len(RESULTS)))
    if failed:
        print("Failed: " + ", ".join(failed))
        sys.exit(1)
