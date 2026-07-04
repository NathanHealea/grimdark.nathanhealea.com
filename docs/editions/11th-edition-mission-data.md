# 11th Edition Mission Data

**Epic:** Editions
**Type:** Reference
**Status:** Draft

## Summary

Complete reference data for Warhammer 40,000 11th edition matched play (Chapter Approved 2026-27 Mission Deck): the six deployment zones, the twenty-five primary missions (organized into five Force Disposition decks), the five Force Dispositions, and the surrounding mission components (secondary missions, twists, detachment points). This is the source-of-truth research for seeding the 11th Edition's `deployments` and `missions` lists in the editions data model and admin UI.

## Mission Structure Overview

11th edition replaced the 10th edition "draw a mission card" model with a **Force Disposition matchup** system, delivered via the **Chapter Approved 2026-27 Mission Deck** (included in the Armageddon launch box, released mid-2026).

How a matched play game is composed (condensed from the **Warhammer Event Mission Sequence** in the 11th edition Tournament Companion, transcribed via gdmissions.app/11th/rules/event-companion):

1. **Muster Armies.** Armies are built from detachments purchased with **Detachment Points** (Strike Force = 2000 pts / 3 DP; Incursion = 1000 pts / 2 DP). Each detachment grants access to specific **Force Dispositions**. Before an event: "once they have mustered their army, a player selects one Force Disposition card available to them and records that on their roster" — the disposition is locked for the whole event.
2. **Determine Mission.** "Each player finds their opponent's Force Disposition symbol on their Force Disposition card. The Primary Mission that is listed below that symbol is that player's Primary Mission." Unless both players picked the same disposition (a "mirror" matchup), the two players score **different primary missions** in the same game. There are **15 mission matchups** (5 mirrors + 10 asymmetric pairings) and **25 distinct named primary missions**.
3. **Determine A Layout.** "Each combination of Primary Missions has three recommended layouts, labelled A, B and C" (15 pairings x 3 = the "45-map pack"). The layout — not a standalone deployment card draw — defines the deployment zones, terrain areas, and objective placement for that pairing. Organizers specify the layout or players randomize among A/B/C.
4. **Create The Battlefield.** "Missions are played on rectangular battlefields 44\" by 60\" in size," with terrain areas and terrain features set up as shown on the selected layout.
5. **Determine Attacker And Defender.** Players agree which battlefield edges match the Attacker's and Defender's labelled edges on the layout, then roll off; the winner decides who is Attacker and who is Defender. (The Defender sets up units first; the Attacker resolves redeploys first.)
6. **Select Secondary Missions.** Each player secretly picks **Tactical** (draw two cards from your 18-card secondary deck at the start of each of your Command phases) or **Fixed** (display two chosen Fixed-capable missions face-up for the whole battle). See Other Mission Components.
7. **Declare Battle Formations, Deploy Armies, Determine First Turn, Begin The Battle.** The battle ends after **five battle rounds**.

**Scoring caps** (verbatim from the Tournament Companion "Determine Victor" step): "PRIMARY MISSION 45VP Up to 15VP per battle round — SECONDARY MISSIONS 45VP Up to 15VP per battle round* — BATTLE READY ARMY 10VP — * In addition, you can gain a maximum of 20VP per Fixed Secondary Mission card." This matches the Warhammer Community preview figures.

**Objectives are terrain areas in 11th edition** (Core Rules 14.01, verbatim): "The location of each point should coincide with a terrain area; that terrain area is the objective, and is called a terrain objective. When measuring distances to and from an objective, measure to and from the closest part of it." Control is by summed OC of models within the terrain area, and objectives are **secured** (stay under your control after you leave, until the opponent out-controls you at the end of a phase). This replaces 10th edition's 40mm objective markers.

**Objective vocabulary** used by the mission cards and layouts:

- **Home objective** — an objective in each player's deployment zone (one per player on most layouts).
- **Expansion objectives** — objectives in No Man's Land closer to one player's deployment zone.
- **Central objective(s)** — layouts have **five or six objectives**: five-objective layouts have one large central objective; six-objective layouts split it into two smaller triangular central objectives (per Tabletop Battles, consistent across all five disposition reviews).

Several primary missions also use **Operation Markers** (six push-out tokens included in the deck) placed by mission-specific **Objective Actions**.

*Sources: gdmissions.app/11th/rules/event-companion and /11th/rules/core-rules (verbatim), warhammer-community.com Chapter Approved preview articles, warhammer.com product listing, tabletopbattles.com "An Introduction to Missions in 11th Edition." See Sources.*

## Deployment Zones

The Chapter Approved 2026-27 Mission Deck contains **6 Deployment cards** (per the warhammer.com product listing), and six deployment names are used across the layouts. The six names are confirmed by gdmissions.app (GDM 2026) and Tabletop Battles' disposition reviews; they carry over the six deployment names used in late 10th edition.

