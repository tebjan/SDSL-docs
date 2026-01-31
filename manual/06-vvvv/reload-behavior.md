# Reload Behavior [vvvv]

> Why "save and it updates" sometimes doesn't work.

---

## The Normal Case

1. Edit shader in your editor
2. Save file (Ctrl+S)
3. vvvv detects change
4. Shader recompiles
5. Node updates automatically

**This usually works.** When it doesn't, here's why:

---

## When Reload Fails

### Symptom: Nothing happens after save

**Cause:** vvvv didn't detect the file change.

**Fix:**
1. Click somewhere in vvvv (bring it to focus)
2. Save again
3. If still nothing: delete the node, recreate from NodeBrowser

---

### Symptom: Node goes red, stays red

**Cause:** Compilation error in shader.

**Fix:** 
1. Check errors (see [Finding Errors](finding-errors.md))
2. Fix the error
3. Save again

---

### Symptom: "Dependency is not a module"

**Cause:** vvvv's internal state got confused. Usually happens when:
- You renamed a shader
- You changed inheritance hierarchy significantly
- You had a broken shader, then fixed it

**Fix:** Restart vvvv. There's no other way.

---

### Symptom: Old behavior persists after fix

**Cause:** Cached compiled shader.

**Fix:**
1. Delete the node
2. Look for `obj/` folder in your project → delete its contents
3. Recreate node from NodeBrowser
4. If still wrong: restart vvvv

---

## The Reload Sequence

When you save a shader, vvvv:

1. Detects file change (filesystem watcher)
2. Parses the .sdsl file
3. Resolves inheritance (finds all base shaders)
4. Compiles to HLSL
5. Compiles HLSL to bytecode
6. Updates the node

Failure at any step = no update.

---

## What Triggers Recompilation

| Action | Triggers Recompile? |
|--------|---------------------|
| Save shader file | ✅ Yes |
| Change parameter value in vvvv | ❌ No (runtime only) |
| Rename shader file | ⚠️ Creates new shader, old node breaks |
| Edit base shader (inherited) | ✅ Yes, all children recompile |
| Add new shader file | ✅ Yes, appears in NodeBrowser |
| Delete shader file | ⚠️ Node breaks, need to remove manually |

---

## When in Doubt, Restart

If behavior doesn't match code after multiple save attempts:
1. Save your .vl document
2. Close vvvv completely
3. Delete `obj/` folder (if exists)
4. Reopen vvvv and your document

---

## Hot Reload Limitations

**What hot reloads:**
- Shader code changes
- Parameter additions/removals
- Inheritance changes (usually)

**What doesn't hot reload:**
- Suffix changes (e.g., _TextureFX → _DrawFX)
- File renames
- Major structural changes

For these, delete the old node and create the new one.
