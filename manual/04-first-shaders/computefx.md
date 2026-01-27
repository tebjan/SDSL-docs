# ComputeFX

> General-purpose GPU computation. No rendering, just data.

---

## File Naming

For vvvv to recognize your shader as a ComputeFX node:

1. Place the file in a `shaders` folder next to your `.vl` document
2. Name the file: `YourName_ComputeFX.sdsl`
3. Name the shader: `YourName_ComputeFX`

```
MyProject/
├── MyProject.vl
└── shaders/
    └── AddOne_ComputeFX.sdsl
```

The node appears as `AddOne` in the NodeBrowser under `Stride > Compute`.

---

## Minimal Example

```hlsl
shader AddOne_ComputeFX : ComputeShaderBase
{
    RWStructuredBuffer<float> Data;

    override void Compute()
    {
        uint index = streams.DispatchThreadId.x;
        Data[index] = Data[index] + 1;
    }
};
```

- `ComputeShaderBase` provides the `Compute()` entry point
- `streams.DispatchThreadId` tells you which thread you are
- `RWStructuredBuffer` allows reading and writing

---

## Thread Groups

Compute shaders run in parallel. You define how many threads run together:

```hlsl
[numthreads(64, 1, 1)]
shader MyCompute_ComputeFX : ComputeShaderBase
{
    // 64 threads per group, 1D layout
};
```

When you dispatch 1000 elements with thread groups of 64:
- vvvv dispatches `ceil(1000/64) = 16` groups
- Each group runs 64 threads
- Total: 1024 threads (some will be out of bounds)

---

## Always Check Bounds

Since thread count rounds up, some threads have invalid indices:

```hlsl
shader Safe_ComputeFX : ComputeShaderBase
{
    RWStructuredBuffer<float> Data;
    int Count;    // Actual element count

    override void Compute()
    {
        uint index = streams.DispatchThreadId.x;
        if (index >= Count) return;    // Critical!

        Data[index] = Data[index] * 2;
    }
};
```

Without the bounds check, you write to invalid memory.

---

## Thread IDs

```hlsl
streams.DispatchThreadId      // Global thread ID (uint3)
streams.GroupId               // Which group this thread is in (uint3)
streams.GroupThreadId         // Thread ID within the group (uint3)
```

For 1D data, use `.x`. For 2D (images), use `.x` and `.y`. For 3D volumes, use all three.

---

## Buffer Types

| Type | Read | Write | Use case |
|------|------|-------|----------|
| `StructuredBuffer<T>` | Yes | No | Input data |
| `RWStructuredBuffer<T>` | Yes | Yes | Output or in-place |
| `ByteAddressBuffer` | Yes | No | Raw bytes |
| `RWByteAddressBuffer` | Yes | Yes | Raw byte writes |

```hlsl
StructuredBuffer<float3> Positions;       // Read-only positions
RWStructuredBuffer<float3> Velocities;    // Read-write velocities
```

---

## Custom Structs

Define structs for complex data:

```hlsl
struct Particle
{
    float3 Position;
    float3 Velocity;
    float Life;
};

shader UpdateParticles_ComputeFX : ComputeShaderBase
{
    RWStructuredBuffer<Particle> Particles;
    int Count;
    float DeltaTime;

    override void Compute()
    {
        uint i = streams.DispatchThreadId.x;
        if (i >= Count) return;

        Particle p = Particles[i];
        p.Position += p.Velocity * DeltaTime;
        p.Life -= DeltaTime;
        Particles[i] = p;
    }
};
```

---

## Reading and Writing Textures

```hlsl
shader ProcessImage_ComputeFX : ComputeShaderBase
{
    Texture2D<float4> Input;
    RWTexture2D<float4> Output;

    [numthreads(8, 8, 1)]
    override void Compute()
    {
        uint2 pos = streams.DispatchThreadId.xy;
        float4 color = Input[pos];
        Output[pos] = 1 - color;    // Invert
    }
};
```

For images, use 2D thread groups (8x8 or 16x16 are common).

---

## Shared Memory (Group Shared)

Threads in the same group can share data:

```hlsl
[numthreads(64, 1, 1)]
shader Reduce_ComputeFX : ComputeShaderBase
{
    StructuredBuffer<float> Input;
    RWStructuredBuffer<float> Output;

    groupshared float cache[64];    // Shared within group

    override void Compute()
    {
        uint tid = streams.GroupThreadId.x;
        uint gid = streams.GroupId.x;
        uint index = streams.DispatchThreadId.x;

        // Load into shared memory
        cache[tid] = Input[index];
        GroupMemoryBarrierWithGroupSync();

        // Reduce within group
        for (uint s = 32; s > 0; s >>= 1)
        {
            if (tid < s)
                cache[tid] += cache[tid + s];
            GroupMemoryBarrierWithGroupSync();
        }

        // First thread writes result
        if (tid == 0)
            Output[gid] = cache[0];
    }
};
```

`GroupMemoryBarrierWithGroupSync()` ensures all threads reach this point before continuing.

---

## Common Patterns

### Transform data
```hlsl
override void Compute()
{
    uint i = streams.DispatchThreadId.x;
    if (i >= Count) return;
    Output[i] = Input[i] * Scale + Offset;
}
```

### Particle simulation
```hlsl
override void Compute()
{
    uint i = streams.DispatchThreadId.x;
    if (i >= Count) return;

    float3 pos = Positions[i];
    float3 vel = Velocities[i];

    vel += Gravity * DeltaTime;
    pos += vel * DeltaTime;

    Positions[i] = pos;
    Velocities[i] = vel;
}
```

### Image processing (2D)
```hlsl
[numthreads(8, 8, 1)]
override void Compute()
{
    uint2 pos = streams.DispatchThreadId.xy;
    if (pos.x >= Width || pos.y >= Height) return;

    float4 color = Input[pos];
    Output[pos] = ProcessColor(color);
}
```

---

## Tips

- Start with `[numthreads(64, 1, 1)]` for 1D, `[numthreads(8, 8, 1)]` for 2D
- Always bounds-check with `if (index >= Count) return;`
- Use `StructuredBuffer` for input, `RWStructuredBuffer` for output
- Test with small data first, then scale up
