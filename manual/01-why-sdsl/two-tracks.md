# The Two Tracks

> vvvv gamma and Stride Studio use the same SDSL, but different workflows.

---

## Same Language, Different Environments

SDSL is the shader language. It works identically in both:

- **vvvv gamma** — Visual programming environment
- **Stride Studio** — Game engine with C# scripting

This documentation covers both. Look for **[vvvv]** and **[Stride]** tags.

---

## Quick Comparison

| Aspect | vvvv gamma | Stride Studio |
|--------|------------|---------------|
| **Primary workflow** | Visual patching | C# code |
| **Target audience** | Artists, creative coders | Game developers |
| **Shader location** | `shaders/` folder next to .vl | `Assets/` folder structure |
| **Node creation** | Automatic via suffixes | C# registration |
| **Reload behavior** | Hot reload on save | Requires build |
| **Error location** | Console/TTY window | Visual Studio |
| **Material integration** | ShaderFX nodes | Property Grid |
| **Learning curve** | Easier to start | More control |

---

## What's Shared (The SDSL Language)

Both environments use identical SDSL syntax:

```hlsl
// This shader works in BOTH vvvv and Stride
shader MyShader : ShaderBase
{
    stream float3 customData;
    
    float4 Calculate()
    {
        return float4(streams.customData, 1);
    }
};
```

**Shared concepts:**
- `shader` keyword
- `stream` / `streams` system
- Multiple inheritance
- `override`, `stage`, `compose`, `clone`
- All HLSL intrinsics and types
- `StructuredBuffer`, `Texture2D`, etc.

---

## What's Different (The Workflow)

### File Location

**vvvv:**
```
my-project/
├── MyProject.vl
└── shaders/                    ← Must be named "shaders"
    └── MyEffect_TextureFX.sdsl
```

**Stride:**
```
MyGame/
├── MyGame.sln
└── MyGame/
    └── Assets/
        └── Effects/
            └── MyEffect.sdsl   ← Follows Stride asset conventions
```

---

### Node Creation

**vvvv:** Suffix-based automatic factory

| Suffix | Creates |
|--------|---------|
| `_TextureFX` | Texture effect node |
| `_DrawFX` | Draw shader node |
| `_ComputeFX` | Compute shader node |
| `_ShaderFX` | GPU<T> composable value |
| (no suffix) | No node (utility/shared) |

```hlsl
// This filename: Blur_TextureFX.sdsl
// Creates node: Blur [TextureFX] in NodeBrowser
shader Blur_TextureFX : FilterBase { ... }
```

**Stride:** C# registration required

```csharp
// You register shaders explicitly in C#
var shader = new EffectInstance(new Effect(GraphicsDevice, "MyEffect"));
```

---

### Reload Behavior

**vvvv:** 
- Save file → shader recompiles → node updates (usually)
- Sometimes need to delete and recreate node
- Occasionally need to restart vvvv

**Stride:**
- Change shader → rebuild project → see changes
- Full build cycle required
- More predictable, but slower iteration

---

### Base Shaders

**Core Stride shaders (available in both):**
- `ShaderBase`, `ShaderBaseStream`
- `Transformation` (matrices)
- `Texturing` (UVs, sampler)
- `ComputeShaderBase`
- `ComputeColor`
- `PositionStream4`, `NormalStream`, `ColorStream`

**vvvv additions (only in vvvv):**
- `VS_PS_Base` — simplified vertex/pixel base
- `FilterBase` — single-texture effects
- `MixerBase` — blend two textures
- `TextureFX` — texture source/generator
- `ShaderUtils` — math constants and helpers

Find vvvv shaders in:
```
C:\Program Files\vvvv\vvvv_gamma_...\lib\packs\VL.Stride.Runtime\stride\Assets\Effects
```

---

## Which Track Should You Use?

**Choose vvvv if:**
- You're a visual thinker
- You want fast iteration (hot reload)
- You're doing interactive installations, VJing, prototyping
- You don't want to write C#

**Choose Stride if:**
- You're building a game
- You need full engine control
- You're comfortable with C#
- You need build-time shader permutations

**You can use both:**
- Prototype in vvvv (fast iteration)
- Port to Stride when needed (same SDSL, minor workflow changes)

---

## Reading This Documentation

Most content applies to both tracks. When something is track-specific:

> **[vvvv]** This section covers vvvv-specific workflow.

> **[Stride]** This section covers Stride Studio workflow.

If there's no tag, the content applies to both.

---

## Next Steps

Ready to start?

1. **[Part 0: Setup](../04-setup/tools.md)** — Install the tools
2. **[Part 2: Setup & Workflow](../06-vvvv/file-rules.md)** — Critical workflow knowledge
3. **[Part 3: Your First Shaders](../07-shaders/texturefx.md)** — Working examples
