---
name: Studio history persistence
description: Durable media history must distinguish reload-safe URLs from session-only previews.
---

Temporary object URLs are session-only: persist only reload-safe media URLs, and keep a visible fallback when a stored image or poster can no longer load.

**Why:** Generated media providers may return URLs that expire or stop working after a reload, while browser storage can also reject large data URLs.

**How to apply:** Any future studio history or gallery change should validate URLs before persistence, tolerate storage failures, and keep removal available for unavailable items.