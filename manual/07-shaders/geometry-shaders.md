# Geometry Shaders in DrawFX

> Add a geometry stage to expand, modify, or generate primitives. No separate suffix—add GSMain to any DrawFX.

---

## How It Works

Geometry shaders are part of DrawFX, not a separate type. Add `GSMain` alongside `VSMain` and `PSMain`:

```hlsl
shader MyShader_DrawFX : VS_PS_Base, Transformation
{
    override stage void VSMain() { /* ... */ }
    
    [maxvertexcount(4)]
    stage void GSMain(point Input input[1], inout TriangleStream<o> outputStream)
    {
        streams = input[0];
        // modify and emit
        outputStream.Append(streams);
    }
    
    override stage void PSMain() { /* ... */ }
};
```

**Key requirements:**
- `[maxvertexcount(n)]` attribute declares maximum output vertices
- `stage void GSMain` (note the `stage` keyword)
- `Input` / `Output` / `o` are auto-generated from your streams
- Always `streams = input[n]` then modify `streams`, then `Append(streams)`

---

## Real Example: Billboarded Particle Quads

From **DrawParticles_DrawFX.sdsl** (official vvvv help):

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

    // VS — fetch particle position
    stage override void VSMain() 
    {
        uint id = streams.VertexID;
        ParticlePos4Vel4 p = ParticlesBuffer[id];
        streams.PositionWS = float4(p.Pos.xyz, 1);
    }

    // GS — expand point to camera-facing quad
    stream float Size;

    [maxvertexcount(4)]
    stage void GSMain(point Input input[1], inout TriangleStream<o> triangleStream)
    {
        streams = input[0];

        for(int i = 0; i < 4; i++)
        {
            streams.TexCoord = QuadUV[i].xy;
            
            float4 posView = mul(streams.PositionWS, WorldView);
            posView.xyz += QuadPositions[i].xyz * ParticleSize;
            streams.ShadingPosition = mul(posView, Projection);
            
            triangleStream.Append(streams);
        }
    }

    // PS — circular sprite with discard
    stage override void PSMain()
    {
        CircleSpriteDiscard(streams.TexCoord);       
        streams.ColorTarget = Col;
    }
};
```

**Key patterns from official code:**

| Pattern | What It Does |
|---------|--------------|
| `streams.VertexID` | Get vertex index (not InstanceID for point-per-particle) |
| `ShaderUtils` | Provides `QuadUV`, `QuadPositions`, `CircleSpriteDiscard` |
| `streams.PositionWS` | World position passed VS → GS (not projected yet) |
| Billboard in view space | Transform to view, offset, then project |

---

## Real Example: Sphere Impostor with Composition

From **SphereImpostor_ShaderFX.sdsl** — uses shader composition to get particle data:

```hlsl
shader SphereImpostor_ShaderFX : Transformation, TransformationBase, PositionStream4, 
                                  Texturing, ShadingBase, NormalStream, ShaderUtils
{
    compose ParticleProvider Provider;  // Composition slot!
    
    stage stream float PSize;

    [maxvertexcount(4)]
    stage void GSMain(point Input input[1], inout TriangleStream<o> triangleStream)
    {
        streams = input[0];

        // Get data from composed shader (pluggable!)
        streams.PositionWS = Provider.GetWorldPosition();
        streams.PSize = Provider.GetParticleSize();

        float padding = 1.5;
        float4 cameraSpherePos = mul(streams.PositionWS, WorldView);
        
        for (int i = 0; i < 4; i++) 
        {
            streams.TexCoord = QuadPositions[i].xy * padding;
            float4 viewCornerPos = cameraSpherePos;
            viewCornerPos.xy += sign(QuadPositions[i].xy) * streams.PSize * padding;
            streams.ShadingPosition = mul(viewCornerPos, Projection);
            triangleStream.Append(streams);
        }
    }

    // Raymarched sphere in pixel shader
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

**Composition pattern:** `compose ParticleProvider Provider` creates a slot where different data sources can be plugged in at runtime.

---

## ShaderUtils Helpers

Inherit `ShaderUtils` for built-in billboard helpers:

| Name | Type | Value |
|------|------|-------|
| `QuadPositions` | `float3[4]` | Unit quad: `(-1,-1,0), (-1,1,0), (1,-1,0), (1,1,0)` |
| `QuadUV` | `float2[4]` | Matching UVs: `(0,1), (0,0), (1,1), (1,0)` |
| `CircleSpriteDiscard(uv)` | function | Discards pixels outside unit circle |

---

## Input Primitive Types

```hlsl
// Point input (most common for particles)
void GSMain(point Input input[1], ...)

// Line input
void GSMain(line Input input[2], ...)

// Triangle input
void GSMain(triangle Input input[3], ...)

// With adjacency info
void GSMain(lineadj Input input[4], ...)
void GSMain(triangleadj Input input[6], ...)
```

---

## Output Stream Types

```hlsl
inout PointStream<o> outputStream      // Output points
inout LineStream<o> outputStream       // Output line strips
inout TriangleStream<o> outputStream   // Output triangle strips
```

For separate primitives, use `RestartStrip()`:

```hlsl
triangleStream.Append(streams);
triangleStream.Append(streams);
triangleStream.Append(streams);
triangleStream.RestartStrip();  // End triangle, start new one
```

---

## Common Mistakes

### ❌ Using ShadingPosition from VS in GS

```hlsl
// VS projects to clip space
streams.ShadingPosition = mul(streams.Position, WorldViewProjection);

// GS tries to use it — WRONG, already in clip space!
float3 center = streams.ShadingPosition.xyz;
```

**✅ Fix:** Pass world position separately:

```hlsl
// VS
streams.PositionWS = float4(worldPos, 1);

// GS
float3 center = streams.PositionWS.xyz;
```

### ❌ Appending custom struct

```hlsl
Output o;
o.ShadingPosition = ...;
outputStream.Append(o);  // WRONG
```

**✅ Always append streams:**

```hlsl
streams.ShadingPosition = ...;
outputStream.Append(streams);  // CORRECT
```

### ❌ Missing stage keyword

```hlsl
[maxvertexcount(4)]
void GSMain(...)  // Missing 'stage'
```

**✅ Include stage:**

```hlsl
[maxvertexcount(4)]
stage void GSMain(...)
```

---

## Performance

Geometry shaders add overhead. Consider alternatives:

| Use Case | Best Approach |
|----------|---------------|
| Particle billboards (small count) | Geometry shader |
| Many instances of same mesh | GPU instancing |
| Procedural generation | Compute + DrawIndirect |
| Large particle counts | Compute writes to vertex buffer |

Keep `maxvertexcount` as small as possible—larger values reduce parallelism.

---

## Next Steps

- [Shader Systems](../08-system-design/shader-systems.md) — Complete particle system with GS
- [ShaderFX](shaderfx.md) — Composition for material integration
