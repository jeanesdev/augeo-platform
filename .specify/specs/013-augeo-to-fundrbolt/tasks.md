# Tasks: Augeo to Fundrbolt Rename

**Feature**: 013-augeo-to-fundrbolt
**Branch**: `013-augeo-to-fundrbolt`
**Date**: 2025-12-17
**Status**: Ready for Implementation

---

## Overview & Strategy

This task breakdown implements a comprehensive brand rename from Augeo to Fundrbolt across source code, infrastructure, GitHub, Azure resources, and documentation. The feature is organized into **5 phases**:

1. **Phase 1 (Setup)**: Preparation & prerequisites
2. **Phase 2 (Foundational)**: Shared infrastructure and tooling
3. **Phase 3 (US1)**: Customer-facing brand consistency
4. **Phase 4 (US2)**: Operations & infrastructure alignment
5. **Phase 5 (US3)**: Legacy reference redirects
6. **Phase 6 (Polish)**: Final verification, testing, and documentation

**MVP Scope**: Completing Phase 1 + Phase 2 + Phase 3 (US1) gives an MVP where all visible customer surfaces display Fundrbolt branding consistently.

**Implementation Strategy**: Execute phases sequentially to catch issues early. Phases 3–5 can be tested independently once foundational setup completes.

---

## Parallel Execution Opportunities

- **Within Phase 2**: Backend code rename (T009–T013) + Frontend code rename (T014–T019) can run in parallel
- **Within Phase 3**: API branding (T021) + Email templates (T022) + PWA manifests (T023) can run in parallel
- **Within Phase 4**: Bicep infrastructure (T025) + GitHub Actions (T026) + Secrets (T027) can run in parallel

---

## Phase 1: Setup

### Story Goal

Set up branch, verify prerequisites, and establish rename checklist from research findings.

### Independent Test Criteria

- ✅ Branch `013-augeo-to-fundrbolt` is active
- ✅ All research, plan, and quickstart documents are accessible
- ✅ Docker, Poetry, pnpm, Azure CLI, GitHub CLI are installed and authenticated
- ✅ Rename checklist document created and reviewed

### Tasks

- [ ] T001 Set up feature branch `013-augeo-to-fundrbolt` and verify upstream is current
- [ ] T002 Clone/update all monorepo directories and verify git status clean
- [ ] T003 Verify Docker, Poetry, pnpm, Azure CLI (`az login`), GitHub CLI (`gh auth login`) are installed and authenticated
- [ ] T004 Review research.md findings and create a master Augeo→Fundrbolt reference log in `/docs/rename-checklist.md`
- [ ] T005 Document current state: List all active Augeo references (count by category: code, infra, docs, GitHub)

---

## Phase 2: Foundational

### Story Goal

Establish shared configuration, build utilities, and parallel-safe tooling that all downstream rename phases depend on.

### Independent Test Criteria

- ✅ Rename scripts execute without errors (dry-run mode)
- ✅ Build configs updated for new package names
- ✅ All foundational file updates (root-level, shared) are complete
- ✅ No merge conflicts expected in downstream phases

### Tasks

- [ ] T006 Update `/backend/pyproject.toml` to rename package from `augeo-platform` to `fundrbolt-platform`
- [ ] T007 Update `/docker-compose.yml` service labels and environment variables from augeo to fundrbolt
- [ ] T008 [P] Update `pnpm-workspace.yaml` and workspace package references from augeo to fundrbolt
- [ ] T009 [P] Update `/Makefile` comments and target descriptions to reference Fundrbolt
- [ ] T010 [P] Update `.env.example` and `.github/copilot-instructions.md` with Fundrbolt branding
- [ ] T011 [P] Create rename bulk-replace script at `/scripts/rename-to-fundrbolt.sh` (optional dry-run mode)
- [ ] T012 Update `.specify/memory/constitution.md` to reflect Fundrbolt project name
- [ ] T013 Smoke test: Run `make help` and verify no broken references; test docker-compose config validation

---

## Phase 3: User Story 1 - Customer-Facing Brand is Consistent (Priority: P1)

### Story Goal

All visible brand references in UI, emails, documentation, and customer-facing surfaces display "Fundrbolt" with no Augeo references remaining.

### Independent Test Criteria

- ✅ OpenAPI docs (`/docs` endpoint) show "Fundrbolt Platform API"
- ✅ Frontend UI loads and displays Fundrbolt branding in headers, footers, and dialogs
- ✅ Email templates (if testable) show Fundrbolt sender and branding
- ✅ PWA manifest files list "Fundrbolt" app name
- ✅ Manual spot-check: No visible Augeo text on core UI pages

