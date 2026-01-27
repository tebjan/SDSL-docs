# ShaderFX [vvvv]

> Build material properties from shader pieces.

---

## What ShaderFX Does

ShaderFX shaders create **GPU values** that plug into materials. Instead of a static color or texture, you provide a shader that computes the value per-pixel.

```
┌─────────────────┐     ┌─────────────────┐
│ Noise_ShaderFX  │────▶│                 │
│ (GPU<Vector4>)  │     │   Material      │────▶ Rendered Object
└─────────────────┘     │                 │
┌─────────────────┐     │                 │
│ Wave_ShaderFX   │────▶│                 │
│ (GPU<Float>)    │     └─────────────────┘
└─────────────────┘
```

---

## The GPU<T> Type System

In vvvv, ShaderFX outputs typed GPU values:

| Output Type | vvvv Pin Type | Base Class |
|-------------|---------------|------------|
| float4 (color/vector) | `GPU<Vector4>` | `ComputeColor` |
| float (scalar) | `GPU<Float>` | `ComputeFloat` |
| float2 | `GPU<Vector2>` | `ComputeFloat2` |
| float3 | `GPU<Vector3>` | `ComputeFloat3` |

These aren't CPU values. They're **shader code** that executes on the GPU during rendering.

---

## The Concept

Stride materials have slots for diffuse color, normal maps, emissive, displacement, etc. Each slot expects a shader that returns a color or value. You write a shader that inherits from `ComputeColor` (or similar), and it becomes pluggable into any material slot.

---

## File Naming

For material extension shaders:

1. Place the file in a `shaders` folder next to your `.vl` document
2. Name the file: `YourName_ShaderFX.sdsl`
3. Name the shader: `YourName_ShaderFX`

The `_ShaderFX` suffix creates a composable shader piece (not a standalone node).

---

## Basic Example: Custom Color

```hlsl
shader RedPulse_ShaderFX : ComputeColor, Global
{
    override float4 Compute()
    {
        float pulse = sin(Time * 3.14) * 0.5 + 0.5;
        return float4(pulse, 0, 0, 1);
    }
};
```

This shader:
- Inherits from `ComputeColor` (required for material slots)
- Inherits from `Global` (for time access)
- Returns a pulsing red color

In vvvv, this appears as a `GPU<Vector4>` that you can connect to material color inputs.

---

## Using Texture Coordinates

```hlsl
shader UVGradient_ShaderFX : ComputeColor, Texturing
{
    override float4 Compute()
    {
        return float4(streams.TexCoord, 0, 1);
    }
};
```

Inherit from `Texturing` to access `streams.TexCoord`.

---

## Using World Position

```hlsl
shader HeightGradient_ShaderFX : ComputeColor, PositionStream4, Transformation
{
    float MinHeight = 0;
    float MaxHeight = 10;

    override float4 Compute()
    {
        float3 worldPos = mul(streams.Position, World).xyz;
        float t = saturate((worldPos.y - MinHeight) / (MaxHeight - MinHeight));
        return float4(t, t, t, 1);
    }
};
```

---

## Displacement (Vertex Offset)

For displacement maps, return a float in the red channel:

```hlsl
shader WaveDisplace_ShaderFX : ComputeColor, Texturing, Global
{
    float Amplitude = 0.1;
    float Frequency = 2;

    override float4 Compute()
    {
        float displacement = sin(streams.TexCoord.x * Frequency * 6.28 + Time) * Amplitude;
        return float4(displacement, 0, 0, 1);
    }
};
```

Material displacement uses the `.x` (red) component as the offset amount.

---

## Using Textures

```hlsl
shader TextureLookup_ShaderFX : ComputeColor, Texturing
{
    Texture2D MyTexture;

    override float4 Compute()
    {
        return MyTexture.Sample(Sampler, streams.TexCoord);
    }
};
```

---

## Composition Inputs

Accept other shaders as inputs using `compose`:

```hlsl
shader Blend_ShaderFX : ComputeColor
{
    compose ComputeColor ColorA;
    compose ComputeColor ColorB;
    float BlendFactor = 0.5;

    override float4 Compute()
    {
        float4 a = ColorA.Compute();
        float4 b = ColorB.Compute();
        return lerp(a, b, BlendFactor);
    }
};
```

