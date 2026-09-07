# FIFA World Cup 2026 Prediction Engine — how to present it

> This post is a **guide**: how I would present my World Cup 2026 prediction engine to anyone — from a friend who's a beginner student, all the way to an advanced teacher or professor. First to last, in full detail.
>
> **The most important thing, up front:** everything this engine outputs (champion, percentages, scorelines) is a **PREDICTION**, *not* a real result. The *input* is real (the real 48 qualified teams + their real published Elo ratings), but the tournament hasn't been played yet — this is a model's guess. When you present it, say that repeatedly.

---

## 1. The 30-second pitch (memorise this)

If someone asks "what did you build?", this single paragraph is a complete answer:

> **"It's a real, offline prediction engine for the 2026 FIFA World Cup.** I take the **real 48 qualified teams** and their **real published Elo ratings**, run a fair, rules-correct group draw, simulate the entire tournament (group stage → knockout → champion), and then run a **Monte Carlo** simulation to work out each team's probability of winning the cup. It's written in Python, needs **no external libraries** (pure standard library), and every run is reproducible via a **`--seed`**. Everything it outputs is a **prediction, not a real fact.**"

That's it. Everything below is the detail of **how** each line of that pitch actually works — so you can explain it to a person at any level.

---

## 2. Why I built it (the story)

The project started somewhere completely different — as an **OOP teaching demo**. A `Person → Player → Goalkeeper/Defender/Midfielder/Forward` inheritance chain, and a `Team` class. Good for demonstrating the four pillars of OOP (encapsulation, inheritance, polymorphism, abstraction), but you can't actually *do* anything useful with it — it prints one scripted France match and that's all.

I wanted to build something that (1) uses **real data**, (2) people can **actually use**, and (3) is tied to the real 2026 World Cup. So I **kept the OOP demo intact** (it still runs with `python main.py`) and built a **new prediction engine** alongside it. The old one is completely untouched; the new one is purely additive.

---

## 3. The big picture — what the tournament is

You have to understand the format first, then everything else is easy. The 2026 World Cup has **48 teams** in **12 groups** (A–L), four teams per group. The top 2 of each group plus the **8 best third-placed teams** = **32 teams** advance to the knockout stage. After that it's pure knockout — lose and you're out.

![World Cup 2026 tournament format — from 48 teams to 1 champion](/blog/worldcup/flow.svg)

**104 matches** in total: 72 in the group stage, 32 in the knockout stage (Round of 32 → 16 → QF → SF → Final, plus a third-place play-off). This whole funnel is what my engine simulates.

---

## 4. The core — how a single match gets "predicted"

This is the heart of the project. The question: **if two teams play, who wins, and by what score?** We can't know the future — so we work with **probability**.

Every team has an **Elo rating** (an idea borrowed from chess, also used in football — the higher the rating, the stronger the team). From the **gap** between two teams' ratings, we work out who's ahead:

![Prediction model — from Elo to a Poisson scoreline](/blog/worldcup/model.svg)

Step by step:

1. **Win expectancy** — a formula converts the rating gap into a probability:
   `E_A = 1 / (1 + 10^((R_B − R_A) / 400))`. The stronger A is, the higher `E_A` (between 0 and 1).
2. **Expected goals** — we map that expectancy onto average goals (a match averages ~2.7 goals), giving `λ_A` and `λ_B`.
3. **Poisson sample** — a seeded random generator samples the actual goal counts from those λ values. This is exactly why upsets happen — strong teams lose sometimes too, just like real football.
4. **Scoreline** — we get a score, e.g. `Spain 2 – 1 Argentina`. From that we derive W/D/L, goal difference, goals-for — everything the tiebreakers need.

What if a knockout match is drawn? A drawn regulation result is resolved by an **Elo-weighted coin flip** — a stand-in for extra-time / penalties. It's seeded, so it's reproducible.

> **The short version (for a friend):** "From the difference between two teams' ratings I work out a goal probability, then roll it like dice to make a score — but the dice are weighted toward the stronger team." That's the whole core idea.

---

## 5. Honesty — what I deliberately simplified

What makes a project professional (and honest) is **clearly stating its limitations**. Wherever I found a real published structure, I used it; but in two places I deliberately simplified, and I **documented** it rather than passing it off as "official":

- **Best-thirds allocation** — FIFA has a 495-row table specifying which combination of third-placed groups maps to which bracket slot. Bundling that is impractical, so I wrote a **deterministic solver** that respects the **real per-slot eligibility** — the constraints are real, but the choice among valid options is simplified.
- **Fair-play tiebreaker + venue** — I don't model cards/bookings, so I dropped FIFA's fair-play tiebreaker (inventing card counts would break the "only real data" rule), and I treat group matches as neutral-venue.

This honesty is a **strength** when presenting — point it out to a professor specifically, because it shows you know what you are and aren't modelling.

---

## 6. Live demo — commands + real output

Opening a laptop and running one command during a presentation has the biggest impact. No install needed, just Python.

**A whole tournament, in one command:**

```bash
python -m worldcup run --seed 1 --real-hosts
```

`--real-hosts` places Mexico/Canada/USA into groups A/B/D like the real draw; the rest is a fair draw. The output under `--seed 1` (this is a PREDICTION):

```
  FINAL RESULT (PREDICTION)
  ----------------------------------------
    Champion       Colombia
    Runner-up      Japan
    Third place    Argentina
    Fourth place   Spain
```