**How deployments are actually used in 11th:** objective placement is **not** a fixed property of a deployment card. Each of the 15 primary-mission pairings has **three recommended layouts (A/B/C)**; each layout combines one of the six deployment zone shapes with a pairing-specific terrain-area and objective arrangement (five or six terrain objectives). The Tournament Companion: "Each combination of Primary Missions has three recommended layouts, labelled A, B and C." Layouts also label the **Attacker's and Defender's battlefield edges**. So for seed data, the six deployment names below are the stable list; objective counts/positions belong to the mission-pairing layouts.

| # | Deployment | Notes found in sources |
|---|------------|------------------------|
| 1 | Crucible of Battle | "Clean, classic, but a tad more tactical" (diagonal-style zones) |
| 2 | Dawn of War | Long-edge deployment; zones reported as 10" deep off the long edges (single-source: Spikey Bits) |
| 3 | Hammer and Anvil | Short-edge deployment; zones reported as 18" deep off the short edges (single-source: Spikey Bits) |
| 4 | Search and Destroy | Quarter-style zones |
| 5 | Sweeping Engagement | Staggered long-edge zones |
| 6 | Tipping Point | Players "start a bit further apart"; on some layouts the expansion objectives sit just outside the deployment zones |

Deployments named per pairing in Tabletop Battles' reviews (partial — only the pairings the articles specify):

| Mission pairing | Recommended deployments (A/B/C) |
|---|---|
| Reconnaissance Sweep / Purge and Secure | Tipping Point, Dawn of War, Search and Destroy |
| Triangulation / Consecrate | Hammer and Anvil, Dawn of War, Crucible of Battle |
| Gather Intel (Recon mirror) | Sweeping Engagement, Crucible of Battle, Tipping Point |
| Surveil the Foe / Smoke and Mirrors | Tipping Point, Dawn of War, Search and Destroy |
| Search and Scour / Vanguard Operation | Crucible of Battle, Sweeping Engagement, Tipping Point |
| Secure Asset / Inescapable Dominion | Dawn of War, Hammer and Anvil, Crucible of Battle |
| Vital Link / Destroyer's Wrath | Dawn of War, Hammer and Anvil, Search and Destroy |
| Sabotage (PA mirror) | Sweeping Engagement, Crucible of Battle, Tipping Point |
| Extract Relic / Locate and Deny | Sweeping Engagement, Tipping Point, Search and Destroy |
| Death Trap / Determined Acquisition | Hammer and Anvil, Sweeping Engagement, Crucible of Battle |

Remaining five pairings' deployments: (not found in sources).

> **Accuracy note:** No fetched source published the layout card faces (exact zone dimensions and objective coordinates). The six names and the six-card count are solid; the two zone depths above are single-source (Spikey Bits) and should be verified against the physical cards before being treated as rules text. gdmissions.app's rules pages confirm: "Deployment zones themselves are defined per-layout … there is no generic deployment-map list."

## Primary Missions

There are **25 named primary missions**, organized as five per Force Disposition deck. You always score the mission from **your own** disposition's deck that matches your **opponent's** disposition. Full card text below was transcribed verbatim from gdmissions.app (GDM 2026), which renders the official card text and structured card data.

Common template notes:

- The recurring trigger "End of your Command phase (or the end of your turn in the fifth battle round)" confirms a five-battle-round game with primary progress scored from the second battle round onwards.
- "For each ..." lines score per qualifying instance; "+N VP (cumulative)" lines stack on top of the preceding line; "or" lines are mutually exclusive alternatives.
- Several missions have a mission-specific **Objective Action** printed on the card's reverse ("Scoring is on the front (side 1/2). This side is the mission's Objective Action."). All such actions start in your Shooting phase.
- No per-card VP caps are printed on any card; caps are governed by the mission pack rules (see Overview and Open Questions).

### Take and Hold deck

*Deck theme: hold objectives; the only deck that can reward holding your home objective.*

#### Battlefield Dominance (vs Take and Hold — mirror)

**FIRST & SECOND BATTLE ROUND — End of your turn**
- **2 VP:** You control more **objectives** than your opponent.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **3 VP each:** For each **objective** you control.
- **+2 VP each (cumulative):** For each of those **objectives** (excluding your **home objective**) if you control your **home objective**.

#### Determined Acquisition (vs Disruption)

**ANY BATTLE ROUND — End of your turn**
- **2 VP each:** For each **objective** you control that you did not control at the start of the turn (excluding your **home objective**).

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **3 VP each:** For each **objective** you control.
- **+3 VP each (cumulative):** For each of those **objectives** that is within your opponent's territory.

#### Immovable Object (vs Purge the Foe)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** You control one or more **central objectives**.

**SECOND TO FOURTH BATTLE ROUND — End of your Command phase**
- **5 VP each:** For each **objective** you control (excluding your **home objective**).

