# Base Shaders Reference

> What each one provides. Use Shader Explorer for full details.

---

## Hierarchy Overview

```
ShaderBaseStream
└── ShaderBase
    ├── Texturing
    ├── Transformation
    ├── NormalStream
    ├── ColorStream
    ├── VS_PS_Base (vvvv) — inherits ShaderBase + Transformation + NormalStream + PositionStream4
    ├── ComputeShaderBase
    └── TextureFX hierarchy (vvvv)
```

---

## Starting Points

### VS_PS_Base (vvvv)
**Use for:** Custom draw shaders

**Provides:**
- `VSMain()` and `PSMain()` structure
- Already inherits `ShaderBase`, `Transformation`, `NormalStream`, `PositionStream4`
- You get matrices, position, and normals automatically

```hlsl
shader My_DrawFX : VS_PS_Base
{
    override stage void VSMain() { }
    override stage void PSMain() { }
};
```

---

### ComputeShaderBase
**Use for:** Compute shaders

**Provides:**
- `Compute()` method to override
- `streams.DispatchThreadId` (uint3)
- `streams.GroupId` (uint3)
- `streams.GroupThreadId` (uint3)

```hlsl
shader My_ComputeFX : ComputeShaderBase
{
    override void Compute() { }
};
```

---

### FilterBase (vvvv)
**Use for:** Single-texture effects

**Provides:**
- `Texture0` input
- `Sampler`
- `ViewSize` (float2)

```hlsl
shader My_TextureFX : FilterBase
{
    float4 Filter(float4 tex0col) { return tex0col; }
};
```

---

### MixerBase (vvvv)
**Use for:** Blend two textures

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

### TextureFX (vvvv)
**Use for:** Generators (sources)

**Provides:**
- Basic texture effect structure
- Use with `[TextureSource]` attribute

```hlsl
[TextureSource]
shader My_TextureFX : TextureFX
{
    stage override float4 Shading() { return float4(1,0,0,1); }
};
```

---

### ComputeColor
**Use for:** Material slot shaders

**Provides:**
- `Compute()` method returning float4
- Pluggable into material properties

```hlsl
shader My_ShaderFX : ComputeColor
{
    override float4 Compute() { return float4(1,0,0,1); }
};
```

---

## Stream Providers

### ShaderBaseStream
**Provides:**
- `streams.ShadingPosition` (float4) — VS output
- `streams.ColorTarget` (float4) — PS output
- `streams.InstanceID` (uint)
- `streams.VertexID` (uint)

Usually inherited automatically via VS_PS_Base.

---

### PositionStream4
**Provides:**
- `streams.Position` (float4) — vertex position, POSITION semantic

---

### Texturing
**Provides:**
- `streams.TexCoord` (float2)
- `Sampler` — default linear sampler
- Helper functions for texture sampling

---

### NormalStream
**Provides:**
- `streams.Normal` (float3) — normalized normal
- `streams.meshNormal` (float3) — raw mesh normal

---

### ColorStream
**Provides:**
- `streams.Color` (float4) — vertex color

---

### TangentStream
**Provides:**
- `streams.Tangent` (float4) — tangent for normal mapping

---

## Transform Matrices

### Transformation
**Provides:**
- `World` — object to world
- `WorldInverse`
- `View` — world to camera
- `ViewInverse`
- `Projection` — camera to clip
- `WorldView`
- `ViewProjection`
- `WorldViewProjection`
- `Eye` (float3) — camera position
- `EyeMS` (float3) — camera in model space

---

### TransformationWAndVP
**Lighter alternative:**
- `World`
- `ViewProjection`

Use when you don't need all the matrix variations.

---

## Time & Animation

### Global
**Provides:**
- `Time` (float) — seconds since start
- `TimeStep` (float) — delta time

```hlsl
shader My_DrawFX : VS_PS_Base, Global
{
    override stage void PSMain()
    {
        float pulse = sin(Time * 3.14);
    }
};
```

---

## Instancing

### InstanceWorldBuffer
**Provides:**
- `InstanceWorld` buffer — per-instance transforms

```hlsl
shader My_DrawFX : VS_PS_Base, InstanceWorldBuffer
{
    override stage void VSMain()
    {
        float4x4 w = InstanceWorld[streams.InstanceID].Matrix;
    }
};
```

---

## Utility Shaders

### ShaderUtils (vvvv)
**Provides:** Math constants and helpers
- `PI`, `TWO_PI`, `PI_OVER_TWO`
- Various utility functions

---

### ColorUtility
**Provides:** Color space conversions
- `LinearToSRGB()`
- `SRGBToLinear()`
- HSV/HSL conversions

---

## Finding More

1. **Shader Explorer** — browse the complete hierarchy
2. **VL.Stride shaders folder** — `lib/packs/VL.Stride.Runtime/.../Effects`
3. **Stride source** — for engine-level shaders
