# Shader Systems

> Real patterns from vvvv's official GPU particle and trail examples.

---

## The GPU Particle System

The official vvvv help patches demonstrate a complete multi-shader system:

```
┌─────────────────────────────────────────────────────────────────┐
│              ParticleStructPos4Vel4.sdsl (no suffix)            │
│                   struct ParticlePos4Vel4                       │
└─────────────────────────────────────────────────────────────────┘
                                │ inherits
        ┌───────────────────────┼───────────────────────────────┐
        │                       │                               │
        ▼                       ▼                               ▼
┌───────────────┐     ┌─────────────────┐            ┌──────────────────┐
│ Simulation    │     │ DrawParticles   │            │ ColorPerParticle │
│ _ComputeFX    │     │ _DrawFX         │            │ _ShaderFX        │
└───────────────┘     └─────────────────┘            └──────────────────┘
        │                       │                               │
        └───────────────────────┴───────────────────────────────┘
                                │
                    ┌───────────▼───────────┐
                    │  RWStructuredBuffer   │
                    │   <ParticlePos4Vel4>  │
                    └───────────────────────┘
```

---

## Step 1: Shared Particle Struct

**ParticleStructPos4Vel4.sdsl** — No suffix means no node, just a shared definition:

```hlsl
shader ParticleStructPos4Vel4
{   
    struct ParticlePos4Vel4
    {
        float4 Pos;
        float4 Vel;
    };
};
```

---

## Step 2: Simulation Shader

**Simulation_ComputeFX.sdsl** — Full official example:

```hlsl
shader Simulation_ComputeFX : ComputeShaderBase, Global, ParticleStructPos4Vel4
{   
    cbuffer PerFrame
    {   
        uint ParticlesCount;
        bool Reset;
        float3 TargetPos;
        float TargetStrength;
    };

    RWStructuredBuffer<ParticlePos4Vel4> ParticlesBuffer;
    StructuredBuffer<float4> RandomValues;

    override void Compute()
    {
        uint id = streams.DispatchThreadId.x;

        ParticlePos4Vel4 POut = ParticlesBuffer[id];
        float4 Rnd = RandomValues[id];

        // RESET
        if (Reset)
        {
            POut = (ParticlePos4Vel4) 0;
            POut.Pos.xyz = Rnd.xyz;
            POut.Vel = 0;
        }
         
        float3 Pos = POut.Pos.xyz;
        float3 Vel = POut.Vel.xyz;
        float VelLength = dot(Vel, Vel);

        // DRAG
        float drag = Rnd.w;
        if (VelLength > 0)
            Vel -= Vel * (1-drag);

        // FORCES
        float3 Force = 0;
        Force += ((TargetPos + Rnd.xyz) - Pos) * TargetStrength;
        Vel += Force;

        // INTEGRATION
        POut.Vel.xyz = Vel;
        Pos = Pos + Vel * TimeStep;
        POut.Pos.xyz = Pos;
    
        ParticlesBuffer[id] = POut;
    }
};
```

**Key patterns:**
- `cbuffer PerFrame` groups pin inputs
- `Global` provides `TimeStep`
- `RWStructuredBuffer` for read/write
- Cast to zero: `POut = (ParticlePos4Vel4) 0;`

---

## Step 3: Draw Shader with Geometry Stage

**DrawParticles_DrawFX.sdsl** — Expands points to billboarded quads:

```hlsl
shader DrawParticles_DrawFX : VS_PS_Base, ParticleStructPos4Vel4, ShaderUtils
{
    StructuredBuffer<ParticlePos4Vel4> ParticlesBuffer;

    cbuffer PerFrame
    {
        [Color]
        float4 Col;
        float ParticleSize;
    };

    stream float2 TexCoord;
    stream uint VertexID : SV_VertexID;

    stage override void VSMain() 
    {
        uint id = streams.VertexID;
        ParticlePos4Vel4 p = ParticlesBuffer[id];
        streams.PositionWS = float4(p.Pos.xyz, 1);
    }

    stream float Size;

    [maxvertexcount(4)]
    stage void GSMain(point Input input[1], inout TriangleStream<o> triangleStream)
    {
        streams = input[0];

        for(int i=0; i<4; i++)
        {
            streams.TexCoord = QuadUV[i].xy;
            
            float4 posView = mul(streams.PositionWS, WorldView);
            posView.xyz += QuadPositions[i].xyz * ParticleSize;
            streams.ShadingPosition = mul(posView, Projection);
            
            triangleStream.Append(streams);
        }
    }

    stage override void PSMain()
    {
        CircleSpriteDiscard(streams.TexCoord);       
        streams.ColorTarget = Col;
    }
};
```

