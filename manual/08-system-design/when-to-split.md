# When to Split Shaders

> One shader or many? How to decide.

---

## The Default: One Shader

Start with a single shader. Split only when you have a reason.

**One shader works when:**
- Self-contained effect
- Single purpose
- No shared data structures
- Simple input → output

```hlsl
// Perfect as a single shader
shader Blur_TextureFX : FilterBase
{
    float Radius = 1.0;
    
    float4 Filter(float4 tex0col)
    {
        // blur logic
    }
};
```

---

## Signs You Should Split

### 1. Different Thread Counts

Compute shaders have thread groups. Different operations need different counts.

```
Emit particles:     [numthreads(64, 1, 1)]    → few threads
Simulate physics:   [numthreads(256, 1, 1)]   → many threads
Sort by depth:      [numthreads(512, 1, 1)]   → even more
```

**Can't do this in one shader.** Each needs its own dispatch.

---

### 2. Different Update Rates

Physics at 60 Hz. Rendering at 144 Hz. Emission once per second.

```
┌─────────────────┐     
│ Emit_ComputeFX  │  ← Run occasionally
└────────┬────────┘     
         ▼
┌─────────────────┐     
│ Sim_ComputeFX   │  ← Run every physics tick
└────────┬────────┘     
         ▼
┌─────────────────┐     
│ Draw_DrawFX     │  ← Run every frame
└─────────────────┘     
```

---

### 3. Reusable Type Definitions

If multiple shaders need the same struct:

```hlsl
// BAD: Defined in each shader (diverges over time)
shader Shader1 { struct Particle { ... }; }
shader Shader2 { struct Particle { ... }; }  // Copy-pasted, might differ

// GOOD: Defined once, inherited
shader ParticleTypes { struct Particle { ... }; }
shader Shader1 : ..., ParticleTypes { }
shader Shader2 : ..., ParticleTypes { }
```

---

### 4. Different Pipeline Stages

Compute and draw are fundamentally different:

```
Compute: Process data on GPU (no geometry)
Draw: Render geometry to screen

Can't combine them. Separate shaders required.
```

---

### 5. Conditional Execution

Sometimes you run one shader, sometimes another:

```
if (needsSort)
    dispatch SortShader
else
    skip to drawing
```

Separate shaders let you control flow from CPU.

---

## The Split Patterns

### Pattern A: Shared Types

```
Types.sdsl (no suffix)
    ↑
    ├── Compute1_ComputeFX.sdsl
    ├── Compute2_ComputeFX.sdsl
    └── Draw_DrawFX.sdsl
```

All shaders inherit from `Types`. Struct changes propagate everywhere.

---

### Pattern B: Shared Utilities

```
MathUtils.sdsl (no suffix, static functions)

// Used via static calls (no inheritance needed)
shader Any_ComputeFX : ComputeShaderBase
{
    override void Compute()
    {
        float x = MathUtils.Noise(seed);
    }
};
```

---

### Pattern C: Pipeline Stages

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Stage1      │────▶│ Stage2      │────▶│ Stage3      │
│ _ComputeFX  │     │ _ComputeFX  │     │ _DrawFX     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                   │
       └──────────────────┴───────────────────┘
                          │
                    Same Buffer
```

---

### Pattern D: Composable Material Pieces

```
┌─────────────────┐     ┌─────────────────┐
│ Noise_ShaderFX  │────▶│                 │
└─────────────────┘     │ Material        │
┌─────────────────┐     │                 │
│ Color_ShaderFX  │────▶│                 │
└─────────────────┘     └─────────────────┘
```

Each `_ShaderFX` is a pluggable piece. Combine them in the material.

---

## Decision Flowchart

```
Is it a simple effect?
├── YES → One shader
└── NO → Continue...

Do parts need different thread counts?
├── YES → Split compute shaders
└── NO → Continue...

Do parts run at different rates?
├── YES → Split by update frequency
└── NO → Continue...

Is there shared data structure?
├── YES → Create shared types shader
└── NO → Continue...

Do you need compute AND draw?
├── YES → Separate compute and draw shaders
└── NO → Continue...

Probably fine as one shader.
```

---

## Cost of Splitting

Splitting isn't free:

| Cost | Impact |
|------|--------|
| More files | Organization overhead |
| More nodes | Patch complexity |
| Buffer management | Must wire same buffer to all shaders |
| Dispatch coordination | CPU-side logic for ordering |

Split when benefits outweigh costs.

---

## Cost of NOT Splitting

Not splitting has costs too:

| Cost | Impact |
|------|--------|
| Duplicate code | Maintenance burden |
| Inconsistent structs | Integration bugs |
| Inflexible pipeline | Can't vary execution |
| Monolithic complexity | Hard to understand |

---

## Rule of Thumb

**Start with one shader. Split when you feel pain.**

Pain signals:
- "I'm copying this struct again"
- "I need different thread counts"
- "This shader is doing too many things"
- "I can't test this piece independently"

→ Next: [Shared Base Pattern](shared-base.md)
