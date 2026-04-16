# ArgusAI — Git Workflow Guide

> This guide covers how to work with Git day-to-day on ArgusAI.
> For branch structure and per-phase commands, see [GitHub-Argus.md](./GitHub-Argus.md).

---

## First Time Setup

```bash
git clone https://github.com/your-username/ArgusAI.git
cd ArgusAI
git checkout -b develop origin/develop
```

Set your identity if you haven't already:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

---

## The Golden Rules

- **Never push directly to `main` or `develop`** — always use a branch + PR
- **Always branch from the current phase branch**, not from `develop` directly
- **One feature per branch** — keep scope small and focused
- **Delete branches after merging** — keep the repo clean
- **Pull before you start work** — avoid merge conflicts before they happen

---

## Commit Message Format

Every commit should follow this structure:

```
<type>: short description (max 72 chars)
```

| Type | When to use |
|---|---|
| `feat` | Adding new functionality |
| `fix` | Fixing a bug |
| `refactor` | Restructuring code without changing behavior |
| `test` | Adding or updating tests |
| `chore` | Dependency updates, config changes, cleanup |
| `docs` | Documentation only |

**Good examples:**
```
feat: add Plaid /transactions/sync endpoint
fix: handle expired access token on re-sync
refactor: extract cashflow logic into separate service
chore: update FastAPI to 0.111.0
```

**Bad examples:**
```
stuff
fix bug
update
wip
```

---

## Daily Workflow

```bash
# 1. Start the day — pull latest from the phase branch
git checkout feature/your-feature
git pull origin phase/current-phase

# 2. Do your work, commit often
git add backend/routers/plaid.py
git commit -m "feat: add webhook handler for Plaid transactions"

# 3. Push your branch
git push origin feature/your-feature

# 4. When done — open a PR on GitHub
#    feature/your-feature → phase/current-phase
```

Commit as you go — don't save everything for one massive commit at the end.

---

## Opening a Pull Request

When your feature is ready:

1. Push your branch to GitHub
2. Open a PR from `feature/your-feature` → `phase/current-phase`
3. Write a short PR description — what it does and why
4. Wait for review (or self-review if solo) before merging
5. Use **Squash and Merge** for small features, **Merge Commit** for larger ones
6. Delete the branch after merging

**PR title format:** same as commit messages
```
feat: add transaction sync pipeline
fix: resolve duplicate transaction inserts
```

---

## Handling Merge Conflicts

Conflicts happen when two branches edit the same lines. Here's how to resolve:

```bash
# Update your branch with the latest from the phase branch
git checkout feature/your-feature
git fetch origin
git merge origin/phase/current-phase

# Git will mark conflicts in the file like this:
# <<<<<<< HEAD
# your changes
# =======
# their changes
# >>>>>>> origin/phase/current-phase

# Open the file, pick the correct version, remove the markers
# Then stage and commit the resolution
git add <resolved-file>
git commit -m "fix: resolve merge conflict in transaction router"
```

If the conflict is complex, talk to whoever owns the other change before resolving.

---

## What NOT to Commit

These should already be in `.gitignore`, but double-check before committing:

| Item | Why |
|---|---|
| `.env` files | Contains secrets and API keys |
| `__pycache__/`, `*.pyc` | Python build artifacts |
| `node_modules/` | Frontend dependencies |
| `.DS_Store` | macOS metadata |
| `*.log` | Log files |

If you accidentally stage a secret, remove it immediately and rotate the key — git history is public.

---

## Keeping Your Branch Up to Date

If your feature branch falls behind the phase branch while you're working:

```bash
git fetch origin
git merge origin/phase/current-phase
```

Do this regularly on long-running branches to avoid painful conflicts later.

---

## Undoing Mistakes

| Situation | Command |
|---|---|
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |
| Discard all unstaged changes | `git restore .` |
| Remove a file from staging | `git restore --staged <file>` |
| Fix the last commit message | `git commit --amend -m "new message"` (only if not pushed) |

> Never force-push to `main` or `develop`. If something went wrong on those branches, ask first.

---

## Quick Reference

```bash
git status                        # see what's changed
git log --oneline -10             # last 10 commits
git branch -a                     # list all branches
git stash                         # temporarily shelve changes
git stash pop                     # bring them back
git diff origin/phase/current     # see what's different from phase branch
```
