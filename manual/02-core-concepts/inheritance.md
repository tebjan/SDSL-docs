# Inheritance

> Inherit from multiple shaders at once to get their variables, methods, and streams.

---

## The Problem

You need a transformation matrix. You need texture coordinates. You need normal vectors. In HLSL, you copy-paste the declarations into every shader. Change something? Update every file.

## The Solution

In SDSL, you inherit what you need:

```hlsl
shader MyShader : ShaderBase, Transformation, PositionStream4, Texturing
{
    // WorldViewProjection is now available (from Transformation)
    // streams.Position is now available (from PositionStream4)
    // streams.TexCoord is now available (from Texturing)
}
```

One line. Three capabilities. No copy-paste.

---

## The Hierarchy

Shaders form a hierarchy. Higher-level shaders already inherit from lower-level ones, so you don't need to add everything manually.

```
ShaderBaseStream          ← Root: ShadingPosition, ColorTarget, InstanceID
    │
    └── ShaderBase        ← Adds VSMain(), PSMain()
            │
            ├── Texturing         ← streams.TexCoord, Texture0, Sampler
            ├── Transformation    ← World, View, Projection matrices
            ├── PositionStream4   ← streams.Position
            ├── NormalStream      ← streams.Normal
            │
            └── SpriteBase        ← Full-screen quad rendering
                    │
                    └── TextureFX ← Texture processing (vvvv)
                            │
                            ├── FilterBase  ← Filter() function
                            └── MixerBase   ← Mix() function
```

**Key insight:** You rarely need to inherit from `ShaderBaseStream` directly. If you inherit from `ShaderBase`, you already have `ShadingPosition`, `ColorTarget`, and `InstanceID`.

---

## Stride vs vvvv Shaders

Some base shaders come from Stride, others are vvvv-specific.

**Stride shaders** (visible in Shader Explorer by default):
- `ShaderBase`, `ShaderBaseStream`
- `Texturing`, `Transformation`, `PositionStream4`, `NormalStream`
- `ComputeShaderBase`, `SpriteBase`, `ImageEffectShader`

**vvvv shaders** (in VL.Stride):
- `VS_PS_Base` - convenient base for DrawFX (already includes common streams)
- `TextureFX`, `FilterBase`, `MixerBase` - for texture effects
- `ShaderUtils` - math constants (PI) and utility functions

These are not visible in Shader Explorer by default. To add them:

1. Open Shader Explorer
2. Click the folder icon to add a shader directory
3. Navigate to: `C:\Program Files\vvvv\vvvv_gamma_...\lib\packs\VL.Stride.Runtime...\stride\Assets\Effects`

Now you can browse and search vvvv shaders alongside Stride shaders.

---

## How It Works

SDSL uses a system called "mixins". When you inherit from multiple shaders, the compiler merges them into one:

```
Your Shader
    ├── inherits Transformation    → gets WorldViewProjection, World, View, etc.
    ├── inherits PositionStream4   → gets streams.Position
    └── inherits Texturing         → gets streams.TexCoord, Sampler
```

The order matters. If two parent shaders define the same method, the last one wins.

---

## Overriding Methods

When a parent shader has a method you want to replace, use `override`:

```hlsl
shader MyShader : VS_PS_Base
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = float4(1, 0, 0, 1);
    }
};
```

Without `override`, the compiler will error: "method already defined".

---

## Calling the Parent

Use `base.MethodName()` to call the parent's implementation:

```hlsl
shader ExtendedShader : SomeBaseShader
{
    override void Compute()
    {
        base.Compute();           // Run parent's code first
        streams.Color *= 2.0;     // Then modify the result
    }
};
```

This lets you extend behavior instead of replacing it entirely.

---

## The `stage` Keyword

When you inherit from multiple shaders that share a common parent, you might get duplicates. The `stage` keyword ensures only one instance exists:

```hlsl
shader BaseShader
{
    stage float4 sharedValue;           // Only one, even with diamond inheritance
    stage float4 ComputeShared() { }    // Only one method instance
}
```

Use `stage` for:
- Expensive calculations you don't want repeated
- Variables that must be shared across the inheritance tree
- Methods that should only run once

---

## Finding What to Inherit

How do you know what shaders exist and what they provide?

**Use Shader Explorer.** Search for what you need, see which shader has it, inherit that shader. See the [Shader Explorer](../03-discovery/shader-explorer.md) section.

### Starting Points by Use Case

Pick the right starting point based on what you're building:

| Building | Start with | You get |
|----------|------------|---------|
| DrawFX (geometry) | `VS_PS_Base` | VSMain, PSMain, basic streams |
| TextureFX filter | `FilterBase` | Filter() function, Texture0, UVs |
| TextureFX mixer | `MixerBase` | Mix() function, two texture inputs |
| TextureFX source | `TextureFX` | Full-screen quad, output texture |
| Compute shader | `ComputeShaderBase` | Compute() entry point |

### Adding Capabilities

Once you have a starting point, add what you need:

| You need | Inherit | Notes |
|----------|---------|-------|
| World/View/Projection matrices | `Transformation` | |
| Vertex position | `PositionStream4` | Often already included |
| Texture coordinates | `Texturing` | Often already included |
| Normal vectors | `NormalStream` | |
| Tangent vectors | `TangentStream` | |
| Vertex colors | `ColorStream` | |
| Math utilities (PI, etc.) | `ShaderUtils` | vvvv only |
| Time | `Global` | Access via `Time`, `TimeStep` |

### What You Usually Don't Need

These are already inherited by higher-level shaders:

| Shader | Why you don't inherit it directly |
|--------|-----------------------------------|
| `ShaderBaseStream` | Inherited by `ShaderBase` |
| `ShaderBase` | Inherited by `VS_PS_Base`, `TextureFX`, etc. |
| `SpriteBase` | Inherited by `TextureFX` |
| `ImageEffectShader` | Inherited by `TextureFX` |

---

## Example: DrawFX

For a DrawFX shader that renders geometry with a texture:

```hlsl
shader MyShader_DrawFX : VS_PS_Base, Texturing
{
    Texture2D MyTexture;

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = MyTexture.Sample(Sampler, streams.TexCoord);
    }
};
```

`VS_PS_Base` gives you shader structure and matrices. `Texturing` gives you UVs and a sampler.

## Example: TextureFX

For a simple image filter, you don't need to add much:

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

`FilterBase` already includes `TextureFX`, which includes `Texturing`, `ShaderBase`, and more. Everything you need is already there.

---

## Summary

| Concept | Syntax |
|---------|--------|
| Inherit one shader | `shader A : B { }` |
| Inherit multiple | `shader A : B, C, D { }` |
| Replace parent method | `override void Method() { }` |
| Call parent method | `base.Method()` |
| Ensure single instance | `stage` keyword |
