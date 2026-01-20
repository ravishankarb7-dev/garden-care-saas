---
description: Protocol for finalizing a feature to ensure Tests and Docs are never missed.
---

# Feature Completion Protocol

Before marking a feature as "Done" and notifying the user, you MUST execute this workflow:

## 1. 🔍 Validation Audit
- [ ] **Run Tests**: Execute relevant browser tests or unit tests.
- [ ] **Edge Cases**: Verify destructive actions (Cancel, Delete, Invalid Input).
- [ ] **Log Results**: detailed in `test_plan.md`.

## 2. 📚 Documentation Sync
- [ ] **User Guide**: Does the `user_training_guide.md` reflect the *exact* UI workflows?
- [ ] **Architecture**: Did you change the DB Schema or APIs? Update `technical_architecture.md`.
- [ ] **Walkthrough**: Does `walkthrough.md` show the "Before vs After"?

## 3. 🧹 Code cleanup
- [ ] **Tasks**: Mark items in `task.md` as complete.
- [ ] **Lints**: Ensure no new warnings (run `npm run lint` if applicable).

## 4. 📢 Final Notification
- [ ] **Summary**: Include links to the *specific* doc sections updated.