### Tasks

- [ ] T014 [P] [US1] Rename `/frontend/augeo-admin` directory to `/frontend/fundrbolt-admin`
- [ ] T015 [P] [US1] Update `/frontend/fundrbolt-admin/package.json` to rename package from `augeo-admin` to `fundrbolt-admin`
- [ ] T016 [P] [US1] Bulk replace "Augeo" → "Fundrbolt" and "augeo" → "fundrbolt" in `/frontend/fundrbolt-admin/src/` using sed or grep+xargs
- [ ] T017 [P] [US1] Bulk replace "Augeo" → "Fundrbolt" in `/frontend/fundrbolt-admin/public/manifest.json` and `public/index.html`
- [ ] T018 [P] [US1] Update `/backend/app/main.py` FastAPI instantiation: title, description, contact info to Fundrbolt
- [ ] T019 [P] [US1] Update `/backend/app/core/config.py` PROJECT_NAME, PROJECT_DESCRIPTION, CONTACT_EMAIL constants to Fundrbolt
- [ ] T020 [P] [US1] Update response headers middleware in `/backend/app/middleware/` to include `X-Powered-By: Fundrbolt Platform`
- [ ] T021 [P] [US1] Update email template sender names and subject lines from `Augeo Support` to `Fundrbolt Support` and `support@augeo.app` to `support@fundrbolt.app` (in email service code)
- [ ] T022 [P] [US1] Bulk replace "Augeo" → "Fundrbolt" in `/frontend/donor-pwa/src/`, `/frontend/landing-site/src/` using sed or grep+xargs
- [ ] T023 [P] [US1] Update PWA manifest files (`/frontend/donor-pwa/public/manifest.json`, `/frontend/landing-site/public/manifest.json`) with Fundrbolt app names
- [ ] T024 [US1] Verify backend builds: `cd backend && poetry install && poetry run pytest` (confirms no syntax errors from rename)
- [ ] T025 [US1] Verify frontends build: `cd frontend/fundrbolt-admin && pnpm install && pnpm build` (all PWAs)
- [ ] T026 [US1] Start docker-compose and load UI at `http://localhost:3000` to verify visual branding (no Augeo text visible)
- [ ] T027 [US1] Test OpenAPI docs at `http://localhost:8000/docs` to confirm Fundrbolt branding and no 404s

---

## Phase 4: User Story 2 - Operations Align Environments and Repos (Priority: P1)

### Story Goal

All infrastructure, repositories, pipelines, secrets, dashboards, and monitoring surfaces are renamed to Fundrbolt while preserving automation continuity.

### Independent Test Criteria

- ✅ CI/CD pipeline runs successfully on renamed assets
- ✅ GitHub repository renamed and old URLs redirect correctly
- ✅ Azure Bicep templates deploy successfully with Fundrbolt resource names
- ✅ GitHub Actions workflows execute without errors
- ✅ Azure Key Vault secrets accessible with new Fundrbolt naming

### Tasks

- [ ] T028 [P] [US2] Bulk replace "augeo" → "fundrbolt" in `/infrastructure/bicep/` *.bicep files (resource names, labels)
- [ ] T029 [P] [US2] Rename environment parameter files: `infrastructure/bicep/environments/*.augeo.bicepparam` → `*.fundrbolt.bicepparam`
- [ ] T030 [P] [US2] Update Bicep variable names and descriptions to reference Fundrbolt
- [ ] T031 [P] [US2] Bulk replace "Augeo" → "Fundrbolt", "augeo" → "fundrbolt" in `.github/workflows/` *.yml files
- [ ] T032 [P] [US2] Update GitHub Actions workflow job names, artifact names, and step descriptions to reference Fundrbolt
- [ ] T033 [P] [US2] Rename primary GitHub repository from `jeanesdev/augeo-platform` to `jeanesdev/fundrbolt-platform` (via GitHub web UI or `gh repo rename`)
- [ ] T034 [US2] Update local git remotes post-repo-rename: `git remote set-url origin https://github.com/jeanesdev/fundrbolt-platform.git`
- [ ] T035 [US2] Verify GitHub automatic redirect: `git fetch` should succeed and follow redirect
- [ ] T036 [US2] Update infrastructure deployment scripts: `infrastructure/scripts/deploy-backend.sh`, `deploy-frontend.sh` to reference new repo/resource names
- [ ] T037 [US2] Create/update Azure Key Vault secrets with Fundrbolt naming (add new secrets; plan retirement of old Augeo secrets post-launch)
- [ ] T038 [US2] Validate Bicep templates: Run `az bicep build` on each updated Bicep file to confirm syntax
- [ ] T039 [US2] Dry-run infrastructure deployment to staging: Execute deployment scripts without applying (plan/validate only)
- [ ] T040 [US2] Verify CI/CD pipeline: Trigger a test build/deploy on renamed assets to confirm automation works

