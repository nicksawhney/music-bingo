---
name: reference_websearch_blocked
description: WebSearch is blocked by org Vertex policy on this VM — use WebFetch against a known URL instead
metadata: 
  node_type: memory
  type: reference
  modified: 2026-08-26T20:27:20.331Z
  originSessionId: 4608ed91-410b-4f28-bc52-fb13dc22121b
---

The `WebSearch` tool fails on this machine with a Vertex AI org-policy error:
`constraints/vertexai.allowedPartnerModelFeatures ... disallowed feature web_search for
Partner model claude-opus-5`. It is not a transient failure and retrying won't help.

**Why:** EvolutionIQ routes Claude through Vertex AI (see the HIPAA/Vertex rules in the
global CLAUDE.md), and the org policy allowlist doesn't include `web_search`.

**How to apply:** To check a current fact, skip WebSearch and go straight to `WebFetch`
against a URL you can name — Wikipedia, a news front page, a docs site. Fetching two
independent sources is a good substitute for a search when the claim matters (this is how
Dolly Parton's death was confirmed on 2026-08-26, via NPR + Wikipedia).
