# Contributing to unifyid-mobile-sdk

## Development workflow

All changes use a pull request. Start a short-lived `feature/<description>` or `fix/<description>` branch from `develop`, merge into `develop`, then promote it into `main` through a pull request. Use a merge commit for promotion so the branches retain their shared history. Automation may use `codex/<description>` branches. The foundation migration is a one-time pull request that preserves existing work.

Both protected branches require the GitHub Actions `verify` check on the latest commit, an up-to-date branch, and resolved review conversations. Direct pushes, force pushes and branch deletion are prohibited. Zero approving reviews are required while the founder is the sole maintainer; change the organization manifest to one when a reviewer joins. Review the diff and checks before merging even when no separate reviewer is required.

This repository has no deployment environments. A future versioned release will publish only artifacts verified by CI. Package publishing is deferred until registry ownership and credentials are configured.

This phase configures GitHub and real CI only. Environment containers are not running services. Deployment and publishing definitions under `.github/deferred-workflows` are inactive references; do not move them back without the cloud or registry configuration and release validation. `release/*` branches are not part of the ongoing branch flow.

The organization policy and repeatable administration tool are maintained in `VerifyNova/unifyid-api:ops/github-organization`. This repository’s tier is recorded in `.github/foundation.json`.
