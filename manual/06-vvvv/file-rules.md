# File Rules [vvvv]

> Get this wrong and your shader won't appear. No error, just missing.

---

## The Rules

### Rule 1: Folder Must Be Named "shaders"

```
✓ CORRECT
my-project/
├── MyProject.vl
└── shaders/              ← Named "shaders"
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
| Folder name | `shaders` |
| Folder location | Next to .vl document |
| Filename | Must match shader name (case-sensitive) |
| Extension | `.sdsl` |
| Suffix | Determines node type |

Get all of these right, and your shader appears. Get any wrong, and it silently doesn't.
