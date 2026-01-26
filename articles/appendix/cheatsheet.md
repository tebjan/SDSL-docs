# Cheat Sheet

One-page reference.

---

## Keywords

| Keyword | Meaning |
|---------|---------|
| `stream` | Variable passed between shader stages |
| `streams` | Global container for all stream variables |
| `stage` | Single instance across inheritance chain |
| `override` | Replace parent method |
| `compose` | Pluggable shader slot |
| `clone` | Force separate instance per composition |

---

## File Naming (vvvv)

| Suffix | Creates |
|--------|---------|
| `_TextureFX` | Texture effect node |
| `_DrawFX` | Draw shader node |
| `_ComputeFX` | Compute shader node |
| `_ShaderFX` | Composable piece (GPU value) |
| (no suffix) | Not a node, inherit only |

---

## Common Inheritance

| Need | Inherit From | Platform |
|------|--------------|----------|
| VS + PS structure | `VS_PS_Base` | vvvv only |
| Compute structure | `ComputeShaderBase` | Stride |
| Filter effect | `FilterBase` | vvvv only |
| Mixer effect | `MixerBase` | vvvv only |
| Texture source | `TextureFX` + `[TextureSource]` | vvvv only |
| Material slot | `ComputeColor` | Stride |
| Position | `PositionStream4` | Stride |
| UVs + Sampler | `Texturing` | Stride |
| Normals | `NormalStream` | Stride |
| Vertex color | `ColorStream` | Stride |
| Matrices | `Transformation` | Stride |
| Time | `Global` | Stride |
| Instance ID | `ShaderBaseStream` | Stride |
| Instancing transforms | `InstanceWorldBuffer` | Stride |
| Math helpers | `ShaderUtils` | vvvv only |

---

## Key Streams

| Stream | Type | Where |
|--------|------|-------|
| `streams.Position` | `float4` | VS in |
| `streams.ShadingPosition` | `float4` | VS out |
| `streams.TexCoord` | `float2` | VS/PS |
| `streams.Normal` | `float3` | VS/PS |
| `streams.Color` | `float4` | VS/PS |
| `streams.ColorTarget` | `float4` | PS out |
| `streams.InstanceID` | `uint` | VS |
| `streams.DispatchThreadId` | `uint3` | CS |

---

## Key Matrices (from Transformation)

| Matrix | Description |
|--------|-------------|
| `World` | Object → World |
| `View` | World → Camera |
| `Projection` | Camera → Clip |
| `WorldView` | Object → Camera |
| `ViewProjection` | World → Clip |
| `WorldViewProjection` | Object → Clip |
| `WorldInverse` | Inverse of World |

---

## Attributes

| Attribute | Effect |
|-----------|--------|
| `[Color]` | Color picker |
| `[Default(x)]` | Default value |
| `[Summary("...")]` | Tooltip |
| `[Optional]` | Can be unconnected |
| `[EnumType("...")]` | Dropdown |
| `[Category("...")]` | Node browser category |
| `[Tags("...")]` | Search tags |
| `[TextureSource]` | Source (generator) shader |
| `[OutputFormat("...")]` | Output pixel format |

---

## Buffer Types

| Type | Access |
|------|--------|
| `StructuredBuffer<T>` | Read only |
| `RWStructuredBuffer<T>` | Read/write |
| `Texture2D` | Read only |
| `RWTexture2D<T>` | Read/write |

---

## TextureFX Methods [vvvv only]

| Base | Override | Parameters |
|------|----------|------------|
| `FilterBase` | `Filter()` | `float4 tex0col` |
| `MixerBase` | `Mix()` | `float4 tex0col, float4 tex1col, float fader` |
| `TextureFX` | `Shading()` | (none) |

---

## Compute Basics

```hlsl
[numthreads(64, 1, 1)]  // Thread group size
override void Compute()
{
    uint id = streams.DispatchThreadId.x;
    if (id >= Count) return;  // ALWAYS bounds check
    // ...
}
```

---

## Quick Patterns

**Custom stream variable:**
```hlsl
stream float3 myData;
```

**Static function call:**
```hlsl
float result = OtherShader.MyStaticFunction(x);
```

**Sample texture:**
```hlsl
float4 col = MyTexture.Sample(Sampler, uv);
```

**Time access:**
```hlsl
// Inherit Global
float t = Time;
float dt = TimeStep;
```
