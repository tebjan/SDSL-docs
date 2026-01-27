# The Payoff

> Single shaders are nice. Multi-shader systems are where SDSL shines.

---

## Beyond Single Shaders

Reducing 52 lines to 12 is good. But the real payoff comes when you build **systems** — multiple shaders working together.

Consider a particle system:
1. **Emit shader** — spawn new particles
2. **Simulate shader** — apply physics
3. **Sort shader** — order by depth for transparency
4. **Draw shader** — render as billboards

Four shaders. All need to agree on what a "particle" is.

---

## The Traditional Nightmare

In plain HLSL, you'd define the particle struct **four times**:

```hlsl
// In Emit.hlsl
struct Particle { float3 pos; float3 vel; float life; float size; };

// In Simulate.hlsl  
struct Particle { float3 pos; float3 vel; float life; float size; };

// In Sort.hlsl
struct Particle { float3 pos; float3 vel; float life; float size; };

// In Draw.hlsl
struct Particle { float3 pos; float3 vel; float life; float size; };
```

Now add a `color` field. Edit four files. Miss one? Silent data corruption.

---

## The SDSL Way

Define once. Inherit everywhere.

**ParticleTypes.sdsl** (no suffix = not a node, just a definition)
```hlsl
shader ParticleTypes
{
    struct Particle
    {
        float3 Position;
        float3 Velocity;
        float Life;
        float Size;
        float4 Color;
    };
};
```

**Emit_ComputeFX.sdsl**
```hlsl
shader Emit_ComputeFX : ComputeShaderBase, ParticleTypes
{
    RWStructuredBuffer<Particle> Particles;
    
    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;
        Particle p;
        p.Position = float3(0, 0, 0);
        p.Velocity = float3(0, 1, 0);
        p.Life = 5.0;
        p.Size = 0.1;
        p.Color = float4(1, 1, 1, 1);
        Particles[id] = p;
    }
};
```

**Simulate_ComputeFX.sdsl**
```hlsl
shader Simulate_ComputeFX : ComputeShaderBase, ParticleTypes
{
    RWStructuredBuffer<Particle> Particles;
    int Count;
    float DeltaTime;
    
    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;
        if (id >= Count) return;
        
        Particle p = Particles[id];
        p.Velocity.y -= 9.8 * DeltaTime;  // gravity
        p.Position += p.Velocity * DeltaTime;
        p.Life -= DeltaTime;
        Particles[id] = p;
    }
};
```

**Draw_DrawFX.sdsl**
```hlsl
shader Draw_DrawFX : VS_PS_Base, Transformation, ParticleTypes
{
    StructuredBuffer<Particle> Particles;
    
    override stage void VSMain()
    {
        uint id = streams.InstanceID;
        Particle p = Particles[id];
        
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

---

## Change Once, Update Everywhere

Add a field to `Particle`:

```hlsl
struct Particle
{
    float3 Position;
    float3 Velocity;
    float Life;
    float Size;
    float4 Color;
    float Rotation;    // ← Add this
};
```

**One file changed. All four shaders now have `Rotation` available.**

The compiler enforces consistency. If `Emit_ComputeFX` writes a struct that `Draw_DrawFX` can't read, you get a compile error — not silent corruption.

---

## The Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ParticleTypes.sdsl                       │
│                     (struct definition only)                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ inherits
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
        ▼                       ▼                       ▼
┌───────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Emit_ComputeFX│     │Simulate_ComputeFX│     │  Draw_DrawFX    │
│   [64,1,1]    │────▶│    [256,1,1]    │────▶│  (instanced)    │
└───────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        └───────────────────────┴───────────────────────┘
                                │
                        ┌───────▼───────┐
                        │ Same Buffer   │
                        │ RWStructured  │
                        └───────────────┘
```

- **Shared type** at the top
- **Specialized shaders** inherit it
- **Same buffer** flows through the pipeline
- **Different thread counts** per stage (emit needs few, simulate needs many)

---

## Static Calls: Use Without Inheriting

Sometimes you want a utility function without full inheritance. Use static calls:

**MathUtils.sdsl**
```hlsl
shader MathUtils
{
    static float3 RandomInSphere(float seed)
    {
        float theta = seed * 6.28318;
        float phi = frac(seed * 123.456) * 3.14159;
        return float3(sin(phi) * cos(theta), cos(phi), sin(phi) * sin(theta));
    }
    
    static float Remap(float value, float inMin, float inMax, float outMin, float outMax)
    {
        return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
    }
};
```

**Use it anywhere without inheriting:**
```hlsl
shader MyShader_ComputeFX : ComputeShaderBase
{
    override void Compute()
    {
        float3 dir = MathUtils.RandomInSphere(streams.DispatchThreadId.x);
        float t = MathUtils.Remap(dir.y, -1, 1, 0, 1);
    }
};
```

---

## ShaderFX: Composable Material Pieces

For materials, SDSL goes further with **composition**:

```hlsl
shader MyDisplacement_ShaderFX : ComputeColor, Texturing, Global
{
    float Amplitude = 0.1;
    
    override float4 Compute()
    {
        float wave = sin(streams.TexCoord.x * 10 + Time);
        return float4(wave * Amplitude, 0, 0, 1);
    }
};
```

This outputs a `GPU<Vector4>` in vvvv. Connect it to a material's displacement slot. Swap implementations without changing the material.

```
┌─────────────────┐     ┌─────────────────┐
│ Noise_ShaderFX  │────▶│                 │
└─────────────────┘     │                 │
                        │ Material        │───▶ Rendered Object
┌─────────────────┐     │                 │
│ Wave_ShaderFX   │────▶│                 │
└─────────────────┘     └─────────────────┘
```

---

## The Full Picture

| Scale | Pattern | Benefit |
|-------|---------|---------|
| Single shader | Inherit base shaders | No boilerplate |
| Shared utilities | Static calls | Math library without inheritance |
| Multi-shader system | Shared type definitions | One source of truth |
| Material system | ShaderFX composition | Pluggable, swappable pieces |

SDSL scales from quick one-off effects to complex, maintainable systems.

---

## Worth the Investment?

Learning SDSL takes a few hours. The return:

- **Faster iteration** — less code to write and maintain
- **Fewer bugs** — compiler catches type mismatches
- **Better architecture** — inheritance forces you to think modularly
- **Reusable code** — build a library over time

If you write more than a handful of shaders, it pays off quickly.

→ Next: [The Two Tracks](two-tracks.md)
