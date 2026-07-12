"""LULU CLI HARNESS — Phase 1, step 12. A full day of Lulu in the terminal,
zero LLM. If this is playable (and a little boring), the body works.

  python3 lulu/lulu_cli.py --day       # deterministic scripted day + receipt
  python3 lulu/lulu_cli.py             # interactive (state persists in
                                       # lulu/.lulu_state.json, gitignored)

Voice here is Build C: offline deterministic fallback, code-switching FR/EN.
authority=false · claim=NO_CLAIM · these are LuluLocalEvents, not HELEN receipts.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lulu_kernel import (QUIZ_BANK, admit, replay, derive_mood, verify_chain,
                         council_advisory, offline_fallback, select_outcome,
                         RefusalError, BUCKET_SECONDS)

STATE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".lulu_state.json")


def load_log():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            log = json.load(f)
        if not verify_chain(log):
            print("!! event log failed chain verification — starting fresh (old file kept as .bad)")
            os.rename(STATE_FILE, STATE_FILE + ".bad")
            return []
        return log
    return []


def save_log(log):
    with open(STATE_FILE, "w") as f:
        json.dump(log, f)


def bar(v):
    return "▮" * int(round(v / 10)) + "▯" * (10 - int(round(v / 10)))


def show(log, verbose=True):
    s = replay(log)
    m = derive_mood(s)
    n = s["needs"]
    print("  🌙 ENERGY     %s %3d" % (bar(n["energy"]), round(n["energy"])))
    print("  ✨ CURIOSITY  %s %3d" % (bar(n["curiosity"]), round(n["curiosity"])))
    print("  💜 CONNECTION %s %3d" % (bar(n["connection"]), round(n["connection"])))
    print("  mood: %s · 🪙 ZOL %d · streak ×%d" % (m, s["zol"], s["quiz_streak"]))
    if verbose and s["room"]:
        print("  room: " + ", ".join(s["room"]))
    print("  Lulu: “%s”" % offline_fallback(s)["utterance"])
    return s


def try_admit(log, kind, payload, label=""):
    try:
        log2 = admit(log, kind, payload)
        if label:
            print("· " + label)
        return log2
    except RefusalError as e:
        print("· gate refused %s: %s" % (kind, e))
        print("  Lulu: “The gate lacks strategic vision. C'est noté.”")
        return log


def pick_question(log):
    prev = log[-1]["hash"] if log else "LULU-GENESIS"
    qids = sorted(QUIZ_BANK.keys())
    idx, _ = select_outcome(prev, "QUIZ_PICK_%d" % len(log), qids)
    return qids[idx]


def ask_quiz(log, forced_choice=None):
    qid = pick_question(log)
    q = QUIZ_BANK[qid]
    print("🦋 The Moth wonders: " + q["q"])
    for i, opt in enumerate(q["options"]):
        print("   %d) %s" % (i + 1, opt))
    if forced_choice is None:
        try:
            choice = int(input("   your answer> ").strip()) - 1
        except (ValueError, EOFError):
            print("   (the Moth flutters off)")
            return log
    else:
        choice = forced_choice if forced_choice >= 0 else q["correct"]
    before = replay(log)["zol"]
    log = try_admit(log, "QUIZ_ANSWER",
                    {"questionId": qid, "choice": choice, "intentId": "Q%d" % len(log)})
    s = replay(log)
    if s["zol"] > before:
        print("   ✅ +%d ZOL — %s" % (s["zol"] - before, q["lesson"]))
    else:
        print("   ❌ it was: %s — %s" % (q["options"][q["correct"]], q["lesson"]))
    return log


def scripted_day():
    """Deterministic full day. Same script → same final state, twice replayed."""
    print("=== A DAY OF LULU (kernel only, no LLM) ===\n")
    T0 = 1_800_000_000
    log = []

    print("— 08:00 · you return after the night (16h away) —")
    log = try_admit(log, "ABSENCE_TICK_BATCH",
                    {"fromTs": T0, "toTs": T0 + 16 * 3600,
                     "elapsedBuckets": (16 * 3600) // BUCKET_SECONDS},
                    "night passed: one ABSENCE_TICK_BATCH (32 buckets)")
    log = try_admit(log, "ABSENCE_EVENT",
                    {"archetype": "FOLLOWED_BUG", "effects": {"curiosity": 3}},
                    "while you slept: FOLLOWED_BUG (bounded effects)")
    show(log)

    print("\n— morning care —")
    log = try_admit(log, "CARE_ACTION", {"verb": "TALK", "intentId": "D1"}, "TALK")
    log = try_admit(log, "CARE_ACTION", {"verb": "GIVE_OBJECT", "intentId": "D2"}, "GIVE_OBJECT")
    print("  outcome: %s (seeded, replay-exact)" % log[-1]["payload"]["selectedOutcome"])

    print("\n— the Moth visits: three quizzes (streak economy) —")
    for _ in range(3):
        log = ask_quiz(log, forced_choice=-1)   # -1 = answer correctly
    print("\n— one wrong answer resets the streak —")
    q = QUIZ_BANK[pick_question(log)]
    log = ask_quiz(log, forced_choice=(q["correct"] + 1) % len(q["options"]))

    print("\n— afternoon —")
    log = try_admit(log, "CARE_ACTION", {"verb": "EXPLORE", "intentId": "D3"}, "EXPLORE")
    log = try_admit(log, "OBJECT_SPAWN", {"name": "a rock that looks like Tuesday"},
                    "she brings something home")
    log = try_admit(log, "REQUEST", {"requestId": "hats"}, "Lulu asks: seven hats?")
    log = try_admit(log, "ZOL_DELTA", {"amount": -9999}, "")   # refused, visibly
    log = try_admit(log, "REQUEST_ANSWER", {"requestId": "hats", "answer": "MODIFY"},
                    "you answer MODIFY (one hat)")
    log = try_admit(log, "MEMORY_NOTE",
                    {"status": "INTERPRETIVE", "sourceEventIds": [log[2]["hash"]],
                     "text": "Le bug m'a suivie. We are colleagues now."},
                    "she writes an interpretive note")

    print("\n— 22:00 · evening state —")
    s = show(log)
    print("  council advisory (read-only): %s" % json.dumps(council_advisory(s)))

    ok_chain = verify_chain(log)
    a = json.dumps(replay(log), sort_keys=True)
    b = json.dumps(replay(log), sort_keys=True)
    print("\n=== RECEIPT ===")
    print("events: %d · chain verified: %s · replay bit-identical: %s" %
          (len(log), ok_chain, a == b))
    if ok_chain and a == b:
        print("THE BODY WORKS — witnessed. (Boring is the point; the voice comes next.)")
        return 0
    return 1


HELP = """commands: status · talk · rest · explore · give · quiz · wait <hours>
          room · log · advisory · help · quit"""


def interactive():
    log = load_log()
    now = int(time.time())
    s = replay(log)
    if log and now - s["last_wall_ts"] > BUCKET_SECONDS and s["last_wall_ts"] > 0:
        log = try_admit(log, "ABSENCE_TICK_BATCH",
                        {"fromTs": s["last_wall_ts"], "toTs": now,
                         "elapsedBuckets": min((now - s["last_wall_ts"]) // BUCKET_SECONDS, 336)},
                        "…time passed while you were gone")
    elif not log:
        log = try_admit(log, "ABSENCE_TICK_BATCH",
                        {"fromTs": now - BUCKET_SECONDS, "toTs": now, "elapsedBuckets": 1},
                        "Lulu wakes up")
    print("🟢 LULU (CLI body, offline voice) — " + HELP)
    show(log)
    while True:
        try:
            cmd = input("lulu> ").strip().lower().split()
        except EOFError:
            break
        if not cmd:
            continue
        c = cmd[0]
        if c in ("quit", "exit", "q"):
            break
        elif c == "help":
            print(HELP)
        elif c == "status":
            show(log)
        elif c in ("talk", "rest", "explore"):
            log = try_admit(log, "CARE_ACTION",
                            {"verb": c.upper(), "intentId": "I%d" % len(log)}, c.upper())
            show(log, verbose=False)
        elif c == "give":
            log = try_admit(log, "CARE_ACTION",
                            {"verb": "GIVE_OBJECT", "intentId": "I%d" % len(log)}, "GIVE_OBJECT")
            if log[-1]["kind"] == "CARE_ACTION":
                print("  outcome: " + log[-1]["payload"].get("selectedOutcome", "?"))
        elif c == "quiz":
            log = ask_quiz(log)
        elif c == "wait":
            hours = float(cmd[1]) if len(cmd) > 1 else 1.0
            t = replay(log)["last_wall_ts"] or int(time.time())
            log = try_admit(log, "ABSENCE_TICK_BATCH",
                            {"fromTs": t, "toTs": t + int(hours * 3600),
                             "elapsedBuckets": min(int(hours * 3600) // BUCKET_SECONDS, 336)},
                            "%.1fh pass" % hours)
            show(log, verbose=False)
        elif c == "room":
            print("  room: " + (", ".join(replay(log)["room"]) or "(empty — for now)"))
        elif c == "log":
            for ev in log[-8:]:
                print("  %s %s" % (ev["kind"], json.dumps(ev["payload"])[:70]))
        elif c == "advisory":
            print("  " + json.dumps(council_advisory(replay(log))))
        else:
            print("  ? " + HELP)
        save_log(log)
    save_log(log)
    print("Lulu: “Je continue sans toi. Obviously.” (state saved)")


if __name__ == "__main__":
    sys.exit(scripted_day() if "--day" in sys.argv else interactive())
