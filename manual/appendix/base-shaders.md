# Base Shaders Reference

> What each one provides. Use Shader Explorer for full details.

---

## Overview

SDSL base shaders provide common functionality you inherit rather than rewrite. They fall into two categories:

**Stride Core** — Available in both Stride and vvvv
**vvvv Additions** — Convenience wrappers that bundle Stride shaders (vvvv only)

vvvv includes all Stride shaders plus additional helpers for rapid prototyping.

---

## Stride Core Shaders

These are the foundation. Everything below works in Stride Game Studio, vvvv, and any SDSL environment.

### ShaderBase / ShaderBaseStream

The root of most graphics shaders.

**ShaderBaseStream provides:**
- `streams.ShadingPosition` (float4) — VS output position
- `streams.ColorTarget` (float4) — PS output color
- `streams.InstanceID` (uint)
- `streams.VertexID` (uint)

**ShaderBase provides:**
- `VSMain()` and `PSMain()` entry points
- Inherits ShaderBaseStream

```hlsl
shader MyShader : ShaderBase
{
    override stage void VSMain() { /* vertex processing */ }
    override stage void PSMain() { /* pixel shading */ }
};
```

---

### ComputeShaderBase

For compute shaders.

**Provides:**
- `Compute()` method to override
- `streams.DispatchThreadId` (uint3)
- `streams.GroupId` (uint3)
- `streams.GroupThreadId` (uint3)

```hlsl
shader MyCompute : ComputeShaderBase
{
    RWBuffer<float> Data;

    override void Compute()
    {
        uint i = streams.DispatchThreadId.x;
        Data[i] *= 2;
    }
};
```

---

### ComputeColor / ComputeFloat / ComputeFloat2 / ComputeFloat3

Material composition interfaces. Used to build pluggable shader graphs.

**ComputeColor provides:**
- `Compute()` returning float4
- Standard interface for material slots

```hlsl
shader MyColor : ComputeColor
{
    override float4 Compute() { return float4(1, 0, 0, 1); }
};
```

Stride's entire material system is built on `ComputeColor` composition.

---

### Stream Providers

| Shader | Provides |
|--------|----------|
| `PositionStream4` | `streams.Position` (float4) |
| `Texturing` | `streams.TexCoord`, `Sampler`, texture helpers |
| `NormalStream` | `streams.Normal`, `streams.meshNormal` |
| `ColorStream` | `streams.Color` (float4) |
| `TangentStream` | `streams.Tangent` (float4) |

---

### Transformation

Transform matrices for 3D rendering.

**Provides:**
- `World`, `WorldInverse`
- `View`, `ViewInverse`
- `Projection`
- `WorldView`, `ViewProjection`, `WorldViewProjection`
- `Eye` (float3) — camera position
- `EyeMS` (float3) — camera in model space

```hlsl
shader MyShader : ShaderBase, Transformation, PositionStream4
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }
};
```

**TransformationWAndVP** — lighter alternative with just `World` and `ViewProjection`.

---

### Global

Time and animation values.

**Provides:**
- `Time` (float) — seconds since start
- `TimeStep` (float) — delta time

```hlsl
shader MyShader : ShaderBase, Global
{
    override stage void PSMain()
    {
        float pulse = sin(Time * 3.14);
    }
};
```

---

### ImageEffectShader

For post-processing effects in Stride.

```hlsl
shader MyPostProcess : ImageEffectShader
{
    stage override float4 Shading()
    {
        float4 color = Texture0.Sample(Sampler, streams.TexCoord);
        return color;
    }
};
```

---

### InstanceWorldBuffer

Per-instance transforms for instanced rendering.

**Provides:**
- `InstanceWorld` buffer with per-instance matrices

```hlsl
shader MyInstanced : ShaderBase, Transformation, InstanceWorldBuffer
{
    override stage void VSMain()
    {
        float4x4 w = InstanceWorld[streams.InstanceID].Matrix;
        // Use instance-specific transform
    }
};
```

---

## vvvv Additions

These are convenience wrappers that bundle multiple Stride shaders. They simplify common patterns but are only available in vvvv.

### VS_PS_Base

Bundles everything needed for custom draw shaders.

**Inherits:** `ShaderBase` + `Transformation` + `NormalStream` + `PositionStream4`

```hlsl
// vvvv shortcut
shader My_DrawFX : VS_PS_Base
{
    override stage void VSMain() { }
    override stage void PSMain() { }
};

// Equivalent Stride-only version
shader My_DrawFX : ShaderBase, Transformation, NormalStream, PositionStream4
{
    override stage void VSMain() { }
    override stage void PSMain() { }
};
```

---

### FilterBase

Single-texture image processing.

**Provides:**
- `Texture0` input
- `Sampler`
- `ViewSize` (float2)

```hlsl
shader My_TextureFX : FilterBase
{
    float4 Filter(float4 tex0col)
    {
        tex0col.rgb = 1 - tex0col.rgb;  // Invert
        return tex0col;
    }
};
```

---

### MixerBase

Two-texture blending.

**Provides:**
- `Texture0`, `Texture1` inputs
- `Fader` parameter (0-1)

```hlsl
shader My_TextureFX : MixerBase
{
    float4 Mix(float4 tex0col, float4 tex1col, float fader)
    {
        return lerp(tex0col, tex1col, fader);
    }
};
```

---

### TextureFX

Base for texture generators (sources).

```hlsl
[TextureSource]
shader Noise_TextureFX : TextureFX
{
    stage override float4 Shading()
    {
        // Generate pattern from TexCoord
        return float4(noise(streams.TexCoord), 1);
    }
};
```

---

### ShaderUtils

Math constants and helpers.

**Provides:**
- `PI`, `TWO_PI`, `PI_OVER_TWO`
- `QuadPositions[4]`, `QuadUV[4]` — billboard helpers
- Various utility functions

---

### ColorUtility

Color space conversions.

**Provides:**
- `LinearToSRGB()`, `SRGBToLinear()`
- HSV/HSL conversions

---

## Finding More

1. **Shader Explorer** — browse the complete hierarchy
2. **Stride source** — `sources/engine/Stride.Rendering/Rendering/`
3. **vvvv shaders** — `lib/packs/VL.Stride.Runtime/.../Effects`
