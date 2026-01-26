# TextureFX [vvvv]

> Process textures on the GPU. Filters, mixers, generators.

**Note:** TextureFX, `FilterBase`, and `MixerBase` are vvvv-specific. In Stride, use `ImageEffectShader` instead.

---

## File Naming

For vvvv to recognize your shader as a TextureFX node:

1. Place the file in a `shaders` folder next to your `.vl` document
2. Name the file: `YourName_TextureFX.sdsl`
3. Name the shader: `YourName_TextureFX`

```
MyProject/
├── MyProject.vl
└── shaders/
    └── Invert_TextureFX.sdsl
```

The node appears as `Invert` in the NodeBrowser under `Stride > Textures`.

---

## Three Base Classes

Pick based on what you're building:

### FilterBase: One texture in, one out

```hlsl
shader Invert_TextureFX : FilterBase
{
    float4 Filter(float4 tex0col)
    {
        tex0col.rgb = 1 - tex0col.rgb;
        return tex0col;
    }
};
```

The `tex0col` parameter contains the sampled input pixel. Return your modified color.

### MixerBase: Two textures in, blend them

```hlsl
shader Crossfade_TextureFX : MixerBase
{
    float4 Mix(float4 tex0col, float4 tex1col, float fader)
    {
        return lerp(tex0col, tex1col, fader);
    }
};
```

`fader` is automatically exposed as an input pin (0 to 1).

### TextureFX: Generate from scratch

```hlsl
[TextureSource]
shader Gradient_TextureFX : TextureFX
{
    [Color] float4 ColorA = float4(0, 0, 0, 1);
    [Color] float4 ColorB = float4(1, 1, 1, 1);

    stage override float4 Shading()
    {
        return lerp(ColorA, ColorB, streams.TexCoord.x);
    }
};
```

The `[TextureSource]` attribute marks this as a generator (no input texture required).

---

## Adding Parameters

Variables become input pins:

```hlsl
shader Threshold_TextureFX : FilterBase
{
    float Level = 0.5;    // Shows as "Level" pin, default 0.5

    float4 Filter(float4 tex0col)
    {
        float luma = dot(tex0col.rgb, float3(0.299, 0.587, 0.114));
        return luma > Level ? float4(1,1,1,1) : float4(0,0,0,1);
    }
};
```

### Attributes for pins

```hlsl
[Color]
float4 Tint = float4(1, 1, 1, 1);    // Shows as color picker

[Summary("Controls the blur radius")]
float Radius = 5.0;                   // Tooltip on hover

[Optional]
float SecretParam = 1.0;              // Hidden by default
```

---

## Accessing Coordinates

All TextureFX shaders have access to:

```hlsl
streams.TexCoord      // UV coordinates (0-1)
ViewSize              // Render target size in pixels
```

Example: pixelate effect

```hlsl
shader Pixelate_TextureFX : FilterBase
{
    float PixelSize = 8;

    float4 Filter(float4 tex0col)
    {
        float2 uv = streams.TexCoord;
        float2 pixelated = floor(uv * ViewSize / PixelSize) * PixelSize / ViewSize;
        return Texture0.Sample(Sampler, pixelated);
    }
};
```

---

## Sampling Textures

`Texture0` and `Sampler` come from `Texturing` (inherited via `TextureFX`):

```hlsl
// Sample at current UV
float4 color = Texture0.Sample(Sampler, streams.TexCoord);

// Sample at offset UV
float2 offset = float2(0.01, 0);
float4 shifted = Texture0.Sample(Sampler, streams.TexCoord + offset);

// Sample with specific LOD (mip level)
float4 blurry = Texture0.SampleLevel(Sampler, streams.TexCoord, 3);
```

---

## Adding Extra Texture Inputs

```hlsl
shader Mask_TextureFX : FilterBase
{
    Texture2D MaskTexture;

    float4 Filter(float4 tex0col)
    {
        float mask = MaskTexture.Sample(Sampler, streams.TexCoord).r;
        tex0col.a *= mask;
        return tex0col;
    }
};
```

---

## Using Time

Inherit from `Global` to access time:

```hlsl
shader Blink_TextureFX : FilterBase, Global
{
    float4 Filter(float4 tex0col)
    {
        float blink = frac(Time) > 0.5 ? 1 : 0;
        return tex0col * blink;
    }
};
```

`Time` is seconds since start. `TimeStep` is delta time.

---

## Using ShaderUtils

Inherit from `ShaderUtils` for math constants and helpers:

```hlsl
shader Circle_TextureFX : TextureFX, ShaderUtils
{
    stage override float4 Shading()
    {
        float2 uv = streams.TexCoord - 0.5;
        float dist = length(uv);
        float circle = smoothstep(0.25, 0.24, dist);
        return float4(circle, circle, circle, 1);
    }
};
```

`ShaderUtils` provides: `PI`, `TwoPI`, `mod()`, and many other utilities.

---

## Node Attributes

Control how your node appears:

```hlsl
[Category("Filter.Color")]
[Summary("Inverts RGB channels")]
[Tags("negative inverse")]
[OutputFormat("R16G16B16A16_Float")]
shader Invert_TextureFX : FilterBase
{
    // ...
};
```

| Attribute | Effect |
|-----------|--------|
| `[Category("...")]` | Subcategory in NodeBrowser |
| `[Summary("...")]` | Tooltip description |
| `[Tags("...")]` | Search keywords (space-separated) |
| `[OutputFormat("...")]` | Output texture format |

---

## What You Get From Base Classes

```
TextureFX
├── ImageEffectShader
├── SpriteBase
├── ShaderBase        → VSMain(), PSMain()
├── Texturing         → streams.TexCoord, Texture0, Sampler
└── ShaderUtils       → PI, math helpers

FilterBase : TextureFX
└── Filter() function with tex0col parameter

MixerBase : TextureFX
└── Mix() function with tex0col, tex1col, fader
```

You rarely need to add more inheritance for basic effects.