**FIFTH BATTLE ROUND — End of your turn**
- **5 VP each:** For each **objective** you control (excluding your **home objective**).

#### Inescapable Dominion (vs Priority Assets)

**ANY BATTLE ROUND — End of your turn**
- **4 VP:** You control **three or more objectives**.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **5 VP:** You control **two or more objectives**.
- **4 VP:** You control more **objectives** than your opponent.

**END OF BATTLE**
- **5 VP:** You control your opponent's **home objective**.

#### Purge and Secure (vs Reconnaissance)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** One or more enemy units were **destroyed** this turn by a friendly unit that was within range of one or more **objectives**.
- *or* **3 VP:** One or more enemy units that started the turn within range of one or more **objectives** were **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP each:** For each **objective** you control (excluding your **home objective**).

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **3 VP:** You control one or more **objectives** you did not control at the start of the turn (excluding your **home objective**).

### Purge the Foe deck

*Deck theme: destroy enemy units while contesting objectives.*

#### Consecrate (vs Reconnaissance)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** **One or two** objectives are **consecrated**.
- *or* **6 VP:** **Three or more** objectives are **consecrated**.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).
- **4 VP:** You control **more** objectives than your opponent.

**END OF BATTLE**
- **5 VP:** The enemy **home objective** has been **consecrated**.

