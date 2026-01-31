# Common Searches

> Quick answers to "how do I get X?"

---

## Transforms & Matrices

| I need... | Inherit | Use |
|-----------|---------|-----|
| World matrix | `Transformation` | `World` |
| View matrix | `Transformation` | `View` |
| Projection matrix | `Transformation` | `Projection` |
| Combined MVP | `Transformation` | `WorldViewProjection` |
| World → Camera | `Transformation` | `WorldView` |
| World → Clip | `Transformation` | `ViewProjection` |
| Inverse world | `Transformation` | `WorldInverse` |
| Camera position | `Transformation` | `Eye` |
| Camera in model space | `Transformation` | `EyeMS` |

---

## Vertex Data

| I need... | Inherit | Use |
|-----------|---------|-----|
| Vertex position | `PositionStream4` or `VS_PS_Base` (vvvv) | `streams.Position` |
| Texture coordinates | `Texturing` | `streams.TexCoord` |
| Normal vector | `NormalStream` | `streams.Normal` |
| Vertex color | `ColorStream` | `streams.Color` |
| Tangent | `TangentStream` | `streams.Tangent` |
| Bitangent | `TangentStream` | `streams.Bitangent` |

---

## Instancing & IDs

| I need... | Inherit | Use |
|-----------|---------|-----|
| Instance ID | `ShaderBaseStream` or `VS_PS_Base` (vvvv) | `streams.InstanceID` |
| Vertex ID | `ShaderBaseStream` or `VS_PS_Base` (vvvv) | `streams.VertexID` |
| Per-instance transforms | `InstanceWorldBuffer` | `InstanceWorld[id].Matrix` |

---

## Compute Shader

| I need... | Inherit | Use |
|-----------|---------|-----|
| Thread ID (1D) | `ComputeShaderBase` | `streams.DispatchThreadId.x` |
| Thread ID (3D) | `ComputeShaderBase` | `streams.DispatchThreadId` |
| Group ID | `ComputeShaderBase` | `streams.GroupId` |
| Thread in group | `ComputeShaderBase` | `streams.GroupThreadId` |

---

## Time & Animation

| I need... | Inherit | Use |
|-----------|---------|-----|
| Time (seconds) | `Global` | `Time` |
| Delta time | `Global` | `TimeStep` |

---

## Textures & Sampling

| I need... | Inherit | Use |
|-----------|---------|-----|
| Default sampler | `Texturing` | `Sampler` |
| Texture size | `TextureFX` (vvvv) or compute manually | `ViewSize` |

---

## Output

| I need... | Inherit | Use |
|-----------|---------|-----|
| Pixel color output | `ShaderBaseStream` or `VS_PS_Base` (vvvv) | `streams.ColorTarget` |
| Vertex output position | `ShaderBaseStream` or `VS_PS_Base` (vvvv) | `streams.ShadingPosition` |
| Multiple render targets | `ShaderBaseStream` | `streams.ColorTarget1`, `ColorTarget2`, etc. |

---

## Material Slots

| I need... | Inherit | Override |
|-----------|---------|----------|
| Pluggable color | `ComputeColor` | `float4 Compute()` |
| Pluggable float | `ComputeFloat` | `float Compute()` |

---

## TextureFX Bases [vvvv]

| I need... | Inherit | Override |
|-----------|---------|----------|
| Single texture filter | `FilterBase` | `float4 Filter(float4 tex0col)` |
| Blend two textures | `MixerBase` | `float4 Mix(float4 a, float4 b, float fader)` |
| Generate texture | `TextureFX` + `[TextureSource]` | `float4 Shading()` |

---

## Utility Functions

| I need... | Inherit or Static Call | Use |
|-----------|------------------------|-----|
| PI constant | `ShaderUtils` (vvvv) | `PI`, `TWO_PI` |
| Linear↔sRGB | `ColorUtility` | `LinearToSRGB()`, `SRGBToLinear()` |

---

## Quick Inheritance Patterns

**Basic draw shader (vvvv):**
```hlsl
shader My_DrawFX : VS_PS_Base, Texturing
```

**Draw with normals (vvvv)** — VS_PS_Base includes NormalStream:
```hlsl
shader My_DrawFX : VS_PS_Base
```

**Draw with instancing (vvvv):**
```hlsl
shader My_DrawFX : VS_PS_Base, InstanceWorldBuffer
```

**Draw with time (vvvv):**
```hlsl
shader My_DrawFX : VS_PS_Base, Global
```

**Compute shader (Stride):**
```hlsl
shader My_ComputeFX : ComputeShaderBase
```

**Material piece (Stride):**
```hlsl
shader My_ShaderFX : ComputeColor, Texturing
```

**Texture filter (vvvv):**
```hlsl
shader My_TextureFX : FilterBase
```
