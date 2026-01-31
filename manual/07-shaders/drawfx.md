# DrawFX [vvvv]

> Render geometry with custom vertex and pixel shaders.

**Note:** DrawFX and `VS_PS_Base` are vvvv-specific. In Stride, use `ShaderBase` with `Transformation` instead.

---

## File Naming

For vvvv to recognize your shader as a DrawFX node:

1. Place the file in a `shaders` folder next to your `.vl` document
2. Name the file: `YourName_DrawFX.sdsl`
3. Name the shader: `YourName_DrawFX`

```
MyProject/
├── MyProject.vl
└── shaders/
    └── Flat_DrawFX.sdsl
```

The node appears as `Flat` in the NodeBrowser under `Stride > Draw`.

---

## Minimal Example

```hlsl
shader Flat_DrawFX : VS_PS_Base
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

- `VS_PS_Base` (vvvv-only) provides shader structure and `WorldViewProjection` (via `Transformation`)
- `streams.Position` comes from the geometry
- `streams.ShadingPosition` is the clip-space output (SV_POSITION)
- `streams.ColorTarget` is the pixel output (SV_TARGET)

---

## What VS_PS_Base Gives You

`VS_PS_Base` is a vvvv convenience shader. It already inherits:
- `ShaderBase` → `VSMain()`, `PSMain()` entry points
- `ShaderBaseStream` → `streams.ShadingPosition`, `streams.ColorTarget`, `streams.InstanceID`

So you don't need to add `ShaderBaseStream` separately.

---

## Adding Capabilities

Start with `VS_PS_Base`, then add what you need:

```hlsl
// VS_PS_Base already includes Transformation (matrices)
shader MyShader_DrawFX : VS_PS_Base { }

// Need UVs
shader MyShader_DrawFX : VS_PS_Base, Texturing { }

// Need normals (NormalStream is also in VS_PS_Base)
shader MyShader_DrawFX : VS_PS_Base { }

// Need vertex colors
shader MyShader_DrawFX : VS_PS_Base, ColorStream { }
```

---

## Passing Data from Vertex to Pixel Shader

Use `stream` variables. They automatically pass between stages:

```hlsl
shader Gradient_DrawFX : VS_PS_Base, Texturing
{
    stream float3 worldPos;    // Custom stream variable

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
        streams.worldPos = mul(streams.Position, World).xyz;
    }

    override stage void PSMain()
    {
        // Access the interpolated world position
        float height = streams.worldPos.y;
        streams.ColorTarget = float4(height, height, height, 1);
    }
};
```

No need to define structs or semantics. The compiler handles it.

---

## Using Textures

```hlsl
shader Textured_DrawFX : VS_PS_Base, Texturing
{
    Texture2D DiffuseTexture;

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        float4 texColor = DiffuseTexture.Sample(Sampler, streams.TexCoord);
        streams.ColorTarget = texColor;
    }
};
```

`Sampler` and `streams.TexCoord` come from `Texturing`.

---

## Using Normals

```hlsl
shader Lit_DrawFX : VS_PS_Base
{
    float3 LightDir = float3(0, 1, 0);

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        float3 n = normalize(streams.Normal);
        float ndotl = saturate(dot(n, normalize(LightDir)));
        streams.ColorTarget = float4(ndotl, ndotl, ndotl, 1);
    }
};
```

`streams.Normal` comes from `NormalStream`.

---

## Vertex Colors

```hlsl
shader VertexColor_DrawFX : VS_PS_Base, ColorStream
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = streams.Color;
    }
};
```

`streams.Color` comes from `ColorStream`.

---

## Multiple Render Targets (MRT)

Output to multiple textures:

```hlsl
shader MRT_DrawFX : VS_PS_Base
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = float4(1, 0, 0, 1);   // RT0: color
        streams.ColorTarget1 = float4(streams.Normal * 0.5 + 0.5, 1);  // RT1: normals
    }
};
```

`ColorTarget`, `ColorTarget1`, `ColorTarget2`, `ColorTarget3` map to SV_TARGET0-3.

---

## Using Time

```hlsl
shader Animated_DrawFX : VS_PS_Base, Global
{
    override stage void VSMain()
    {
        float4 pos = streams.Position;
        pos.y += sin(Time + pos.x) * 0.1;  // Wave animation
        streams.ShadingPosition = mul(pos, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = float4(1, 1, 1, 1);
    }
};
```

`Time` and `TimeStep` come from `Global`.

---

## Available Matrices (from Transformation)

| Matrix | Description |
|--------|-------------|
| `World` | Object to world |
| `View` | World to camera |
| `Projection` | Camera to clip |
| `WorldView` | Object to camera |
| `ViewProjection` | World to clip |
| `WorldViewProjection` | Object to clip |
| `WorldInverse` | Inverse world |
| `ViewInverse` | Inverse view (camera position in `[3].xyz`) |

---

## Common Pattern: Transform then Shade

Most DrawFX shaders follow this pattern:

```hlsl
shader MyShader_DrawFX : VS_PS_Base, Texturing
{
    // Parameters
    Texture2D DiffuseMap;
    [Color] float4 Tint = float4(1, 1, 1, 1);

    // Vertex: transform to clip space
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    // Pixel: compute final color
    override stage void PSMain()
    {
        float4 tex = DiffuseMap.Sample(Sampler, streams.TexCoord);
        streams.ColorTarget = tex * Tint;
    }
};
```
