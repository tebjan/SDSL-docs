# File Rules [vvvv]

> Get this wrong and your shader won't appear. No error, just missing.

---

## The Rules

### Rule 1: Folder Must Be Named "shaders"

```
✓ CORRECT
my-project/
├── MyProject.vl
└── shaders/              ← Exactly "shaders", lowercase
    └── MyShader.sdsl

✗ WRONG
my-project/
├── MyProject.vl
└── Shaders/              ← Wrong: capital S
    └── MyShader.sdsl

✗ WRONG
my-project/
├── MyProject.vl
└── fx/                   ← Wrong: different name
    └── MyShader.sdsl
```

---

### Rule 2: Folder Must Be Next to Your .vl Document

```
✓ CORRECT
my-project/
├── MyProject.vl          ← The .vl file
└── shaders/              ← Same directory level
    └── MyShader.sdsl

✗ WRONG
my-project/
├── src/
│   └── MyProject.vl
└── shaders/              ← Wrong: not next to .vl file
    └── MyShader.sdsl

✗ WRONG
my-project/
├── MyProject.vl
└── assets/
    └── shaders/          ← Wrong: nested inside another folder
        └── MyShader.sdsl
```

---

### Rule 3: Filename Must Match Shader Name (Case-Sensitive)

```hlsl
// File: MyEffect_TextureFX.sdsl

shader MyEffect_TextureFX : FilterBase    // ✓ CORRECT: matches filename
{
    // ...
};
```

```hlsl
// File: MyEffect_TextureFX.sdsl

shader MyEffectTextureFX : FilterBase     // ✗ WRONG: missing underscore
{
    // ...
};
```

```hlsl
// File: MyEffect_TextureFX.sdsl

shader myeffect_texturefx : FilterBase    // ✗ WRONG: different case
{
    // ...
};
```

**The shader name inside the file must be identical to the filename (minus .sdsl).**

---

### Rule 4: Suffix Determines Node Type

| Suffix | Node Type | Example |
|--------|-----------|---------|
| `_TextureFX` | Texture processor | `Blur_TextureFX.sdsl` |
| `_DrawFX` | Geometry renderer | `Wireframe_DrawFX.sdsl` |
| `_ComputeFX` | Compute dispatcher | `Particles_ComputeFX.sdsl` |
| `_ShaderFX` | GPU<T> value | `Noise_ShaderFX.sdsl` |
| (no suffix) | **No node created** | `Utils.sdsl` |

No suffix = utility shader for inheritance only. It won't appear in NodeBrowser.

---

### Rule 5: Subfolders Are OK

```
✓ CORRECT
my-project/
├── MyProject.vl
└── shaders/
    ├── texturefx/
    │   ├── Blur_TextureFX.sdsl
    │   └── Sharpen_TextureFX.sdsl
    ├── compute/
    │   └── Particles_ComputeFX.sdsl
    └── utils/
        └── MathUtils.sdsl
```

Subfolders help organization. All shaders still appear in NodeBrowser with their full name.

---

## Common Mistakes

### Mistake: Shader doesn't appear in NodeBrowser

**Check:**
1. Is `shaders/` folder next to your .vl file?
2. Is folder named exactly `shaders` (lowercase)?
3. Does filename match shader name exactly?
4. Does filename have correct suffix?
5. Did you save the file?

### Mistake: "Mixin not found" error

**Cause:** File not found or name mismatch.

**Check:**
1. Is the inherited shader name spelled correctly?
2. Is the inherited shader's file in the shaders/ folder?
3. For vvvv base shaders (FilterBase, etc.), they're built-in — no file needed.

### Mistake: Changed shader, but old behavior persists

**Try:**
1. Save the file again
2. Delete the node, re-create from NodeBrowser
3. Check for cached files in `obj/` folder (delete them)
4. Restart vvvv

---

## File Extension

Always use `.sdsl`:

```
✓ MyShader_DrawFX.sdsl
✗ MyShader_DrawFX.hlsl
✗ MyShader_DrawFX.fx
```

vvvv looks specifically for `.sdsl` files.

---

## Encoding

Save as **UTF-8** without BOM. Most editors do this by default. If you see weird characters in error messages, check encoding.

---

## Quick Reference

| Rule | Requirement |
|------|-------------|
| Folder name | `shaders` (exactly, lowercase) |
| Folder location | Next to .vl document |
| Filename | Must match shader name |
| Case | Case-sensitive everywhere |
| Extension | `.sdsl` |
| Suffix | Determines node type |

Get all of these right, and your shader appears. Get any wrong, and it silently doesn't.
