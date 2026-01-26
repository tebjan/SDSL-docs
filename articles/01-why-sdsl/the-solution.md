# The Solution

> The same shader. 8 lines instead of 52.

---

## The SDSL Way

Remember the textured mesh shader? Here it is in SDSL:

```hlsl
shader TexturedMesh_DrawFX : VS_PS_Base, Texturing  // VS_PS_Base is vvvv-only
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

**12 lines.** And that includes the texture declaration.

---

## Where Did Everything Go?

| HLSL Boilerplate | SDSL Equivalent |
|------------------|-----------------|
| `struct VS_INPUT` | Inherited from `Texturing`, `PositionStream4`, etc. |
| `struct VS_OUTPUT` | The `streams` system handles it |
| `cbuffer PerFrame` | Inherited from `VS_PS_Base` (via `Transformation`) |
| `register(b0)`, `register(t0)` | Automatic |
| `: POSITION`, `: SV_TARGET` | Declared in base shaders |
| `return output;` | Assign to `streams.ColorTarget` |

You write what's **different**. You inherit what's **common**.

---

## Breaking It Down

```hlsl
shader TexturedMesh_DrawFX : VS_PS_Base, Texturing  // VS_PS_Base is vvvv-only
```

**`shader TexturedMesh_DrawFX`** — Your shader's name. The `_DrawFX` suffix tells vvvv to create a draw node.

**`: VS_PS_Base`** — vvvv-only base shader. Provides `VSMain()` and `PSMain()` to override, plus matrices and common streams.

**`, Texturing`** — Inherit texture coordinate support: `streams.TexCoord` and `Sampler`.

---

## The Streams System

Instead of defining input/output structs and manually passing data:

```hlsl
// Write to streams in vertex shader
streams.ShadingPosition = mul(streams.Position, WorldViewProjection);

// Read from streams in pixel shader
streams.ColorTarget = DiffuseTexture.Sample(Sampler, streams.TexCoord);
```

The SDSL compiler figures out what data needs to pass between stages. You just read and write to `streams`.

**Available because you inherited them:**
- `streams.Position` — from the mesh (via `VS_PS_Base`)
- `streams.TexCoord` — from `Texturing`
- `streams.ShadingPosition` — output position (via `VS_PS_Base`)
- `streams.ColorTarget` — pixel shader output (via `VS_PS_Base`)
- `WorldViewProjection` — from `Transformation`
- `Sampler` — from `Texturing`

---

## Multiple Inheritance

SDSL supports inheriting from multiple shaders at once:

```hlsl
shader MyShader : VS_PS_Base, Texturing, ColorStream, Global  // VS_PS_Base is vvvv-only
{
    // Now you have:
    // - Matrices (from VS_PS_Base)
    // - UVs + Sampler (Texturing) — Stride
    // - streams.Color (ColorStream) — Stride
    // - Time, TimeStep (Global) — Stride
};
```

Each inheritance adds capabilities. No copy-paste. No `#include` hell.

---

## Override, Don't Rewrite

The base shaders define default implementations. You override what you need:

```hlsl
shader Custom_DrawFX : VS_PS_Base, Texturing  // VS_PS_Base is vvvv-only
{
    // Override vertex shader
    override stage void VSMain()
    {
        // Your custom vertex logic
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    // Override pixel shader
    override stage void PSMain()
    {
        // Your custom pixel logic
        streams.ColorTarget = float4(1, 0, 0, 1);
    }
};
```

If you don't override something, you get the parent's implementation.

---

## Side-by-Side

| | HLSL | SDSL |
|---|---|---|
| **Lines of code** | 52 | 12 |
| **Structs to define** | 2 | 0 |
| **Registers to manage** | 3+ | 0 |
| **Semantics to remember** | 6+ | 0 |
| **Code shared between shaders** | Copy-paste | Inheritance |
| **Change matrix layout** | Edit every file | Edit base shader |

---

## The Key Insight

SDSL isn't a different language. It's HLSL **plus**:

1. **`shader` keyword** — Define a named, inheritable unit
2. **Multiple inheritance** — Combine capabilities from multiple parents
3. **`streams`** — Automatic data flow between stages
4. **`override`** — Replace parent methods cleanly

Everything else is standard HLSL. All the intrinsics work (`mul`, `dot`, `normalize`, `lerp`...). All the types work (`float4`, `Texture2D`, `StructuredBuffer`...).

You already know 90% of SDSL if you know HLSL.

→ Next: [The Payoff](the-payoff.md)
