---
name: feedback-bingobaker-rate-limit
description: BingoBaker is a small site that rate-limits — run card generation sequentially with delays between rounds
metadata: 
  node_type: memory
  type: feedback
  originSessionId: c88589ff-86fa-450b-8bd2-172607af4a50
---

BingoBaker is a small website maintained by one person. Don't overload it with parallel requests.

**Why:** We've been rate-limited before when hitting it too hard.

**How to apply:** Run `bingobaker.js create` for each round sequentially, not in parallel. Add a pause between rounds if needed. Related: [[feedback-bingobaker-settings]]