**Key patterns:**
- `streams.VertexID` (not InstanceID) for point-per-particle
- `ShaderUtils` provides `QuadUV`, `QuadPositions`, `CircleSpriteDiscard`
- Geometry shader: `streams = input[0];` then modify and append
- Billboard in view space: transform to view, offset, then project

---

## Step 4: ShaderFX for Material Color

**ColorPerParticle_ShaderFX.sdsl** — Per-instance color for PBR materials:

```hlsl
shader ColorPerParticle_ShaderFX : ComputeFloat4, ParticleStructPos4Vel4, ShaderBaseStream
{
    rgroup PerMaterial
    {
        stage StructuredBuffer<ParticlePos4Vel4> ParticlesBuffer;
    }

    override float4 Compute()
    {
        uint id = streams.InstanceID;
        ParticlePos4Vel4 p = ParticlesBuffer[id];
        return float4(p.Vel.xyz, 1);
    }
};
```

**Key patterns:**
- `rgroup PerMaterial` for buffer binding in materials
- `stage` keyword for proper visibility
- `ShaderBaseStream` provides `streams.InstanceID`
- Connect to material's Diffuse or Emissive slot

---

## The Trail System

A more complex multi-shader system with animated trails:

### TrailHeadStruct.sdsl — Shared struct with padding

```hlsl
shader TrailHeadStruct
{
    struct TrailHead
    {
        float3 Pos;
        float3 OldPos;
        float3 Col;
        float Age;
        float pad0;  // fill up to 16 byte stride
        float pad1;
    };
};
```

**Note the padding** — GPU structs should align to 16-byte boundaries.

### HeadSimulation_ComputeFX.sdsl — Complex simulation

```hlsl
[Summary("Simulates the head movement of the trails")]
shader HeadSimulation_ComputeFX : ComputeShaderBase, ShaderUtils, TrailHeadStruct, Global, HappyNoise
{
    StructuredBuffer<float4> RandomValues;
    StructuredBuffer<float4> Colors;
    RWStructuredBuffer<TrailHead> Heads;

    float Speed = 0.01f;
    float Mass = 0.5f;
    int Quantization = 2;

    override void Compute()
    {
        uint index = streams.DispatchThreadId.x;
        
        TrailHead p = Heads[index];
        float4 rnd = RandomValues[index];
        float lifetime = abs(rnd.w) * 10 + 5;

        float dt = 0.04;
        p.Age += dt / lifetime;

        // Reset dead particles
        if (p.Age > 1)
        {
            p.Pos = rnd.xyz * 2;
            p.OldPos = p.Pos - rnd.xyz * 0.01;
            p.Age = 0;
            p.Col = ColorUtility.ToLinear(Colors[index % 3]);
        }

        // Noise-driven force
        float4 noise = simplexGrad(p.Pos.xyz * 0.8 + Time * 0.01);
        float3 acc = noise.yzw * 0.8;
        
        // Verlet integration
        float3 oldPos = p.OldPos;
        p.OldPos = p.Pos;
        float3 v = (p.Pos - oldPos) * Mass + acc * dt * dt;
        
        p.Pos += normalize(v) * Speed;

        Heads[index] = p;
    }
};
```

### TrailTransformations_ComputeFX.sdsl — Generate instance matrices

```hlsl
[Summary("Generates the instance transformations")]
shader TrailTransformations_ComputeFX : ComputeShaderBase, TrailHeadStruct, ShaderUtils, TransformUtils, Global
{
    struct Transform
    {
        float4x4 Matrix;
    };

    int TrailCount;
    int TrailIndex;
    StructuredBuffer<TrailHead> Heads;
    RWStructuredBuffer<Transform> InstanceWorld;
    RWStructuredBuffer<Transform> InstanceWorldInverse;

    override void Compute()
    {
        uint index = streams.DispatchThreadId.x;
        
        TrailHead p = Heads[index];
        index = index * TrailCount + TrailIndex;

        float size = float(TrailIndex) / float(TrailCount - 1);
        size = sin(size * Pi) * sin(p.Age * Pi);
        
        float4x4 world, worldInverse;
        TransformTSWithInverse(p.Pos, size * 0.025, world, worldInverse);

        InstanceWorld[index].Matrix = world;
        InstanceWorldInverse[index].Matrix = worldInverse;
    }
};
```

**Key patterns:**
- `TransformUtils` provides `TransformTSWithInverse` (translate + scale)
- Nested struct `Transform` wraps `float4x4` for StructuredBuffer
- `TrailIndex` iterates trail segments in the patch

### ColorFromTrailHead_ShaderFX.sdsl — Per-trail color