*("Consecrated" mechanic, paraphrased from Tabletop Battles' Purge the Foe review — exact card-reverse text not found in sources: a friendly unit that destroys an enemy unit becomes a **Consecration unit**; at the end of your turn, each Consecration unit within range of a non-home objective that is not yet consecrated places a marker there and that objective becomes **consecrated** — you do not need to control the objective.)*

#### Destroyer's Wrath (vs Priority Assets)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** One or more enemy units were **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).
- **6 VP:** You control more **objectives** than your opponent.

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **4 VP:** More enemy units were **destroyed** this turn than friendly units were **destroyed** in the previous turn.

#### Meatgrinder (vs Purge the Foe — mirror)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** One or more enemy units were **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **5 VP:** More enemy units were **destroyed** this turn than friendly units were **destroyed** in the previous turn.
- **5 VP:** You control your opponent's **home objective**.

#### Punishment (vs Disruption)

**ANY BATTLE ROUND — End of a turn** *(either player's turn)*
- **5 VP:** One or more **condemned** enemy units left the battlefield this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).
- **5 VP:** You control more **objectives** than your opponent.

**END OF BATTLE**
- **8 VP:** You control your opponent's **home objective**.

*("Condemned" mechanic, paraphrased from Tabletop Battles' Purge the Foe review — exact card-reverse text not found in sources: at the start of each of your turns, choose three enemy units on the battlefield that are within range of an objective and/or destroyed a friendly unit last turn (if none qualify, choose one enemy unit); those units are **condemned**. "Left the battlefield" includes being destroyed, embarking, or returning to reserves.)*

#### Unstoppable Force (vs Take and Hold)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** One or more enemy units were **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP each:** For each **objective** you control (excluding your **home objective**).

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **3 VP:** You control one or more **objectives** you did not control at the start of the turn (excluding your **home objective**).

**END OF BATTLE**
- **5 VP:** You control one or more **central objectives**.

### Reconnaissance deck

*Deck theme: "Scout the battlefield and seize key intelligence positions" — get around the table and perform actions.*

#### Gather Intel (vs Reconnaissance — mirror)

**FIRST BATTLE ROUND — End of your turn**
- **6 VP:** You control one or more **central objectives**.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **7 VP each:** For each friendly unit that **extracted intelligence** this turn (see reverse).

**END OF BATTLE**
- **5 VP:** Three or more of your **operation markers** are on the battlefield.
- **5 VP:** One of your **operation markers** is within range of your opponent's **home objective**.

**Reverse — EXTRACT INTELLIGENCE (Objective Action)**
- **STARTS:** Your Shooting phase, from the second battle round onwards.
- **UNITS:** One friendly unit within range of an **objective** (excluding your **home objective**) that does not have any of your **operation markers** within range of it.
- **USE LIMIT:** Unlimited. Each unit that starts this action this phase must be within range of a different **objective**.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** Your unit **extracts intelligence** — place one of your **operation markers** within range of that **objective**.

#### Reconnaissance Sweep (vs Take and Hold)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** Three or more friendly units are wholly within three different table quarters and not within 6" of the centre of the battlefield.
- *or* **6 VP:** Four or more friendly units are wholly within four different table quarters and not within 6" of the centre of the battlefield.

**ANY BATTLE ROUND — End of your turn**
- **1 VP each:** For each enemy unit **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **3 VP:** You control one or more **objectives** (excluding your **home objective**).

#### Search and Scour (vs Priority Assets)

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** You control one or more **central objectives**.
- **2 VP:** One or more enemy units that started the turn within a **terrain area** are **destroyed**.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP each:** For each **objective** you control (excluding your **home objective**).

**END OF BATTLE**
- **5 VP:** No enemy units are wholly within your territory.

#### Surveil the Foe (vs Disruption)

**Special rule (card front):** Each time a friendly unit ends a move within range of an **objective** that has enemy **operation markers** within range of it, remove those **operation markers** from the battlefield.

**ANY BATTLE ROUND — End of your turn**
- **4 VP:** One or more enemy units were **surveilled** this turn (see reverse), unless each of those units is within range of one or more **objectives** that have one or more **operation markers** within range of them.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).
- **4 VP:** You control more **objectives** than your opponent.

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **5 VP:** No enemy **operation markers** are on the battlefield.

**Reverse — SURVEIL THE FOE (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit.
- **USE LIMIT:** Unlimited.
- **COMPLETES:** Immediately.
- **EFFECT:** Select one enemy unit within 18" of your unit that is visible to it and has not yet been **surveilled** this turn. Until the end of the turn, that enemy unit is **surveilled**.

#### Triangulation (vs Purge the Foe)

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **3 VP:** One **objective** is **triangulated** (see reverse).
- *or* **6 VP:** Two **objectives** are **triangulated**.
- *or* **10 VP:** Three or more **objectives** are **triangulated**.

**END OF BATTLE**
- **10 VP:** You control **four or more objectives**.

**Reverse — TRIANGULATE (Objective Action)**
- **STARTS:** Your Shooting phase, from the second battle round onwards.
- **UNITS:** One friendly unit within range of an **objective** (excluding your **home objective**).
- **USE LIMIT:** Once per turn.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** That **objective** is **triangulated** — place one of your **operation markers** within range of that **objective**.

### Priority Assets deck

*Deck theme: "Capture and hold the high value assets scattered across the field."*

#### Extract Relic (vs Disruption)

**ANY BATTLE ROUND — End of your turn**
- **4 VP:** A friendly unit performed a **sensor sweep** this turn (see reverse).
- **3 VP:** One or more enemy units that started the turn within range of one or more **objectives** are **destroyed**.
- **4 VP:** Only one of your opponent's **operation markers** is on the battlefield, if one or more of your units are within the same terrain area as that **operation marker**, and no enemy units are within that terrain area.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**END OF BATTLE**
- **5 VP:** Only one of your opponent's **operation markers** is on the battlefield, if one or more of your units are within the same terrain area as that **operation marker**, and no enemy units are within that terrain area.

**Reverse — SENSOR SWEEP (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within range of a **central objective**.
- **USE LIMIT:** Once per turn.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** Your unit performs a **sensor sweep** — remove one **operation marker** from the battlefield.
- **RESTRICTIONS:** A unit cannot start this action if only one **operation marker** remains on the battlefield.

#### Sabotage (vs Priority Assets — mirror)

**ANY BATTLE ROUND — End of your turn**
- **3 VP each:** For each friendly unit that **committed sabotage** this turn (see reverse).
- **+2 VP each (cumulative):** For each of those **units** that is within range of one or more **objectives** in your opponent's territory.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**Reverse — SABOTAGE (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One unit within range of an **objective** (excluding your **home objective**).
- **USE LIMIT:** Unlimited. Each unit that starts this action this phase must be within range of a different **objective**.
- **COMPLETES:** End of your turn, if that unit controls that **objective**.
- **EFFECT:** Your unit **commits sabotage**.

#### Secure Asset (vs Take and Hold)

**ANY BATTLE ROUND — End of your turn**
- **4 VP:** A friendly unit **secured the asset** this turn (see reverse).
- **2 VP:** One or more enemy units that started the turn within range of one or more **central objectives** are **destroyed**.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).
- **4 VP:** You control **three or more objectives**.

**Reverse — SECURE ASSET (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within range of an **objective** (excluding your **home objective**).
- **USE LIMIT:** Once per turn.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** Your unit **secures the asset**.

#### Vanguard Operation (vs Reconnaissance)

**ANY BATTLE ROUND — End of your turn**
- **4 VP:** A friendly unit performed a **vanguard operation** this turn (see reverse).
- **2 VP:** One or more enemy units were **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**END OF BATTLE**
- **10 VP:** You control your opponent's **home objective**.

**Reverse — VANGUARD OPERATION (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within a terrain area located in enemy territory.
- **USE LIMIT:** Once per turn.
- **COMPLETES:** End of your turn, provided no enemy units are within that terrain area.
- **EFFECT:** Your unit performs a **vanguard operation**.

#### Vital Link (vs Purge the Foe)

**ANY BATTLE ROUND — End of your turn**
- **2 VP:** You control one or more **central objectives**.
- **+1 VP each (cumulative):** For each of your **operation markers** within range of one of those **objectives** (see reverse).

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).
- **+4 VP (cumulative):** One or more of those **objectives** is a **central objective**.

**END OF BATTLE**
- **10 VP:** You control your opponent's **home objective**.

**Reverse — MAINTAIN CONTROL (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within range of one **central objective**.
- **USE LIMIT:** Once per turn.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** Place one of your **operation markers** within range of that **objective**.

### Disruption deck

*Deck theme: "Disrupt the enemy battle plan and deny them the field."*

#### Death Trap (vs Take and Hold)

**ANY BATTLE ROUND — End of your turn**
- **2 VP each:** For each terrain area **trapped** this turn (see reverse).
- **+3 VP each (cumulative):** For each of those **terrain areas** that is an **objective**.

**ANY BATTLE ROUND — End of your turn**
- **3 VP:** One or more enemy units that started the turn within a terrain area were destroyed, if that terrain area is **trapped**.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**Reverse — BOOBY TRAP (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within range of an **objective** (excluding your **home objective**), or within a terrain area outside your deployment zone that is not yet **trapped**.
- **USE LIMIT:** Unlimited. Each unit initiating this action this phase must be within a different terrain area.
- **COMPLETES:** Immediately.
- **EFFECT:** That terrain area is **trapped** — place one of your operation markers within that terrain area.

#### Delaying Action (vs Purge the Foe)

**ANY BATTLE ROUND — End of your turn**
- **2 VP each:** For each enemy unit **destroyed** this turn.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding **home objectives**).

**SECOND BATTLE ROUND ONWARDS — End of your turn**
- **3 VP:** You control one or more **central objectives** and one or more **expansion objectives**.

#### Locate and Deny (vs Priority Assets)

**ANY BATTLE ROUND — End of your turn**
- **4 VP:** One or more enemy units that started the turn within range of one or more **objectives** are **destroyed**.
- **4 VP:** Only one of your operation markers remains (see reverse), with a unit of yours in that terrain area and no enemy units there.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**END OF BATTLE**
- **5 VP:** Only one of your operation markers remains, with a unit of yours in that terrain area and no enemy units there.

**Reverse — SENSOR SWEEP (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within range of a central **objective**.
- **USE LIMIT:** Once per turn.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** Your unit performs a **sensor sweep** — remove one operation marker from the battlefield.
- **RESTRICTION:** A unit cannot start this action if only one operation marker remains on the battlefield.

*(Setup, paraphrased from Tabletop Battles' Disruption review — exact card text not found in sources: "at the start of the battle, select 5 terrain areas not within your DZ and place an operation marker in them." The paired Priority Assets mission Extract Relic describes the same setup from the other side, and both players have access to the Sensor Sweep action. The articles disagree on whether this pairing's layouts have five or six objectives.)*

#### Outmanoeuvre (vs Disruption — mirror)

**ANY BATTLE ROUND — End of your turn**
- **10 VP:** You control the enemy **home objective**.

**FIRST BATTLE ROUND — End of your turn**
- **4 VP each:** For each **objective** you control (excluding your **home objective**).

**SECOND & THIRD BATTLE ROUND — End of your Command phase**
- **5 VP each:** For each **objective** you control (excluding your **home objective**).

**FOURTH BATTLE ROUND ONWARDS — End of your turn**
- **6 VP each:** For each **objective** you control (excluding your **home objective**).

#### Smoke and Mirrors (vs Reconnaissance)

**ANY BATTLE ROUND — End of your turn**
- **2 VP each:** For each **objective** that is **decoyed** (see reverse).
- **+2 VP each (cumulative):** For each of those **objectives** that is within your opponent's territory.

**SECOND BATTLE ROUND ONWARDS — End of your Command phase (or the end of your turn in the fifth battle round)**
- **4 VP:** You control one or more **objectives** (excluding your **home objective**).

**END OF BATTLE**
- **10 VP:** **Four or more objectives** are **decoyed**.

**Reverse — DECOY (Objective Action)**
- **STARTS:** Your Shooting phase.
- **UNITS:** One friendly unit within range of an **objective** (excluding your **home objective**) that is not a **decoy**.
- **USE LIMIT:** Unlimited. Each unit that starts this action this phase must be within range of a different **objective**.
- **COMPLETES:** End of your turn, if your unit controls that **objective**.
- **EFFECT:** That **objective** becomes a **decoy** — place one of your **operation markers** within range of that **objective**.

## Force Dispositions

The deck contains **10 Force Disposition cards** (two copies of each of the five dispositions, one per player). Each detachment lists which Force Disposition(s) it grants, along with its Detachment Points cost (Core Rules 25.04, verbatim: "You can now use your DP to select detachments for your army. … Each one will give you access to different force dispositions, detachment rules, enhancements and/or stratagems to use in the coming battle.").

**The card faces carry no prose rules text.** Each Force Disposition card is a lookup table: header "FORCE DISPOSITION - YOUR STANCE", the disposition name, and a three-column table ("YOU | MISSION | OPPONENT") mapping the opponent's disposition to the primary mission *you* play (transcribed verbatim from the gdmissions.app card images). gdmissions.app describes the cards' function as: "Force disposition cards determine the primary mission deck in play."

**When they apply:** in casual play, players choose their Force Disposition before each game; at Warhammer Events, "once they have mustered their army, a player selects one Force Disposition card available to them and records that on their roster" — locked for the whole event.

### Take and Hold (card 01/05)

*Theme (per Tabletop Battles): no actions — purely rewards holding objectives; the only deck that can reward holding your home objective.*

| Your Primary Mission | vs Opponent Disposition |
|---|---|
| Immovable Object | vs Purge the Foe |
| Battlefield Dominance | vs Take and Hold |
| Determined Acquisition | vs Disruption |
| Purge and Secure | vs Reconnaissance |
| Inescapable Dominion | vs Priority Assets |

### Purge the Foe (card 02/05)

*Theme: kill enemy units while holding objectives; Tabletop Battles' consensus pick as the strongest disposition.*

| Your Primary Mission | vs Opponent Disposition |
|---|---|
| Unstoppable Force | vs Take and Hold |
| Meatgrinder | vs Purge the Foe |
| Punishment | vs Disruption |
| Consecrate | vs Reconnaissance |
| Destroyer's Wrath | vs Priority Assets |

### Reconnaissance (card 03/05)

*Theme: get around the table — table quarters and location-specific actions; rewards holding an objective outside your deployment zone each round.*

| Your Primary Mission | vs Opponent Disposition |
|---|---|
| Reconnaissance Sweep | vs Take and Hold |
| Triangulation | vs Purge the Foe |
| Surveil the Foe | vs Disruption |
| Gather Intel | vs Reconnaissance |
| Search and Scour | vs Priority Assets |

### Priority Assets (card 04/05)

*Theme: the most action-driven — a special action in every mission on top of holding objectives; actions complete at the end of your turn.*

| Your Primary Mission | vs Opponent Disposition |
|---|---|
| Secure Asset | vs Take and Hold |
| Vital Link | vs Purge the Foe |
| Extract Relic | vs Disruption |
| Vanguard Operation | vs Reconnaissance |
| Sabotage | vs Priority Assets |

### Disruption (card 05/05)

*Theme: hit-and-run — early scoring and mid-board control; per Tabletop Battles, no Disruption mission ever scores your own home objective.*

| Your Primary Mission | vs Opponent Disposition |
|---|---|
| Death Trap | vs Take and Hold |
| Delaying Action | vs Purge the Foe |
| Outmanoeuvre | vs Disruption |
| Smoke and Mirrors | vs Reconnaissance |
| Locate and Deny | vs Priority Assets |

*Sources: gdmissions.app/11th/force-disposition card images (verbatim tables), gdmissions.app/11th/rules/event-companion, tabletopbattles.com "An Introduction to Missions in 11th Edition" (themes).*

## Other Mission Components (brief)

### Secondary Missions

Separate **Attacker** (18 cards) and **Defender** (18 cards) decks — same 18 mission names, mirrored per role (gdmissions.app currently publishes only the Defender deck; attacker card images exist in its assets). Each card carries both a **FIXED** and a **TACTICAL** scoring section ("SECONDARY - FIXED / TACTICAL").

At step 6 of the mission sequence each player secretly picks a mode, then reveals:

- **Fixed:** display two chosen Fixed Missions face-up; "Fixed Missions cannot be discarded and are active for you throughout the battle." Fixed missions are "those marked with the symbol shown on the left" — Tabletop Battles reports the Fixed-capable list as four missions: **Assassination, Bring it Down, A Grievous Blow, Engage on All Fronts** (see Open Questions for the conflict with the cards' dual-format layout). Max **20 VP per Fixed card** per game.
- **Tactical:** shuffle your secondary deck; "At the start of your Command phase, draw two Secondary Missions face-up"; no hand limit; scoring is optional (unscored cards stay active); at the end of your turn you may discard active missions for **1 CP**; once per battle at the end of your Command phase you may spend 1 CP to discard one active mission and draw a new one.
- Caps: **15 VP per battle round, 45 VP per game** from secondaries (verbatim cap table in the Overview).

The 18 secondary mission names (verbatim from gdmissions.app/11th/secondary-missions):

1. A Grievous Blow
2. A Tempting Target
3. Assassination
4. Beacon
5. Behind Enemy Lines
6. Bring it Down
7. Burden of Trust
8. Centre Ground
9. Cleanse
10. Defend Stronghold
11. Display of Might
12. Engage on All Fronts
13. Forward Position
14. No Prisoners
15. Outflank
16. Overwhelming Force
17. Plunder
18. Secure No Man's Land

Notable lineage (per Tabletop Battles): **A Grievous Blow** replaces Cull the Horde (targets enemy units with a Starting Strength of 13+), **Forward Position** reworks Capture Enemy Outpost, **Plunder** replaces Sabotage-the-secondary, **Centre Ground** replaces Area Denial, **Burden of Trust** moves from primary to secondary, **Beacon** is new (keep a chosen unit alive outside your deployment zone).

### Twist cards

6 optional Twist cards that add environmental rules or modify both armies (e.g. **Night Fighting** returns; **Martial Pride** makes both armies' battleline units faster). Twists do not appear in the Warhammer Event Mission Sequence — they are an optional layer. Full list of the 6 names: (not found in sources).

### Detachment Points

Battle size sets your DP budget (Core Rules 25.03): Incursion — 1000 pts, 2 DP, 2 enhancements; Strike Force — 2000 pts, 3 DP, 4 enhancements. Detachments cost DP and grant Force Dispositions, detachment rules, enhancements, and stratagems (browsable on gdmissions.app/11th/detachments).

### Operation Markers

6 push-out tokens used by mission Objective Actions (triangulation, decoys, booby traps, sensor sweeps, etc.). Placement, persistence, and removal rules are mission-specific and printed on the relevant primary mission card reverses (see Primary Missions).

### Warhammer Event Companion

The tournament layer: the Tournament Companion mission sequence (14 steps, condensed in the Overview) plus Doubles, Teams, and Dominatus companions. Key event rule: you lock one Force Disposition at list submission for the whole event. Includes the recommended layouts (three per mission pairing) and pairing/ranking advice. **Battle Ready painting is worth 10 VP** at Determine Victor.

## Combinations / Pairings

The 5x5 Force Disposition matrix (from gdmissions.app/11th/matrix). Read: **your disposition (row) vs opponent's disposition (column) → the primary mission you score**.

| You \ Opponent | Take and Hold | Purge the Foe | Reconnaissance | Priority Assets | Disruption |
|---|---|---|---|---|---|
| **Take and Hold** | Battlefield Dominance | Immovable Object | Purge and Secure | Inescapable Dominion | Determined Acquisition |
| **Purge the Foe** | Unstoppable Force | Meatgrinder | Consecrate | Destroyer's Wrath | Punishment |
| **Reconnaissance** | Reconnaissance Sweep | Triangulation | Gather Intel | Search and Scour | Surveil the Foe |
| **Priority Assets** | Secure Asset | Vital Link | Vanguard Operation | Sabotage | Extract Relic |
| **Disruption** | Death Trap | Delaying Action | Smoke and Mirrors | Locate and Deny | Outmanoeuvre |

- Any disposition may face any other — there are no illegal pairings in the sources found.
- Each pairing has three recommended layouts (A/B/C), each on one of the six deployments — see the per-pairing deployment table in Deployment Zones. Organizers specify a layout or players randomize among the three.
- Layouts have five or six terrain objectives (five = one large central objective; six = two smaller triangular central objectives).

## Seed Data Candidates

### Deployments (6)

- Crucible of Battle
- Dawn of War
- Hammer and Anvil
- Search and Destroy
- Sweeping Engagement
- Tipping Point

### Missions (25)

Take and Hold deck:

- Battlefield Dominance
- Determined Acquisition
- Immovable Object
- Inescapable Dominion
- Purge and Secure

Purge the Foe deck:

- Consecrate
- Destroyer's Wrath
- Meatgrinder
- Punishment
- Unstoppable Force

Reconnaissance deck:

- Gather Intel
- Reconnaissance Sweep
- Search and Scour
- Surveil the Foe
- Triangulation

Priority Assets deck:

- Extract Relic
- Sabotage
- Secure Asset
- Vanguard Operation
- Vital Link

Disruption deck:

- Death Trap
- Delaying Action
- Locate and Deny
- Outmanoeuvre
- Smoke and Mirrors

### Force Dispositions (5)

- Take and Hold
- Purge the Foe
- Reconnaissance
- Priority Assets
- Disruption

### Secondary Missions (18 — optional, if scope expands beyond deployments/missions)

A Grievous Blow; A Tempting Target; Assassination; Beacon; Behind Enemy Lines; Bring it Down; Burden of Trust; Centre Ground; Cleanse; Defend Stronghold; Display of Might; Engage on All Fronts; Forward Position; No Prisoners; Outflank; Overwhelming Force; Plunder; Secure No Man's Land.

## Open Questions

1. **Deployment card dimensions.** Exact deployment-zone dimensions and objective coordinates were not published by any fetched source. The only figures found (Dawn of War 10" deep, Hammer and Anvil 18" deep) are single-source (Spikey Bits) and unverified. Verify against the physical cards or the Warhammer 40,000 app before treating as rules text.
2. **Fixed secondary list conflict.** Tabletop Battles says Fixed secondaries are chosen "from a list of four" (Assassination, Bring it Down, A Grievous Blow, Engage on All Fronts), but the gdmissions.app card data shows every secondary card carrying both a FIXED and a TACTICAL section (e.g. A Grievous Blow). The Tournament Companion says Fixed missions are "those marked with the symbol" — the exact set of symbol-marked cards was not confirmed. Trusting Tabletop Battles' four-mission list until the deck can be checked.
3. **Twist card names.** Only 2 of the 6 Twist names were found (Night Fighting, Martial Pride). Spikey Bits published a nine-twist list, but it appears to describe the 10th edition CA 2025-26 deck (which is why it is excluded here).
4. **Consecrate / Punishment / Locate and Deny card reverses.** The "consecrated" and "condemned" definitions and the Locate and Deny marker-setup text are paraphrased from Tabletop Battles, not transcribed from the cards; gdmissions.app does not render those card reverses.
5. **Locate and Deny / Extract Relic objective count.** Tabletop Battles' Priority Assets review calls the pairing "a six-objective mission" while its Disruption review labels it "[5 Objectives]" — unresolved.
6. **Attacker secondary deck.** gdmissions.app publishes only the Defender secondary cards (attacker assets exist but pages 404). Whether Attacker/Defender versions differ beyond mirrored role text: (not found in sources).
7. **Missing per-pairing deployments.** Recommended A/B/C deployments were found for 10 of 15 pairings (Tabletop Battles); the remaining five (Battlefield Dominance, Immovable Object/Unstoppable Force, Meatgrinder, Punishment/Delaying Action, Outmanoeuvre) were not named in any source.
8. **10th edition trap document.** The widely-linked "Chapter Approved Tournament Companion" PDF (eng_11-02) is the **10th edition** CA 2025-26 companion (Linchpin, Terraform, 50/40/10 VP split). Do not use it for 11th edition data; the 11th edition Tournament Companion content here comes from gdmissions.app/11th/rules/event-companion. A direct GW PDF link for the main 11th Event Companion was not found (only Doubles/Teams/Dominatus PDFs).

## Sources

- **gdmissions.app (GDM 2026)** — primary/authoritative for verbatim card data: [/11th](https://gdmissions.app/11th), [/11th/primary-missions](https://gdmissions.app/11th/primary-missions) (all 25 card texts + card images), [/11th/force-disposition](https://gdmissions.app/11th/force-disposition) (5 card images, transcribed), [/11th/matrix](https://gdmissions.app/11th/matrix), [/11th/secondary-missions](https://gdmissions.app/11th/secondary-missions) (18 names), [/11th/rules/event-companion](https://gdmissions.app/11th/rules/event-companion) (Warhammer Event Mission Sequence, VP cap table), [/11th/rules/core-rules](https://gdmissions.app/11th/rules/core-rules) (battle sizes/DP, terrain objectives).
- **Warhammer Community** — official previews: [The Chapter Approved deck – What is it and how does it work?](https://www.warhammer-community.com/en-gb/articles/p3i6aa3h/the-chapter-approved-deck-what-is-it-and-how-does-it-work/) plus the mission-system and Armageddon preview articles (deck contents, caps, Night Fighting/Martial Pride twists).
- **warhammer.com** — [Chapter Approved 2026-27: Mission Deck product listing](https://www.warhammer.com/en-US/shop/warhammer-40k-chapter-approved-mission-deck-2026-eng) (card counts: 6 deployment, 10 force disposition, 30 primary, 18+18 secondary, 6 twist, 6 operation markers).
- **Tabletop Battles** — six deep-dive reviews (Jun 2026): [An Introduction to Missions in 11th Edition](https://www.tabletopbattles.com/40k-an-introduction-to-missions-in-11th-edition/) and the five Force Disposition reviews ([Take and Hold](https://www.tabletopbattles.com/40k-11th-edition-force-disposition-review-take-and-hold), [Purge the Foe](https://www.tabletopbattles.com/40k-11th-edition-force-disposition-review-purge-the-foe), [Priority Assets](https://www.tabletopbattles.com/40k-11th-edition-force-disposition-review-priority-assets), [Reconnaissance](https://www.tabletopbattles.com/40k-11th-edition-force-disposition-review-reconnaissance), [Disruption](https://www.tabletopbattles.com/40k-11th-edition-force-disposition-review-disruption)) — corroboration, deployment-per-pairing table, secondary lineage, disposition themes.
- **Spikey Bits** — [Warhammer 40k 11th Edition Rules](https://spikeybits.com/warhammer-40k-11th-edition-rules/) and [Force Dispositions article](https://spikeybits.com/chapter-approved-deck-2026-force-dispositions-decide-what-the-game-is-about/) — deployment depth figures (single-source, unverified).
- **Distrusted/excluded:** Spikey Bits' CA mission-deck objectives article and the eng_11-02 Tournament Companion PDF (both 10th edition content); Wahapedia `wh40k11ed` URLs (served 9th edition content); Bell of Lost Souls (HTTP 403, unfetchable).
