# Shaders in Stride

> Writing shaders in Stride Game Studio. You can extend and replace any part of the material system.

In Stride, you write `.sdsl` files and use them through the effect system. The material system is built entirely on SDSL composition — you can extend, override, or replace any shader in the pipeline.

---

## Draw Shader

A basic shader that renders geometry:

```hlsl
shader FlatColor : ShaderBase, Transformation, PositionStream4
{
    [Color]
    float4 Color = float4(1, 1, 1, 1);

    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = Color;
    }
};
```

**What you inherit:**

- `ShaderBase` - Entry points (`VSMain`, `PSMain`)
- `Transformation` - Matrix uniforms (`World`, `View`, `Projection`, `WorldViewProjection`)
- `PositionStream4` - `streams.Position` input

---

## Textured Shader

```hlsl
shader TexturedMesh : ShaderBase, Transformation, PositionStream4, Texturing
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

`Texturing` provides:

- `streams.TexCoord` - UV coordinates
- `Sampler` - Default sampler state
- `Texture0` through `Texture9` - Texture slots

---

## Compute Shader

The SDSL shader:

```hlsl
shader DataProcessor : ComputeShaderBase
{
    RWStructuredBuffer<float> Data;
    int Count;

    override void Compute()
    {
        uint i = streams.DispatchThreadId.x;
        if (i >= Count) return;

        Data[i] = Data[i] * 2;
    }
};
```

Effect file (`.sdfx`):

```csharp
effect DataProcessorEffect
{
    mixin DataProcessor;
};
```

### Dispatching from C#

```csharp
// In your script or game system
public class MyComputeProcessor : SyncScript
{
    private ComputeEffectShader computeEffect;
    private Buffer<float> dataBuffer;

    public override void Start()
    {
        // Create the compute effect
        var context = RenderContext.GetShared(Services);
        computeEffect = new ComputeEffectShader(context)
        {
            ShaderSourceName = "DataProcessor",
            ThreadGroupCounts = new Int3(64, 1, 1)  // Dispatch size
        };

        // Create GPU buffer
        dataBuffer = Buffer.New<float>(GraphicsDevice, 1024,
            BufferFlags.UnorderedAccess | BufferFlags.ShaderResource);
    }

    public override void Update()
    {
        // Set parameters
        computeEffect.Parameters.Set(DataProcessorKeys.Data, dataBuffer);
        computeEffect.Parameters.Set(DataProcessorKeys.Count, 1024);

        // Dispatch
        var renderContext = RenderContext.GetShared(Services);
        var drawContext = new RenderDrawContext(Services, renderContext, Game.GraphicsContext);
        computeEffect.Draw(drawContext);
    }
}
```

The `*Keys` class is auto-generated from your shader parameters.

---

## Material Shader (ComputeColor)

For material property slots:

```hlsl
shader PulsingColor : ComputeColor, Global
{
    [Color]
    float4 BaseColor = float4(1, 0, 0, 1);

    override float4 Compute()
    {
        float pulse = sin(Time * 3.14) * 0.5 + 0.5;
        return BaseColor * pulse;
    }
};
```

This can be assigned to material slots (Diffuse, Emissive, etc.) in Stride Game Studio.

---

## Extending the Material System

Stride's material system is entirely composition-based. Every material property (diffuse, normal, specular, emissive) is a `ComputeColor` slot that you can fill with any shader that inherits from `ComputeColor`.

**You can change anything:**

- Replace how diffuse color is computed
- Add custom lighting models
- Modify normal mapping behavior
- Inject per-instance data into materials
- Create procedural textures
- Build shader graphs

**Example: Per-instance color from a buffer**

```hlsl
shader InstanceColor : ComputeColor, ShaderBaseStream
{
    StructuredBuffer<float4> Colors;

    override float4 Compute()
    {
        return Colors[streams.InstanceID];
    }
};
```

Assign this to a material's diffuse slot, and each instance gets a unique color from the buffer.

**Example: Animated emissive**

```hlsl
shader PulseEmissive : ComputeColor, Global
{
    [Color]
    float4 EmissiveColor = float4(1, 0.5, 0, 1);
    float Speed = 2.0;

    override float4 Compute()
    {
        float pulse = sin(Time * Speed) * 0.5 + 0.5;
        return EmissiveColor * pulse;
    }
};
```

The material editor shows your shader's parameters. No C# code required for simple cases.

### Using Materials from C#

```csharp
// Set material parameters at runtime
myMaterial.Passes[0].Parameters.Set(PulseEmissiveKeys.EmissiveColor, new Color4(1, 0.5f, 0, 1));
myMaterial.Passes[0].Parameters.Set(PulseEmissiveKeys.Speed, 3.0f);
```

### Creating Materials in Code

```csharp
// Create a material with your custom shader
var materialDescriptor = new MaterialDescriptor
{
    Attributes =
    {
        Diffuse = new MaterialDiffuseMapFeature(new ComputeColor(Color.White)),
        Emissive = new MaterialEmissiveMapFeature(new ComputeShaderClassColor
        {
            MixinReference = "PulseEmissive"
        })
    }
};

var material = Material.New(GraphicsDevice, materialDescriptor);
```

---

## Material Integration Patterns

### Pattern 1: Simple property shader

Inherit from `ComputeColor`, implement `Compute()`, assign to material slot.

### Pattern 2: Access instance data

Add `ShaderBaseStream` to access `streams.InstanceID`, then read from buffers.

### Pattern 3: Custom lighting

Inherit from material surface shaders to modify lighting calculations.

### Pattern 4: Full custom material

Create effect files (`.sdfx`) that compose multiple shaders with conditional logic.

The key insight: **you only write what's different**. Everything else comes from base shaders.

---

## Common Base Classes

| Base Class | Provides |
| ---------- | -------- |
| `ShaderBase` | `VSMain()`, `PSMain()` entry points |
| `ShaderBaseStream` | `streams.ShadingPosition`, `streams.ColorTarget` |
| `Transformation` | Matrix uniforms |
| `PositionStream4` | `streams.Position` |
| `NormalStream` | `streams.Normal` |
| `Texturing` | `streams.TexCoord`, `Sampler`, texture slots |
| `Global` | `Time`, `TimeStep` |
| `ComputeShaderBase` | `Compute()` entry point |
| `ComputeColor` | Material property shader base |
