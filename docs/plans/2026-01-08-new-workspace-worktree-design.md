# New Workspace Git Worktree Design

## Overview

When clicking "New workspace", the system will:
1. Randomly select an unused place name from a predefined list
2. Create a git worktree in a sibling directory (e.g., `/path/to/repos/andorra`)
3. Create a new branch based on main/master (branch name = place name)
4. Record workspace info to SQLite
5. Auto-retry with a different name if directory conflicts occur

## Place Names

50 city/place names used for workspace naming:

```
andorra, barcelona, cairo, dublin, edinburgh,
florence, geneva, helsinki, istanbul, jakarta,
kyoto, lisbon, madrid, nairobi, oslo,
paris, quebec, rome, seattle, tokyo,
utrecht, venice, warsaw, xiamen, yokohama,
zurich, amsterdam, berlin, copenhagen, denver,
essex, frankfurt, glasgow, houston, innsbruck,
jersey, kingston, lima, melbourne, naples,
oxford, portland, queens, reno, stockholm,
toronto, urbana, vancouver, wellington, york
```

## Data Flow

```
User clicks "New workspace"
        ↓
Frontend calls invoke('create_workspace', { repositoryId })
        ↓
Backend fetches repository path
        ↓
Query DB: get used place names for this repo
        ↓
Randomly select an unused place name
        ↓
Calculate worktree path: <repo_parent>/<place_name>
        ↓
Execute: git worktree add -b <place_name> <path> main
        ↓
If failed due to directory conflict → retry with different name (max 3 times)
        ↓
On success, insert workspace record to SQLite
        ↓
Return Workspace to frontend for UI update
```

## Database Field Mapping

- `directory_name` → place name (e.g., "andorra")
- `branch` → place name (e.g., "andorra")
- `initialization_parent_branch` → "main" or "master"

## Technical Implementation

### Backend Changes (Rust)

1. **New `place_names.rs`** - Place name constants and selection logic
2. **Modified `commands.rs`** - Update `create_workspace` command:
   - Add git worktree creation logic
   - Use `std::process::Command` for git commands
   - Implement retry mechanism

### Git Commands

```bash
# Detect main branch name
git -C <repo_path> symbolic-ref refs/remotes/origin/HEAD

# Create worktree
git -C <repo_path> worktree add -b <place_name> <worktree_path> main
```

### Error Handling

- Directory exists → retry with different name
- Git command fails → return error message
- All names used → return "No available names" error

### Frontend Changes

- Simplify `createNewWorkspace` function - no longer needs branch/directoryName params