```hlsl
shader ColorFromTrailHead_ShaderFX : ComputeFloat4, ShaderBaseStream, TrailHeadStruct
{
    rgroup PerMaterial
    {
        stage StructuredBuffer<TrailHead> Heads;
    }

    cbuffer PerMaterial
    {
        stage int TrailCount;
    }

    override float4 Compute()
    {
        uint id = streams.InstanceID / TrailCount;
        return float4(Heads[id].Col, 1);
    }
};
```

**Key pattern:** `streams.InstanceID / TrailCount` maps instance to head.

---

## Sphere Impostor Pattern

**SphereImpostor_ShaderFX.sdsl** — Raymarched spheres via composition:

```hlsl
shader SphereImpostor_ShaderFX : Transformation, TransformationBase, PositionStream4, Texturing, 
                                  ShadingBase, NormalStream, ShaderUtils
{
    compose ParticleProvider Provider;  // Composition input!
    
    stage stream float PSize;

    [maxvertexcount(4)]
    stage void GSMain(point Input input[1], inout TriangleStream<o> triangleStream)
    {
        streams = input[0];

        // Get data from composed shader
        streams.PositionWS = Provider.GetWorldPosition();
        streams.PSize = Provider.GetParticleSize();

        float4 cameraSpherePos = mul(streams.PositionWS, WorldView);
        
        for (int i = 0; i < 4; i++) 
        {
            streams.TexCoord = QuadPositions[i].xy * 1.5;
            float4 viewCornerPos = cameraSpherePos;
            viewCornerPos.xy += sign(QuadPositions[i].xy) * streams.PSize * 1.5;
            streams.ShadingPosition = mul(viewCornerPos, Projection);
            triangleStream.Append(streams);
        }
    }

    stage override float4 Shading() 
    {
        float3 worldPos, worldNormal;
        sphereImpostor(streams.TexCoord, streams.PositionWS.xyz, streams.PSize, 
                       worldPos, worldNormal);
    
        streams.PositionWS = float4(worldPos, 1);
        streams.ShadingPosition = mul(streams.PositionWS, ViewProjection);
        streams.normalWS = worldNormal;

        return base.Shading();
    }
};
```

**Key pattern:** `compose ParticleProvider Provider;` — shader composition lets you plug in different data sources.

---

## cbuffer vs rgroup

| Block | Use For | When |
|-------|---------|------|
| `cbuffer PerFrame` | Values that change per-frame | Simulation params, time |
| `cbuffer PerMaterial` | Values per material instance | Colors, sizes |
| `rgroup PerMaterial` | Resources (buffers, textures) | StructuredBuffers in materials |

Always use `stage` keyword inside `rgroup`:
```hlsl
rgroup PerMaterial
{
    stage StructuredBuffer<MyStruct> MyBuffer;
}
```

---

## Summary of Official Patterns

| Pattern | Example | Key Detail |
|---------|---------|------------|
| Shared struct | `ParticleStructPos4Vel4.sdsl` | No suffix = no node |
| Simulation | `Simulation_ComputeFX.sdsl` | `cbuffer PerFrame`, `RWStructuredBuffer` |
| Draw + GS | `DrawParticles_DrawFX.sdsl` | `streams.VertexID`, `ShaderUtils` |
| Material color | `ColorPerParticle_ShaderFX.sdsl` | `rgroup PerMaterial`, `streams.InstanceID` |
| Transform gen | `TrailTransformations_ComputeFX.sdsl` | `TransformUtils`, nested `Transform` struct |
| Composition | `SphereImpostor_ShaderFX.sdsl` | `compose ParticleProvider` |

---

## File Organization (Official)

```
VL.Stride/help/
├── Rendering/shaders/
│   ├── ParticleStructPos4Vel4.sdsl     ← Shared struct
│   ├── Simulation_ComputeFX.sdsl       ← Physics
│   ├── DrawParticles_DrawFX.sdsl       ← Render with GS
│   ├── ColorPerParticle_ShaderFX.sdsl  ← Material integration
│   └── SphereImpostor_ShaderFX.sdsl    ← Advanced rendering
├── Models/shaders/
│   ├── TrailHeadStruct.sdsl            ← Trail shared struct
│   ├── HeadSimulation_ComputeFX.sdsl   ← Trail physics
│   ├── TrailTransformations_ComputeFX.sdsl
│   └── ColorFromTrailHead_ShaderFX.sdsl
└── Overview/shaders/
    ├── MyColor_DrawFX.sdsl             ← Simple examples
    ├── MyCompute_ComputeFX.sdsl
    └── MyNoise_TextureFX.sdsl
```