---

## Phase 5: User Story 3 - Legacy References Are Safely Redirected (Priority: P2)

### Story Goal

Legacy Augeo URLs, domains, and documentation automatically redirect or guide users to Fundrbolt equivalents without errors.

### Independent Test Criteria

- ✅ 100% of top 20 legacy Augeo URLs tested and resolves to Fundrbolt pages
- ✅ Old documentation bookmarks/links render Fundrbolt content without 404s
- ✅ Internal wiki/wiki links updated to reference Fundrbolt
- ✅ No mixed-content warnings in browser console
- ✅ Webhook endpoints (if applicable) maintain backward compatibility or clearly redirect

### Tasks

- [ ] T041 [US3] Create HTTP redirect rules (if applicable) to forward `augeo.app` domain → `fundrbolt.app` or new domain
- [ ] T042 [US3] Update legacy URL references in onboarding docs and runbooks to point to Fundrbolt equivalents
- [ ] T043 [US3] Bulk replace Augeo → Fundrbolt in all markdown files in `/docs/` directory
- [ ] T044 [US3] Update all README.md files (root and subdirectories) with Fundrbolt branding
- [ ] T045 [US3] Update `.specify/` documentation (spec files, memory files, prompts) to reflect Fundrbolt naming
- [ ] T046 [US3] Create changelog entry documenting the rename, dates, and what changed for customer communication
- [ ] T047 [US3] Generate migration guide for external API consumers detailing the API cutover (new sender names, endpoints still the same, breaking changes)
- [ ] T048 [US3] Test legacy URL redirects: Simulate user clicking old bookmarks or following stale documentation links
- [ ] T049 [US3] Verify no broken assets in documentation: Run link checker on all markdown files
- [ ] T050 [US3] Review audit logs and compliance artifacts to ensure historical Augeo references remain accessible while presenting Fundrbolt externally

---

## Phase 6: Polish & Cross-Cutting Concerns

### Story Goal

Finalize rename, run comprehensive testing, obtain stakeholder sign-off, and prepare for production deployment.

### Independent Test Criteria

- ✅ All tests pass (backend pytest, frontend Vitest, infrastructure validation)
- ✅ No unplanned Augeo references remain in codebase or infrastructure
- ✅ Full deployment dry-run succeeds on staging
- ✅ Stakeholder sign-off received
- ✅ Customer/partner communication sent
- ✅ Support team trained on new branding

### Tasks

- [ ] T051 Run comprehensive code search to detect any remaining Augeo references: `grep -r "augeo\|Augeo" --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.venv`
- [ ] T052 [P] Run backend test suite: `cd backend && poetry run pytest --tb=short` to confirm no regressions
- [ ] T053 [P] Run frontend build and tests: `cd frontend/fundrbolt-admin && pnpm install && pnpm test` (all frontends)
- [ ] T054 [P] Run infrastructure validation: `az bicep build` on all Bicep files; `terraform validate` (if applicable)
- [ ] T055 Commit all rename changes with meaningful commit messages following Conventional Commits format
- [ ] T056 Create Pull Request with title "Rename: Augeo to Fundrbolt" and link to spec
- [ ] T057 Code review: Verify all Augeo references replaced, no functional logic changed, tests pass
- [ ] T058 Deploy to staging environment using updated infrastructure scripts
- [ ] T059 Smoke tests on staging: Load UI, verify API responses, test email delivery, check dashboards
- [ ] T060 Obtain stakeholder approval: Product, operations, support confirm readiness
- [ ] T061 Send customer/partner communication notifying of rebrand (date, what to expect, support contact)
- [ ] T062 Merge PR to main and deploy to production
- [ ] T063 Monitor production for 24 hours: Track error rates, customer feedback, verify Fundrbolt branding live
- [ ] T064 Update project status in .specify/specs/013-augeo-to-fundrbolt/spec.md from Draft to Complete
- [ ] T065 Archive this tasks.md and document final state in feature completion summary

---

## Dependencies & Sequencing

**Strict Order** (blocking):

