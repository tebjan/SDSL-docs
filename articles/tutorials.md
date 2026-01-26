# SDSL Tutorials

Learn SDSL through practical examples and step-by-step tutorials.

## Beginner Tutorials

### Tutorial 1: Your First Shader

In this tutorial, you'll create your first SDSL shader.

#### Step 1: Set Up Your Project

Create a new shader file with the `.sdsl` extension.

#### Step 2: Define a Basic Shader

```hlsl
shader MyFirstShader : ShaderBase
{
    stage override void VSMain()
    {
        streams.ShadingPosition = streams.Position;
    }
}
```

#### Step 3: Compile and Use

Compile your shader and integrate it into your rendering pipeline.

### Tutorial 2: Adding Color

Learn how to add color to your shaders:

```hlsl
shader ColorShader : ShaderBase
{
    stage override void PSMain()
    {
        streams.ColorTarget = float4(1, 0, 0, 1); // Red color
    }
}
```

## Intermediate Tutorials

### Tutorial 3: Texture Mapping

Work with textures in SDSL:

```hlsl
shader TexturedShader : ShaderBase
{
    Texture2D DiffuseTexture;
    SamplerState LinearSampler;
    
    stage override void PSMain()
    {
        float4 color = DiffuseTexture.Sample(LinearSampler, streams.TexCoord);
        streams.ColorTarget = color;
    }
}
```

### Tutorial 4: Lighting

Implement basic lighting:

```hlsl
shader LitShader : ShaderBase
{
    stage override void PSMain()
    {
        float3 normal = normalize(streams.Normal);
        float3 lightDir = normalize(float3(1, 1, 1));
        float ndotl = max(dot(normal, lightDir), 0.0);
        
        streams.ColorTarget = float4(ndotl, ndotl, ndotl, 1);
    }
}
```

## Advanced Tutorials

### Tutorial 5: Shader Composition

Combine multiple shaders to create complex effects:

```hlsl
shader CompositeShader : ShaderBase, ILighting, ITexturing
{
    // Combine multiple features
}
```

## Practice Projects

1. Create a simple toon shader
2. Implement normal mapping
3. Build a water shader with reflections
4. Create a particle system shader

## Additional Resources

- [Language Reference](reference.md) for detailed syntax
- Community examples and shared shaders
- Video tutorials (coming soon)

Happy shader coding!
