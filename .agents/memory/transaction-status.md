---
name: TransactionStatus missing "processing"
description: The generated TransactionStatus enum only has 3 values; UI needs string cast for extra comparisons
---

`TransactionStatus` from generated schemas has only: `{ pending, completed, failed }`. There is no `"processing"` value.

**Why:** The OpenAPI spec's transaction status enum doesn't include "processing". Some UI code compares `tx.status === "processing"` for display coloring — TypeScript correctly flags this as an impossible comparison.

**How to apply:** When comparing `tx.status` against values outside the enum (like `"processing"`), cast first: `(tx.status as string) === "processing"`. For UI color/badge logic, store `const s = tx.status as string` and compare against `s`.
