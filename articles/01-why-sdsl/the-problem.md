# The Problem

> Every HLSL shader starts with the same 40 lines of boilerplate.

---

## A Simple Task

You want a shader that:
1. Takes a mesh
2. Applies a texture
3. Outputs to screen

That's it. Basic textured rendering.

---

## The HLSL Way

```hlsl
// Input structure - you write this every time
struct VS_INPUT
{
    float4 Position : POSITION;
    float2 TexCoord : TEXCOORD0;
    float3 Normal : NORMAL;
};

// Output structure - you write this every time
struct VS_OUTPUT
{
    float4 Position : SV_POSITION;
    float2 TexCoord : TEXCOORD0;
    float3 Normal : TEXCOORD1;
    float3 WorldPos : TEXCOORD2;
};

// Constant buffer - you write this every time
cbuffer PerFrame : register(b0)
{
    float4x4 World;
    float4x4 View;
    float4x4 Projection;
    float4x4 WorldViewProjection;
};

// Texture and sampler - you declare this every time
Texture2D DiffuseTexture : register(t0);
SamplerState LinearSampler : register(s0);

// Vertex shader
VS_OUTPUT VSMain(VS_INPUT input)
{
    VS_OUTPUT output;
    output.Position = mul(input.Position, WorldViewProjection);
    output.TexCoord = input.TexCoord;
    output.Normal = mul(input.Normal, (float3x3)World);
    output.WorldPos = mul(input.Position, World).xyz;
    return output;
}

// Pixel shader
float4 PSMain(VS_OUTPUT input) : SV_TARGET
{
    float4 texColor = DiffuseTexture.Sample(LinearSampler, input.TexCoord);
    return texColor;
}
```

**52 lines.** And most of it is ceremony:
- Input/output struct definitions
- Semantic annotations (POSITION, SV_POSITION, TEXCOORD0...)
- Register bindings (b0, t0, s0...)
- Constant buffer declarations
- Manual data passing between stages

The actual logic? Maybe 5 lines.

---

## The Copy-Paste Epidemic

What happens in practice:

1. You copy an existing shader
2. Modify the parts you need
3. Hope you didn't break anything
4. Repeat for the next shader

Every project accumulates:
- Slightly different input structs
- Inconsistent cbuffer layouts  
- Duplicated utility functions
- No shared code between shaders

When you need to change something fundamental (like adding a new matrix), you edit every single shader file.

---

## It Gets Worse

Want to add instancing? Rewrite the input struct. 
Want lighting? Copy-paste a lighting function into every shader.
Want to share code? `#include` with all its problems.

```hlsl
// Now your shader looks like this:
#include "Common.hlsli"
#include "Lighting.hlsli"
#include "Transforms.hlsli"
#include "Skinning.hlsli"  // maybe you need this, maybe not

struct VS_INPUT { /* different for each shader */ };
struct VS_OUTPUT { /* different for each shader */ };

// ... same boilerplate, slightly different each time
```

The `#include` system doesn't compose. It just pastes text. Name conflicts, order dependencies, no real modularity.

---

## The Real Cost

This isn't just annoying. It's expensive:

| Problem | Cost |
|---------|------|
| Copy-paste errors | Bugs that only appear in some shaders |
| Inconsistent structs | Integration headaches |
| No code reuse | Same math written 10 times |
| Fear of refactoring | "Don't touch it, it works" |
| Onboarding time | New dev reads 500 lines to understand 20 |

---

## What If...

What if you could:

- **Inherit** common code instead of copy-pasting it
- **Override** just the parts that differ
- **Compose** shaders from reusable pieces
- **Change once**, update everywhere

That's what SDSL does.

→ Next: [The Solution](the-solution.md)
