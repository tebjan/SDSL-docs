# Streams

> Data flows through the pipeline. You don't manage it.

---

## The Problem in HLSL

In standard HLSL, you manually define structs and pass them between stages:

```hlsl
struct VS_INPUT {
    float4 Position : POSITION;
    float2 TexCoord : TEXCOORD0;
    float4 Color : COLOR0;
};

struct VS_OUTPUT {
    float4 Position : SV_POSITION;
    float2 TexCoord : TEXCOORD0;
    float4 Color : COLOR0;
};

VS_OUTPUT VSMain(VS_INPUT input) {
    VS_OUTPUT output;
    output.Position = mul(input.Position, WorldViewProjection);
    output.TexCoord = input.TexCoord;
    output.Color = input.Color;
    return output;
}

float4 PSMain(VS_OUTPUT input) : SV_TARGET {
    return input.Color;
}
```

You repeat yourself constantly. The struct, the semantics, the passing, the return.

---

## The Solution in SDSL

Declare a `stream` variable once. Use it anywhere.

```hlsl
shader MyShader : VS_PS_Base
{
    stream float4 Color : COLOR0;

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
        streams.Color = float4(1, 0, 0, 1);  // Write here
    }

    override stage void PSMain()
    {
        streams.ColorTarget = streams.Color;  // Read here
    }
};
```

No input struct. No output struct. No return statement. Just `streams.X`.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ┌──────────┐      streams       ┌──────────┐             │
│   │          │ ──────────────────▶│          │             │
│   │    VS    │   Position         │    PS    │             │
│   │          │   TexCoord         │          │             │
│   │          │   Color            │          │             │
│   │          │   ShadingPosition  │          │             │
│   └──────────┘                    └──────────┘             │
│        │                               │                    │
│        │                               ▼                    │
│        │                         ColorTarget ──▶ Screen    │
│        ▼                                                    │
│   ShadingPosition ──▶ Rasterizer                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

The `streams` container is a global struct that:

1. **Collects** all `stream` variables from your shader and all inherited shaders
2. **Passes** them automatically between stages
3. **Handles** semantics (SV_POSITION, SV_TARGET, etc.) behind the scenes

You write to `streams.X` in the vertex shader. You read from `streams.X` in the pixel shader. The plumbing is automatic.

---

## The Two Keywords

### `stream`

Declares a variable that exists at every stage.

```hlsl
stream float4 Color : COLOR0;      // With semantic
stream float3 WorldNormal;         // Without (auto-assigned)
stream float CustomValue;          // Any type works
```

### `streams`

The global container. Access any stream variable through it.

```hlsl
streams.Position          // Vertex position (from PositionStream4)
streams.ShadingPosition   // Clip-space position (to rasterizer)
streams.TexCoord          // Texture coordinates (from Texturing)
streams.ColorTarget       // Pixel output (to render target)
streams.Color             // Your custom stream
```

---

## What You Get from Base Shaders

You don't need to declare common streams yourself. Inherit them.

| Inherit | You get |
|---------|---------|
| `PositionStream4` | `streams.Position` (float4) |
| `Texturing` | `streams.TexCoord` (float2) |
| `NormalStream` | `streams.meshNormal` (float3) |
| `ShaderBaseStream` | `streams.ShadingPosition`, `streams.ColorTarget`, `streams.InstanceID` |
| `ColorBase` | `streams.Color` (float4) |

This is why inheritance matters. More on that in the next section.

---

## Common Patterns

### Pass data from VS to PS

```hlsl
stream float3 WorldPos;

override stage void VSMain()
{
    // ... transform position ...
    streams.WorldPos = mul(streams.Position, World).xyz;
}

override stage void PSMain()
{
    float3 wp = streams.WorldPos;  // Available here
    // ...
}
```

### Multiple render targets

```hlsl
stream float4 ColorTarget1 : SV_TARGET1;

override stage void PSMain()
{
    streams.ColorTarget = albedo;       // Target 0
    streams.ColorTarget1 = normals;     // Target 1
}
```

### Use built-in streams

```hlsl
override stage void PSMain()
{
    float2 uv = streams.TexCoord;           // From Texturing
    uint id = streams.InstanceID;           // From ShaderBaseStream
    float3 n = streams.meshNormal;          // From NormalStream
}
```

---

## Summary

| HLSL | SDSL |
|------|------|
| Define input struct | Inherit base shader |
| Define output struct | Declare `stream` variables |
| Pass struct to function | Access via `streams.X` |
| Return output | Assign to `streams.X` |
| Repeat semantics everywhere | Declare once or inherit |

The mental model: **streams is a global bag of variables that flows through the pipeline.** You put things in, you take things out. The compiler handles the rest.
