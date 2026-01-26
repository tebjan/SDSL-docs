# Struct Sharing

> Define once, use in compute and draw shaders.

---

## The Problem

You have a compute shader that updates particles and a draw shader that renders them. Both need the same struct definition. If you define it in both files, they can get out of sync when you change one.

---

## The Solution

Put the struct in its own shader file without a suffix. Then inherit from it in both shaders.

**Step 1:** Create the struct file (no `_DrawFX`, `_ComputeFX`, etc. suffix)

```hlsl
// Particle.sdsl
shader Particle
{
    struct ParticleData
    {
        float3 Position;
        float3 Velocity;
        float Size;
        float Life;
        float4 Color;
    };
};
```

No suffix means it won't become a node. It's just a shared definition.

**Step 2:** Inherit in your compute shader

```hlsl
// UpdateParticles_ComputeFX.sdsl
shader UpdateParticles_ComputeFX : ComputeShaderBase, Particle
{
    RWStructuredBuffer<ParticleData> Particles;
    int Count;
    float DeltaTime;

    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;
        if (id >= Count) return;

        ParticleData p = Particles[id];
        p.Position += p.Velocity * DeltaTime;
        p.Life -= DeltaTime;
        Particles[id] = p;
    }
};
```

**Step 3:** Inherit in your draw shader

```hlsl
// DrawParticles_DrawFX.sdsl
shader DrawParticles_DrawFX : VS_PS_Base, Particle
{
    StructuredBuffer<ParticleData> Particles;

    override stage void VSMain()
    {
        uint id = streams.InstanceID;
        ParticleData p = Particles[id];
        
        float4 pos = streams.Position * p.Size;
        pos.xyz += p.Position;
        streams.ShadingPosition = mul(pos, ViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = Particles[streams.InstanceID].Color;
    }
};
```

Now both shaders use the same `ParticleData` struct. Change it once, both update.

---

## File Organization

```
shaders/
├── Particle.sdsl              ← Shared struct (no suffix)
├── UpdateParticles_ComputeFX.sdsl
└── DrawParticles_DrawFX.sdsl
```

---

## Multiple Shared Definitions

You can put multiple structs in one file:

```hlsl
// Types.sdsl
shader Types
{
    struct Vertex
    {
        float3 Position;
        float3 Normal;
        float2 UV;
    };

    struct Instance
    {
        float4x4 World;
        float4 Color;
    };

    struct Light
    {
        float3 Position;
        float3 Color;
        float Intensity;
    };
};
```

Then inherit from `Types` wherever you need them.

---

## Sharing with C#

For buffers that you fill from C#, the struct layout must match exactly.

**SDSL:**
```hlsl
struct ParticleData
{
    float3 Position;   // 12 bytes
    float Size;        // 4 bytes
    float4 Color;      // 16 bytes
};                     // Total: 32 bytes
```

**C#:**
```csharp
[StructLayout(LayoutKind.Sequential)]
struct ParticleData
{
    public Vector3 Position;  // 12 bytes
    public float Size;        // 4 bytes
    public Vector4 Color;     // 16 bytes
}                             // Total: 32 bytes
```

Rules:
- Use `LayoutKind.Sequential` in C#
- Match field order exactly
- Watch padding: `float3` is 12 bytes, not 16
- When in doubt, add explicit padding

---

## Padding Gotcha

HLSL/SDSL packs data differently than C#. A `float3` followed by a `float` works fine, but `float3` followed by `float3` may have padding issues.

**Safe pattern:**
```hlsl
struct Safe
{
    float3 Position;
    float Padding1;      // Explicit padding
    float3 Velocity;
    float Padding2;
};
```

**Or use float4:**
```hlsl
struct AlsoSafe
{
    float4 PositionAndSize;   // xyz = position, w = size
    float4 VelocityAndLife;   // xyz = velocity, w = life
};
```

---

## Static Functions

You can also share utility functions:

```hlsl
// Utils.sdsl
shader Utils
{
    static float3 RandomDirection(float seed)
    {
        float theta = seed * 6.28318;
        float phi = frac(seed * 123.456) * 3.14159;
        return float3(
            sin(phi) * cos(theta),
            cos(phi),
            sin(phi) * sin(theta)
        );
    }
};
```

Use with static call syntax:

```hlsl
shader MyShader_ComputeFX : ComputeShaderBase
{
    override void Compute()
    {
        float3 dir = Utils.RandomDirection(streams.DispatchThreadId.x);
    }
};
```

No inheritance needed for static calls.