1. Phase 1 (Setup) MUST complete before any other phases
2. Phase 2 (Foundational) MUST complete before Phase 3, 4, 5
3. Phase 6 (Polish) MUST run after all previous phases complete

**Parallel Within Phases**:

- Phase 2: Foundational tasks (T006–T013) can run in any order except T013 (smoke test must run last in phase)
- Phase 3: US1 rename tasks (T014–T023) can run in parallel; T024–T027 (tests) run after T014–T023 complete
- Phase 4: US2 rename tasks (T028–T032) can run in parallel; infrastructure deployment (T033–T040) runs after
- Phase 5: US3 tasks (T041–T050) can run in any order

**Independent Story Completion**:

- US1 (Phase 3) can be fully tested and verified independently once Phase 2 completes
- US2 (Phase 4) can be fully tested independently once Phase 2 completes
- US3 (Phase 5) can be fully tested independently once Phase 2 completes

---

## Task Statistics

| Metric | Count |
|--------|-------|
| **Total Tasks** | 65 |
| **Phase 1 (Setup)** | 5 tasks |
| **Phase 2 (Foundational)** | 8 tasks |
| **Phase 3 (US1 - Customer Brand)** | 14 tasks |
| **Phase 4 (US2 - Operations)** | 13 tasks |
| **Phase 5 (US3 - Legacy Redirects)** | 10 tasks |
| **Phase 6 (Polish)** | 15 tasks |
| **Parallelizable Tasks** | ~35 tasks (marked [P]) |

---

## Recommended MVP Scope

**Minimum Viable Product** (Day 1–2):

- Complete Phase 1 + Phase 2 (Setup & Foundational): ~13 tasks
- Complete Phase 3 (US1 - Customer-Facing Brand): ~14 tasks
- **Total MVP**: 27 tasks covering visible branding cutover

**Minimal Testing**: Docker-compose smoke test + OpenAPI docs verification (T026–T027)

**Next Iteration** (Day 2–3):

- Complete Phase 4 (US2 - Operations): ~13 tasks
- Prepare infrastructure deployment to staging

**Final Iteration** (Day 3–4):

- Complete Phase 5 (US3 - Legacy Redirects): ~10 tasks
- Complete Phase 6 (Polish & Approval): ~15 tasks
- Production deployment

---

## File Changes Reference

### Backend

- `pyproject.toml`
- `app/main.py`
- `app/core/config.py`
- `app/middleware/` (response headers)
- `alembic/versions/` (if config migration needed)

### Frontend

- `frontend/augeo-admin/` → `frontend/fundrbolt-admin/` (directory rename)
- `frontend/fundrbolt-admin/package.json`
- `frontend/fundrbolt-admin/src/**/*`
- `frontend/fundrbolt-admin/public/manifest.json`
- `frontend/donor-pwa/package.json`, `/src/`, `/public/`
- `frontend/landing-site/package.json`, `/src/`, `/public/`

### Infrastructure

- `infrastructure/bicep/**/*.bicep`
- `infrastructure/bicep/environments/*.bicepparam`
- `infrastructure/scripts/deploy-*.sh`
- `.github/workflows/*.yml`

### Documentation

- `README.md`
- `docs/**/*.md`
- `.github/copilot-instructions.md`
- `.specify/memory/constitution.md`
- `.specify/**/*.md`

---

## Rollback Plan

**If Issues Arise**:

1. **Code**: Revert commits on branch `013-augeo-to-fundrbolt` or merge main if already merged
2. **Infrastructure**: Redeploy old Bicep templates (no schema changes, so zero data loss)
3. **GitHub**: Old repo redirect will remain; update remote URLs back to augeo-platform

**Quick Rollback Command** (if merged to main):

```bash
git revert HEAD --no-edit
git push origin main
# Redeploy old infrastructure
```

---

## Contacts & Escalation

| Role | Responsibility |
|------|-----------------|
| **Developer** | Execute code & documentation rename tasks (Phase 1–5) |
| **Ops/DevOps** | Execute infrastructure & Azure tasks (Phase 4), staging deployment (Phase 6) |
| **Product** | Stakeholder approval (Phase 6 T060), communicate to customers (Phase 6 T061) |
| **Support** | Handle customer inquiries post-launch, monitor for issues (Phase 6 T063) |

---

## Success Definition

✅ **All Phases Complete**:

- 0 visible Augeo references in UI, APIs, emails
- Full build-and-release pipeline succeeds on renamed assets
- 100% of legacy URLs redirect correctly
- Stakeholder sign-off recorded
- No Sev1/Sev2 incidents in first 7 days post-launch

---
