# Basic Shaders

> Writing shaders directly in Stride Game Studio.

In Stride, you write `.sdsl` files and use them through the effect system. No special naming conventions required.

---

## Draw Shader

A basic shader that renders geometry:

```hlsl
shader FlatColor : ShaderBase, Transformation, PositionStream4
{
    [Color]
    float4 Color = float4(1, 1, 1, 1);

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = Color;
    }
};
```

**What you inherit:**

- `ShaderBase` - Entry points (`VSMain`, `PSMain`)
- `Transformation` - Matrix uniforms (`World`, `View`, `Projection`, `WorldViewProjection`)
- `PositionStream4` - `streams.Position` input

---

## Textured Shader

```hlsl
shader TexturedMesh : ShaderBase, Transformation, PositionStream4, Texturing
{
    Texture2D DiffuseTexture;

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = DiffuseTexture.Sample(Sampler, streams.TexCoord);
    }
};
```

`Texturing` provides:

- `streams.TexCoord` - UV coordinates
- `Sampler` - Default sampler state
- `Texture0` through `Texture9` - Texture slots

---

## Compute Shader

```hlsl
shader DataProcessor : ComputeShaderBase
{
    RWStructuredBuffer<float> Data;
    int Count;

    override void Compute()
    {
        uint i = streams.DispatchThreadId.x;
        if (i >= Count) return;

        Data[i] = Data[i] * 2;
    }
};
```

Use with an effect file:

```csharp
effect DataProcessorEffect
{
    mixin DataProcessor;
};
```

---

## Material Shader (ComputeColor)

For material property slots:

```hlsl
shader PulsingColor : ComputeColor, Global
{
    [Color]
    float4 BaseColor = float4(1, 0, 0, 1);

    override float4 Compute()
    {
        float pulse = sin(Time * 3.14) * 0.5 + 0.5;
        return BaseColor * pulse;
    }
};
```

This can be assigned to material slots (Diffuse, Emissive, etc.) in Stride Game Studio.

---

## Common Base Classes

| Base Class | Provides |
| ---------- | -------- |
| `ShaderBase` | `VSMain()`, `PSMain()` entry points |
| `ShaderBaseStream` | `streams.ShadingPosition`, `streams.ColorTarget` |
| `Transformation` | Matrix uniforms |
| `PositionStream4` | `streams.Position` |
| `NormalStream` | `streams.Normal` |
| `Texturing` | `streams.TexCoord`, `Sampler`, texture slots |
| `Global` | `Time`, `TimeStep` |
| `ComputeShaderBase` | `Compute()` entry point |
| `ComputeColor` | Material property shader base |
