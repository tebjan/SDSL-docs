# HLSL to SDSL

> Side-by-side conversion guide.

---

## Quick Reference

| HLSL | SDSL |
|------|------|
| `struct VS_INPUT { ... }` | Inherit `PositionStream4`, `Texturing`, etc. |
| `struct VS_OUTPUT { ... }` | Use `stream` variables |
| `VS_OUTPUT VSMain(VS_INPUT i)` | `override stage void VSMain()` |
| `return output;` | Assign to `streams.X` |
| `cbuffer CB { float4x4 MVP; }` | Inherit `Transformation` or declare directly |
| `Texture2D tex : register(t0);` | `Texture2D tex;` |
| `SamplerState samp : register(s0);` | Inherit `Texturing` for `Sampler` |
| `#include "file.hlsl"` | Inherit from shader or use static calls |

---

## Full Example

### HLSL (Before)

```hlsl
struct VS_INPUT {
    float4 Position : POSITION;
    float2 TexCoord : TEXCOORD0;
    float3 Normal : NORMAL;
};

struct VS_OUTPUT {
    float4 Position : SV_POSITION;
    float2 TexCoord : TEXCOORD0;
    float3 Normal : TEXCOORD1;
};

cbuffer PerFrame {
    float4x4 WorldViewProjection;
    float4x4 World;
};

Texture2D DiffuseTexture : register(t0);
SamplerState LinearSampler : register(s0);

VS_OUTPUT VSMain(VS_INPUT input) {
    VS_OUTPUT output;
    output.Position = mul(input.Position, WorldViewProjection);
    output.TexCoord = input.TexCoord;
    output.Normal = mul(input.Normal, (float3x3)World);
    return output;
}

float4 PSMain(VS_OUTPUT input) : SV_TARGET {
    float4 tex = DiffuseTexture.Sample(LinearSampler, input.TexCoord);
    float light = saturate(dot(normalize(input.Normal), float3(0, 1, 0)));
    return tex * light;
}
```

### SDSL (After)

```hlsl
shader MyShader_DrawFX : VS_PS_Base, Texturing
{
    Texture2D DiffuseTexture;

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
        streams.Normal = mul(streams.Normal, (float3x3)World);
    }

    override stage void PSMain()
    {
        float4 tex = DiffuseTexture.Sample(Sampler, streams.TexCoord);
        float light = saturate(dot(normalize(streams.Normal), float3(0, 1, 0)));
        streams.ColorTarget = tex * light;
    }
};
```

---

## What Disappears

| HLSL Boilerplate | Why It's Gone |
|------------------|---------------|
| Input struct | Inherited via `PositionStream4`, `Texturing`, `NormalStream` |
| Output struct | `stream` variables pass automatically between stages |
| Semantics (POSITION, SV_POSITION, etc.) | Defined in base shaders |
| Register bindings | Automatic |
| Return statements | Assign to `streams.ColorTarget`, `streams.ShadingPosition` |
| cbuffer for matrices | Inherited from `Transformation` |

---

## Textures

### HLSL
```hlsl
Texture2D MyTexture : register(t0);
SamplerState MySampler : register(s0);

float4 color = MyTexture.Sample(MySampler, uv);
```

### SDSL
```hlsl
// Inherit Texturing for Sampler, or declare your own
shader MyShader : VS_PS_Base, Texturing
{
    Texture2D MyTexture;

    override stage void PSMain()
    {
        float4 color = MyTexture.Sample(Sampler, streams.TexCoord);
    }
};
```

No register bindings needed. `Sampler` comes from `Texturing`.

---

## Constant Buffers

### HLSL
```hlsl
cbuffer PerMaterial {
    float4 Color;
    float Intensity;
};
```

### SDSL
```hlsl
shader MyShader : VS_PS_Base
{
    // Option 1: Just declare them (simplest)
    float4 Color;
    float Intensity;

    // Option 2: Explicit cbuffer (for grouping)
    cbuffer PerMaterial
    {
        float4 Color;
        float Intensity;
    }
};
```

For most cases, just declare variables directly. The compiler handles the rest.

---

## Passing Data Between Stages

### HLSL
```hlsl
struct VS_OUTPUT {
    float4 Position : SV_POSITION;
    float3 WorldPos : TEXCOORD0;
    float3 Normal : TEXCOORD1;
};

VS_OUTPUT VSMain(VS_INPUT i) {
    VS_OUTPUT o;
    o.Position = mul(i.Position, WVP);
    o.WorldPos = mul(i.Position, World).xyz;
    o.Normal = i.Normal;
    return o;
}

float4 PSMain(VS_OUTPUT i) : SV_TARGET {
    // use i.WorldPos, i.Normal
}
```

### SDSL
```hlsl
shader MyShader : VS_PS_Base
{
    stream float3 worldPos;    // Custom stream variable

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
        streams.worldPos = mul(streams.Position, World).xyz;
    }

    override stage void PSMain()
    {
        // Use streams.worldPos, streams.Normal
        streams.ColorTarget = float4(streams.worldPos, 1);
    }
};
```

Declare custom `stream` variables. They pass between stages automatically.

---

## Common Conversions

### Input position
```hlsl
// HLSL
float4 pos = input.Position;

// SDSL
float4 pos = streams.Position;  // from PositionStream4
```

### Output position
```hlsl
// HLSL
output.Position = mul(pos, WVP);
return output;

// SDSL
streams.ShadingPosition = mul(pos, WorldViewProjection);
```

### Output color
```hlsl
// HLSL
return float4(1, 0, 0, 1);

// SDSL
streams.ColorTarget = float4(1, 0, 0, 1);
```

### Texture coordinates
```hlsl
// HLSL
float2 uv = input.TexCoord;

// SDSL
float2 uv = streams.TexCoord;  // from Texturing
```

### Normals
```hlsl
// HLSL
float3 n = input.Normal;

// SDSL
float3 n = streams.Normal;  // from NormalStream
```

---

## Things That Stay the Same

- All HLSL intrinsic functions (`mul`, `dot`, `normalize`, `saturate`, `lerp`, etc.)
- Texture sampling syntax (`Texture.Sample(Sampler, uv)`)
- Math operations
- Control flow (`if`, `for`, `while`)
- Swizzling (`.xyz`, `.rgb`, etc.)

SDSL is HLSL plus inheritance and streams. The core language is identical.
