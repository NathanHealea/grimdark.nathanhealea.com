---
title: 'How Leaderboard Ranking Works'
description: 'Understand how player rankings and standings are calculated'
category: 'Seasons'
order: 4
role: null
---

# How Leaderboard Ranking Works

The leaderboard ranks players based on their battle report results. Rankings are calculated automatically — there's nothing you need to do beyond submitting published battle reports.

## Scoring

Each game result earns points:

| Result | Points |
|--------|--------|
| Win    | 4      |
| Draw   | 2      |
| Loss   | 1      |

## Rating (Normalized Score)

Players are ranked by their **rating**, not raw points. The rating formula normalizes points by games played so that a player with 3 dominant wins isn't outranked by someone with 10 mediocre results.

The formula is:

> **Rating = (Total Points) / ln(Games Played + 2)**

This means playing more games helps your rating, but with diminishing returns. Quality of results matters more than quantity.

## Tiebreakers

When two players have the same rating, ties are broken in order:

1. **Score Differential** — Victory points scored minus victory points conceded across all games. A higher differential (scoring more than your opponents) ranks you higher.
2. **Raw Points** — Total points from wins, draws, and losses. More games played gives an edge here.

If all three values are identical, the players share the same rank.

## Scope

- **Season Leaderboard** — Rankings are calculated from published battle reports within that season, filtered to players on the season roster.
- **Overall Leaderboard** — Rankings use all published battle reports across every season.

## What Counts

Only **published** battle reports are included in rankings. Draft reports are excluded until they are published.
