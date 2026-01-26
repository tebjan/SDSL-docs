# Composition

> Define a slot. Plug in any shader that fits.

---

## The Problem

You have a particle shader. Sometimes particles should be colored by a texture. Sometimes by a gradient. Sometimes by noise. 

In HLSL, you either:
- Write three separate shaders (duplication)
- Use #ifdef everywhere (messy)
- Pass function pointers (not possible in shaders)

## The Solution

In SDSL, declare a **composition slot**. Any shader that matches the signature can plug in:

```hlsl
shader ParticleShader : ComputeShaderBase
{
    compose ComputeColor colorSource;    // Slot: expects something that computes color

    override void Compute()
    {
        float4 color = colorSource.Compute();   // Call whatever is plugged in
        // ... use color ...
    }
};
```

Now you can plug in:
- `ComputeColorTexture` (samples a texture)
- `ComputeColorGradient` (interpolates a gradient)  
- `ComputeColorNoise` (generates noise)
- Any custom shader that has a `Compute()` returning `float4`

The parent shader doesn't know or care which one. It just calls `Compute()`.

---

## How It Works

```
┌─────────────────────────────────────────┐
│  ParticleShader                         │
│                                         │
│    compose ComputeColor colorSource; ───┼──▶ ?
│                                         │
│    color = colorSource.Compute();       │
└─────────────────────────────────────────┘

At compile time, plug in the actual implementation:

┌─────────────────────────────────────────┐
│  ParticleShader                         │
│                                         │
│    compose ComputeColor colorSource; ───┼──▶ ComputeColorTexture
│                                         │       └─▶ samples Texture0
│    color = colorSource.Compute();       │
└─────────────────────────────────────────┘
```

The compiler inlines the composed shader. No runtime overhead.

---

## Syntax

**Declare a slot:**
```hlsl
compose ShaderType slotName;
```

**Call the composed shader:**
```hlsl
slotName.MethodName();
```

**In vvvv:** The composition appears as a `GPU<ShaderType>` input pin. Connect any matching shader node.

**In Stride C#:** Set via effect parameters or material system.

---

## Composition Arrays

Need multiple compositions of the same type? Use an array and `foreach`:

```hlsl
shader MultiLightShader
{
    compose ComputeColor lights[];    // Array of light sources

    float4 ComputeLighting()
    {
        float4 total = float4(0, 0, 0, 0);
        foreach (var light in lights)
        {
            total += light.Compute();
        }
        return total;
    }
};
```

Each element in the array can be a different shader.

---

## Real Example: Material System

Stride's material system uses composition heavily:

```hlsl
shader MaterialBase
{
    compose ComputeColor diffuseMap;
    compose ComputeColor normalMap;
    compose ComputeColor specularMap;
    compose ComputeColor emissiveMap;

    override void PSMain()
    {
        float4 diffuse = diffuseMap.Compute();
        float3 normal = normalMap.Compute().xyz;
        // ... combine everything ...
    }
};
```

In the editor, you plug different sources into each slot:
- diffuseMap → texture
- normalMap → texture  
- specularMap → constant value
- emissiveMap → animated gradient

Same shader, infinite combinations.

---

## Composition vs Inheritance

| | Inheritance | Composition |
|--|-------------|-------------|
| When to use | You need the parent's variables/methods | You need pluggable behavior |
| Relationship | "is a" | "has a" |
| Flexibility | Fixed at shader definition | Configurable per instance |
| Syntax | `: ParentShader` | `compose Type name;` |

Use inheritance for structure. Use composition for variation.

---

## The `clone` Keyword

By default, if the same shader appears multiple times in compositions, they share state. Use `clone` to force separate instances:

```hlsl
shader MyShader
{
    clone compose ComputeColor colorA;   // Separate instance
    clone compose ComputeColor colorB;   // Separate instance
};
```

Without `clone`, both would share the same underlying shader state.

---

## Summary

| Concept | Syntax |
|---------|--------|
| Declare slot | `compose ShaderType name;` |
| Call composed shader | `name.Method()` |
| Array of compositions | `compose ShaderType name[];` |
| Iterate array | `foreach (var x in name) { }` |
| Force separate instances | `clone compose ShaderType name;` |
