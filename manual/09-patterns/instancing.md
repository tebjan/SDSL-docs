# Instancing

> One draw call, many objects. Each with its own data.

---

## The Concept

GPU instancing draws the same mesh N times in a single draw call. Each instance gets a unique ID (`streams.InstanceID`) that you use to look up per-instance data from a buffer.

---

## Using InstanceWorldBuffer (Recommended)

The easiest way. Inherit from `InstanceWorldBuffer` to get world matrices per instance:

```hlsl
shader Instanced_DrawFX : VS_PS_Base, Texturing, InstanceWorldBuffer
{
    [Color]
    float4 Color = float4(1, 0, 0, 1);

    override stage void VSMain()
    {
        float4x4 w = InstanceWorld[streams.InstanceID].Matrix;
        w = mul(w, World);
        streams.ShadingPosition = mul(streams.Position, mul(w, ViewProjection));
    }

    override stage void PSMain()
    {
        streams.ColorTarget = Color;
    }
};
```

`InstanceWorldBuffer` provides `InstanceWorld`, a buffer of transform matrices.

---

## vvvv Setup

1. Create your mesh
2. Create a `DynamicBuffer` with your instance transforms
3. **Important:** Enable the hidden pin `IsStructuredBuffer` on DynamicBuffer
4. Connect to your DrawFX shader
5. Set instance count

The `IsStructuredBuffer = true` setting is critical. Without it, the buffer won't work correctly.

---

## Custom Per-Instance Data

For data beyond transforms, use your own `StructuredBuffer`:

```hlsl
shader CustomInstanced_DrawFX : VS_PS_Base
{
    StructuredBuffer<float4x4> Transforms;
    StructuredBuffer<float4> Colors;

    override stage void VSMain()
    {
        uint id = streams.InstanceID;
        float4x4 world = Transforms[id];
        streams.ShadingPosition = mul(streams.Position, mul(world, ViewProjection));
    }

    override stage void PSMain()
    {
        uint id = streams.InstanceID;
        streams.ColorTarget = Colors[id];
    }
};
```

`streams.InstanceID` comes from `ShaderBaseStream`.

---

## Custom Struct Example

Define a struct for complex per-instance data:

```hlsl
struct InstanceData
{
    float4x4 World;
    float4 Color;
    float Scale;
    float Time;
};

shader RichInstanced_DrawFX : VS_PS_Base
{
    StructuredBuffer<InstanceData> Instances;

    override stage void VSMain()
    {
        uint id = streams.InstanceID;
        InstanceData inst = Instances[id];
        
        float4 pos = streams.Position * inst.Scale;
        streams.ShadingPosition = mul(pos, mul(inst.World, ViewProjection));
    }

    override stage void PSMain()
    {
        uint id = streams.InstanceID;
        streams.ColorTarget = Instances[id].Color;
    }
};
```

---

## Compute-Driven Instancing

Update instance data with a compute shader:

```hlsl
struct Particle
{
    float3 Position;
    float3 Velocity;
    float4 Color;
};

// Compute shader updates particles
shader UpdateParticles_ComputeFX : ComputeShaderBase
{
    RWStructuredBuffer<Particle> Particles;
    int Count;
    float DeltaTime;
    float3 Gravity = float3(0, -9.8, 0);

    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;
        if (id >= Count) return;

        Particle p = Particles[id];
        p.Velocity += Gravity * DeltaTime;
        p.Position += p.Velocity * DeltaTime;
        Particles[id] = p;
    }
};

// Draw shader renders particles
shader DrawParticles_DrawFX : VS_PS_Base
{
    StructuredBuffer<Particle> Particles;

    override stage void VSMain()
    {
        uint id = streams.InstanceID;
        Particle p = Particles[id];
        
        float4 pos = streams.Position;
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

## Performance Tips

- **Batch similar objects:** Instancing shines when drawing many copies of the same mesh
- **Keep buffers updated:** Use compute shaders to update instance data on GPU
- **Frustum culling:** For large instance counts, cull on GPU before drawing
- **Buffer size:** Match instance count to buffer size to avoid out-of-bounds reads

---

## Common Issues

| Problem | Solution |
|---------|----------|
| All instances at origin | Check `IsStructuredBuffer = true` on DynamicBuffer |
| Only one instance visible | Verify instance count is set correctly |
| Wrong transforms | Make sure buffer element order matches InstanceID |
| Flickering | Ensure buffer is fully uploaded before draw |
