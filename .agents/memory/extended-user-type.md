---
name: ExtendedUser type pattern
description: Why ExtendedUser must not use `extends User` from the generated schemas
---

`use-auth.tsx` originally used `export interface ExtendedUser extends User { ... }`. This caused widespread TS2339 errors ("Property X does not exist on type 'ExtendedUser'") across Onboarding.tsx, Profile.tsx, etc., despite `User` having those fields.

**Why:** Cross-package module resolution conflict — `User` imported via `@workspace/api-client-react/src/generated/api.schemas` (direct path) and the `User` type that `useGetCurrentUser` returns (resolved through package root `exports`) are treated as structurally incompatible by `tsc --noEmit`, even though they are the same file at runtime. TypeScript's strict structural checking sees them as different types.

**How to apply:** `ExtendedUser` must declare all User fields (id, fullName, email, phone, country, role, kycStatus, onboardingStep, onboardingComplete, profilePhotoUrl, createdAt) explicitly as its own interface properties, then add the extended fields (mustSetPin, hasPin, pinVerified, isFrozen, frozenReason). Do NOT use `extends User`. Import `LoginRequest`/`RegisterRequest` from `@workspace/api-client-react` (root), not the deep `/src/generated/api.schemas` path.