In vvvv, `ColorA` and `ColorB` become `GPU<Vector4>` input pins.

---

## Per-Instance Data

Access instance data in material shaders:

```hlsl
shader InstanceColor_ShaderFX : ComputeColor, ShaderBaseStream
{
    StructuredBuffer<float4> InstanceColors;

    override float4 Compute()
    {
        return InstanceColors[streams.InstanceID];
    }
};
```

`streams.InstanceID` comes from `ShaderBaseStream`.

---

## Material Slots Reference

| Slot | Expected Return | Used Component |
|------|-----------------|----------------|
| Diffuse / Albedo | float4 | RGBA color |
| Emissive | float4 | RGB color |
| Normal Map | float4 | RGB as normal |
| Metalness | float4 | R only |
| Roughness | float4 | R only |
| Displacement | float4 | R only |
| Occlusion | float4 | R only |

All slots use `ComputeColor` which returns `float4`. Single-value slots read only the red channel.

---

## Connecting in vvvv

1. Create your `_ShaderFX` shader
2. Find it in NodeBrowser (under Stride category)
3. It outputs `GPU<Vector4>`
4. Connect to material input pins (Diffuse, Emissive, etc.)

The shader executes per-pixel during material rendering, with full access to the vertex data.

---

## Building Shader Networks

ShaderFX shaders can connect to each other, forming networks:

```hlsl
// First shader: generate base pattern
shader Checker_ShaderFX : ComputeColor, Texturing
{
    float Scale = 10;
    
    override float4 Compute()
    {
        float2 uv = streams.TexCoord * Scale;
        float checker = fmod(floor(uv.x) + floor(uv.y), 2);
        return float4(checker, checker, checker, 1);
    }
};

// Second shader: blend two inputs
shader Blend_ShaderFX : ComputeColor
{
    compose ComputeColor InputA;
    compose ComputeColor InputB;
    compose ComputeFloat BlendAmount;  // Also a ShaderFX!
    
    override float4 Compute()
    {
        float4 a = InputA.Compute();
        float4 b = InputB.Compute();
        float t = BlendAmount.Compute();  // GPU-computed blend factor
        return lerp(a, b, t);
    }
};

// Third shader: animated blend factor
shader PulseBlend_ShaderFX : ComputeFloat, Global
{
    float Speed = 1;
    
    override float Compute()
    {
        return sin(Time * Speed) * 0.5 + 0.5;
    }
};
```

In vvvv:
```
Checker_ShaderFX ──────┐
                       ├──▶ Blend_ShaderFX ──▶ Material.Diffuse
SolidColor_ShaderFX ───┘          ▲
                                  │
PulseBlend_ShaderFX ──────────────┘
```

Everything executes on GPU. No CPU round-trips.

---

## ComputeFloat vs ComputeColor

| Base Class | Returns | Use For |
|------------|---------|---------|
| `ComputeColor` | float4 | Colors, vectors |
| `ComputeFloat` | float | Scalar values (roughness, blend) |
| `ComputeFloat2` | float2 | UV offsets |
| `ComputeFloat3` | float3 | Positions, directions |

Most material slots accept `ComputeColor`. Single-value slots (metalness, roughness) read only the `.x` component.

---

## Extractors: GPU → Shader Value

Sometimes you need to use a GPU value inside a ShaderFX that expects composition:

```hlsl
shader UseGPUValue_ShaderFX : ComputeColor
{
    // This creates a GPU<Vector4> input pin
    compose ComputeColor ExternalColor;
    
    override float4 Compute()
    {
        // Call .Compute() to get the value
        float4 color = ExternalColor.Compute();
        return color * 2;  // Brighten
    }
};
```

The `compose` keyword creates an input pin. Connect any `GPU<Vector4>` to it.

---

## When to Use ShaderFX

**Use ShaderFX when:**
- Material property needs to be computed (not static)
- Value depends on UV, position, time, etc.
- You want to build reusable material building blocks
- You need per-pixel variation

**Don't use ShaderFX when:**
- A static value or texture works fine
- You're writing a standalone effect (use TextureFX, DrawFX)
- Performance is critical and a baked texture would work
