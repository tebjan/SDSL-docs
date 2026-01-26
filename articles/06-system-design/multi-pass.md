# Multi-Pass Compute

> Chain compute shaders. Each pass transforms the data.

---

## The Concept

A single compute shader runs once. Multi-pass runs several in sequence:

```
Buffer → [Pass 1] → Buffer → [Pass 2] → Buffer → [Pass 3] → Buffer
```

Each pass reads and writes to buffers. Passes can have different thread counts, different logic, different purposes.

---

## Example: Particle System

### Pass 1: Emit New Particles

```hlsl
shader Emit_ComputeFX : ComputeShaderBase, ParticleTypes
{
    RWStructuredBuffer<Particle> Particles;
    int EmitCount;
    int EmitOffset;
    float3 EmitPosition;
    
    [numthreads(64, 1, 1)]
    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;
        if (id >= EmitCount) return;
        
        uint index = EmitOffset + id;
        
        Particle p;
        p.Position = EmitPosition;
        p.Velocity = RandomDirection(id) * 2.0;
        p.Life = 3.0;
        p.Size = 0.05;
        p.Color = float4(1, 1, 1, 1);
        
        Particles[index] = p;
    }
};
```

**Thread count:** 64. Run with `ceil(EmitCount / 64)` groups.

---

### Pass 2: Simulate Physics

```hlsl
shader Simulate_ComputeFX : ComputeShaderBase, ParticleTypes
{
    RWStructuredBuffer<Particle> Particles;
    int Count;
    float DeltaTime;
    float3 Gravity;
    
    [numthreads(256, 1, 1)]
    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;
        if (id >= Count) return;
        
        Particle p = Particles[id];
        
        // Skip dead particles
        if (p.Life <= 0) return;
        
        // Physics
        p.Velocity += Gravity * DeltaTime;
        p.Position += p.Velocity * DeltaTime;
        p.Life -= DeltaTime;
        
        // Fade out
        p.Color.a = saturate(p.Life);
        
        Particles[id] = p;
    }
};
```

**Thread count:** 256. More particles = more threads.

---

### Pass 3: Draw (Vertex + Pixel)

```hlsl
shader Render_DrawFX : VS_PS_Base, ParticleTypes
{
    StructuredBuffer<Particle> Particles;  // Read-only for drawing
    
    override stage void VSMain()
    {
        uint id = streams.InstanceID;
        Particle p = Particles[id];
        
        // Billboard quad
        float4 pos = streams.Position * p.Size;
        pos.xyz += p.Position;
        
        streams.ShadingPosition = mul(pos, ViewProjection);
    }
    
    override stage void PSMain()
    {
        Particle p = Particles[streams.InstanceID];
        
        if (p.Life <= 0)
            discard;
            
        streams.ColorTarget = p.Color;
    }
};
```

**Not a compute shader.** This is a draw shader using instancing.

---

## The Shared Buffer

All passes operate on the **same buffer**:

```
┌────────────────────────────────────────────────────────────┐
│                  RWStructuredBuffer<Particle>              │
└────────────────────────────────────────────────────────────┘
        ↑               ↑               ↑               ↑
        │               │               │               │
   [Emit Pass]    [Sim Pass]     [Sort Pass]     [Draw Pass]
     writes         writes         writes          reads
```

In vvvv, you create **one buffer** and connect it to all shader nodes.

---

## Execution Order

Order matters. The CPU controls dispatch sequence:

```
1. Dispatch Emit_ComputeFX    (writes new particles)
2. Dispatch Simulate_ComputeFX (updates all particles)
3. Draw with Render_DrawFX    (reads particle positions)
```

If you draw before simulate, you see last frame's positions.

---

## Different Thread Counts

Each pass can optimize independently:

| Pass | Thread Count | Why |
|------|--------------|-----|
| Emit | [64,1,1] | Few particles spawned |
| Simulate | [256,1,1] | Many particles updated |
| Sort | [512,1,1] | Comparison-heavy |
| Draw | N/A | Driven by instance count |

---

## Double Buffering

For some algorithms, reading and writing the same buffer causes issues. Solution: two buffers.

```
Frame N:
  Read from Buffer A
  Write to Buffer B

Frame N+1:
  Read from Buffer B
  Write to Buffer A
```

Swap buffers each frame.

---

## Synchronization

GPU compute runs async. Between passes, you need barriers.

**In vvvv:** Connecting one compute output to another's input creates implicit sync.

**In Stride (C#):**
```csharp
commandList.Dispatch(...);  // Pass 1
// Implicit barrier
commandList.Dispatch(...);  // Pass 2
```

---

## Debugging Multi-Pass

Hard to debug because you can't see intermediate states easily.

**Strategy 1:** Skip passes

Run only Pass 1, visualize output. Then add Pass 2, etc.

**Strategy 2:** ReadBack buffer

Read buffer back to CPU, inspect values. (One frame delay.)

**Strategy 3:** RenderDoc

Capture frame, inspect buffer contents between passes.

---

## Real-World Example: Sort + Draw

Transparent particles need back-to-front ordering.

```
Pass 1: Simulate (update positions)
Pass 2: Calculate depth (distance to camera)
Pass 3: Bitonic sort (reorder by depth)
Pass 4: Draw (front-to-back for transparency)
```

Four passes, four shaders, one buffer.

---

## Quick Reference

| Aspect | Single Shader | Multi-Pass |
|--------|---------------|------------|
| Complexity | Simple | Higher |
| Flexibility | One size | Each pass tuned |
| Thread counts | One | Different per pass |
| Buffer | Internal | Explicit, shared |
| Debugging | Easy | Harder |
| Use when | Simple effects | Pipelines, simulation |