A single seeded run = one *possible* tournament, upsets included. To find out how *likely* something is, you run it thousands of times:

**A thousand tournaments — the odds:**

```bash
python -m worldcup predict --sims 1000 --seed 7
```

![Champion probability — 1000 simulations (prediction)](/blog/worldcup/odds.svg)

The teams that are strong in Elo rise to the top — exactly as they should. The champion probabilities across all 48 teams sum to 100%. Changing `--seed` gives a different but equally reproducible sample; raising `--sims` makes the numbers tighter.

> Notice: every output says **"PREDICTION"**. That's not an accident — nowhere in the engine is a simulated result shown as a fact.

---

## 7. Engineering — how the code is organised

A technical audience (a senior dev or teacher) will definitely ask: "is the code clean?" The design is **layered** — each layer has exactly one job:

![Architecture — layered engine, pure logic with separate I/O](/blog/worldcup/architecture.svg)

- **Pure core** (`team`, `elo`, `draw`, `standings`, `knockout`) — logic only, **prints nothing**. That makes it easy to test and easy to reuse.
- **`tournament.py`** — a façade: it holds state, runs the Monte Carlo, and saves/loads via **atomic JSON** (temp file + `os.replace`, so the file can't get corrupted).
- **`cli.py`** — all printing/output lives here, in one place. `python -m worldcup`.
- **`data/teams_2026.json`** — 48 real teams + a real Elo snapshot, **with the date and source cited** — only real data.

On top of all that: **zero runtime dependencies** (pure Python stdlib), **102 tests**, and **GitHub Actions CI** that runs the tests across every combination of Linux/macOS/Windows × Python 3.10–3.13. And the original **OOP demo (`core/` + `main.py`) is completely intact**.

---

## 8. Process — how I built it, step by step

The answer to "how did you build it?" presents best as a clean story. I built it in **4 phases**, then shipped it properly:

![Build process — from OOP demo to a merged engine](/blog/worldcup/process.svg)

1. **Phase 1** — real data + the Elo model + a fair, constrained draw
2. **Phase 2** — simulate the group stage + official tiebreakers + qualifiers (including best-thirds)
3. **Phase 3** — the knockout bracket → champion (+ third-place play-off)
4. **Phase 4** — Monte Carlo `predict` + tests + docs + examples

Then: a feature **branch**, a **Pull Request (#1)**, **CI green** (every OS × every Python version), and finally a **merge into `main`**. So it isn't a throwaway script — it was shipped through a proper git workflow.

---

## 9. How to present it, by audience (the main guide)

Now the real point — what to show and say depending on who you're talking to:

### 🟢 To a friend / beginner student (~2 min)
- Give the **pitch** from Section 1.
- Show the **flow diagram** (the format) — "48 teams down to 1 champion".
- Run `run --seed 1 --real-hosts` on the laptop and show the champion.
- **Don't go near the formula.** Just: "it works out a goal probability from the rating difference and makes a score."

### 🟡 To an advanced student / senior dev (~5 min)
- Everything above + the **model diagram** (Elo → Poisson) for the actual mechanism.
- Run **predict** and show the odds chart — the Monte Carlo idea.
- The **architecture diagram** — layered design, pure core vs cli, 102 tests, CI.

### 🔴 To a teacher / professor (~10 min)
- Everything above + Section 5 (**the honest modelling notes**) — the best-thirds simplification, why fair-play/venue are dropped.
- **Why only real data**, and why every output is labelled PREDICTION.
- Tests + CI + reproducibility (the seed) — i.e. **scientific rigour**.
- The process diagram: the 4-phase build + the PR/CI/merge workflow.
- Talk about trade-offs and future work (see the Q&A below).

### ❓ Common questions + ready answers
- **"Is this a real result?"** → No. The input is real, the output is the model's **prediction**. The tournament hasn't been played.
- **"What is Elo?"** → A rating system (from chess) that measures skill; the difference between two ratings gives a win probability.
- **"Why isn't every run different?"** → I control it with `--seed`, so it's **reproducible**. Same seed = same result.
- **"Is the best-thirds part official?"** → No, it's a **documented simplification** — it respects real eligibility, but the fill is simplified.
- **"Why not deep learning?"** → Elo is **simple, interpretable, needs no training data**, and is reproducible. ML would be overkill here and would need a dataset.
- **"How accurate is it?"** → It's a probabilistic model, not a crystal ball. Sanity check: the strong-Elo teams come out on top in the predictions — which is what you'd expect.

---

## 10. At a glance (cheat sheet)

- **What:** an offline simulation + prediction engine for the real 2026 World Cup (48 teams).
- **Data:** real teams + a real published Elo snapshot (dated, sourced). Only real data.
- **Model:** Elo → win expectancy → expected goals → seeded Poisson scoreline. Knockout draws → Elo-weighted flip.
- **Output:** champion, full bracket, and Monte Carlo probabilities — **all PREDICTION**.
- **Engineering:** layered, pure-core + cli, zero deps, 102 tests, CI (3 OS × 4 Python versions), atomic JSON.
- **Reproducible:** via `--seed`.
- **Original OOP demo:** intact (`python main.py`).
- **Repo:** [github.com/humaidi09/World-Cup-2026](https://github.com/humaidi09/World-Cup-2026)

---

> Final word: every "result" in this project is a model's **prediction** — not a real-world fact. But the **data, rules, and engineering underneath it are all real and honest.** That balance is your strength when you present it.
