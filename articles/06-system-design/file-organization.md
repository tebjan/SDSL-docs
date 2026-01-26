# File Organization

> Keep your shaders organized as projects grow.

---

## Small Project (< 10 shaders)

Flat structure is fine:

```
my-project/
├── MyProject.vl
└── shaders/
    ├── Blur_TextureFX.sdsl
    ├── Particles_ComputeFX.sdsl
    ├── Custom_DrawFX.sdsl
    └── Utils.sdsl
```

---

## Medium Project (10-30 shaders)

Group by type:

```
my-project/
├── MyProject.vl
└── shaders/
    ├── texturefx/
    │   ├── Blur_TextureFX.sdsl
    │   ├── Sharpen_TextureFX.sdsl
    │   └── ColorGrade_TextureFX.sdsl
    ├── draw/
    │   ├── Wireframe_DrawFX.sdsl
    │   └── Instanced_DrawFX.sdsl
    ├── compute/
    │   ├── Particles_ComputeFX.sdsl
    │   └── Fluid_ComputeFX.sdsl
    ├── shaderfx/
    │   ├── Noise_ShaderFX.sdsl
    │   └── Displacement_ShaderFX.sdsl
    └── shared/
        ├── MathUtils.sdsl
        └── ColorUtils.sdsl
```

---

## Large Project (30+ shaders)

Group by system, then by type:

```
my-project/
├── MyProject.vl
└── shaders/
    ├── particles/
    │   ├── types/
    │   │   └── ParticleTypes.sdsl
    │   ├── compute/
    │   │   ├── Emit_ComputeFX.sdsl
    │   │   ├── Simulate_ComputeFX.sdsl
    │   │   └── Sort_ComputeFX.sdsl
    │   └── draw/
    │       └── Render_DrawFX.sdsl
    ├── fluid/
    │   ├── types/
    │   │   └── FluidTypes.sdsl
    │   ├── compute/
    │   │   ├── Advect_ComputeFX.sdsl
    │   │   ├── Diffuse_ComputeFX.sdsl
    │   │   └── Project_ComputeFX.sdsl
    │   └── draw/
    │       └── Visualize_DrawFX.sdsl
    ├── postfx/
    │   ├── Bloom_TextureFX.sdsl
    │   ├── DOF_TextureFX.sdsl
    │   └── Tonemap_TextureFX.sdsl
    └── shared/
        ├── MathUtils.sdsl
        ├── NoiseUtils.sdsl
        └── ColorUtils.sdsl
```

---

## Naming Conventions

### Shader Names

| Pattern | Example | Use |
|---------|---------|-----|
| `Feature_Type` | `Blur_TextureFX` | Most shaders |
| `System_Stage_Type` | `Particles_Emit_ComputeFX` | Multi-pass systems |
| `FeatureTypes` | `ParticleTypes` | Shared type definitions |
| `FeatureUtils` | `MathUtils` | Utility functions |

---

### File Names

File name must match shader name exactly:

```
✓ Blur_TextureFX.sdsl      → shader Blur_TextureFX
✓ ParticleTypes.sdsl       → shader ParticleTypes
✗ blur_texturefx.sdsl      → shader Blur_TextureFX  (case mismatch!)
```

---

## Shared Code Strategy

### Option 1: Inheritance (Shared State)

Use when shaders need the same **data definitions**:

```hlsl
// ParticleTypes.sdsl
shader ParticleTypes
{
    struct Particle { ... };
};

// Use via inheritance
shader Emit_ComputeFX : ComputeShaderBase, ParticleTypes { }
```

---

### Option 2: Static Calls (Shared Functions)

Use when shaders need the same **utility functions**:

```hlsl
// MathUtils.sdsl
shader MathUtils
{
    static float Remap(float v, float a, float b, float c, float d)
    {
        return c + (v - a) * (d - c) / (b - a);
    }
};

// Use via static call (no inheritance needed)
shader MyShader_ComputeFX : ComputeShaderBase
{
    override void Compute()
    {
        float x = MathUtils.Remap(value, 0, 1, -1, 1);
    }
};
```

---

### When to Use Which

| Scenario | Use |
|----------|-----|
| Shared struct definitions | Inheritance |
| Shared stream variables | Inheritance |
| Pure math functions | Static calls |
| Stateless utilities | Static calls |
| Both state and functions | Inheritance |

---

## Dependencies

Shaders can reference other shaders in the same `shaders/` folder (or subfolders).

```
shaders/
├── shared/
│   └── Types.sdsl           ← Define here
└── compute/
    └── MyShader_ComputeFX.sdsl  ← Inherit from Types
```

```hlsl
// MyShader_ComputeFX.sdsl
shader MyShader_ComputeFX : ComputeShaderBase, Types
{
    // Types is found automatically
};
```

No `#include` needed. SDSL resolves by shader name.

---

## Version Control Tips

### .gitignore

```gitignore
# Compiled shaders (regenerated)
obj/
bin/

# VS Code settings (optional)
.vscode/
```

### Meaningful Commits

```
feat(particles): add depth sorting pass
fix(blur): correct UV sampling at edges
refactor(shared): extract noise functions to NoiseUtils
```

---

## Common Mistakes

### Mistake: Circular inheritance

```hlsl
// A inherits B, B inherits A = error
shader A : B { }
shader B : A { }
```

**Fix:** Extract shared parts to a third shader.

---

### Mistake: Name collision

```hlsl
// Two shaders with same name in different folders
shaders/old/Blur_TextureFX.sdsl
shaders/new/Blur_TextureFX.sdsl
```

**Fix:** Use unique names: `BlurSimple_TextureFX`, `BlurGaussian_TextureFX`.

---

### Mistake: Deep nesting

```
shaders/effects/post/blur/gaussian/horizontal/Blur_TextureFX.sdsl
```

**Fix:** Keep it 2-3 levels max. The shader name carries the meaning.

---

## Quick Reference

| Project Size | Structure | Grouping |
|--------------|-----------|----------|
| Small (<10) | Flat | None |
| Medium (10-30) | By type | texturefx/, compute/, etc. |
| Large (30+) | By system | particles/, fluid/, etc. |
