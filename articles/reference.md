# SDSL Language Reference

Complete reference for the SDSL shading language.

## Table of Contents

- [Syntax](#syntax)
- [Data Types](#data-types)
- [Shader Structure](#shader-structure)
- [Keywords](#keywords)
- [Streams](#streams)
- [Composition](#composition)

## Syntax

SDSL uses HLSL-like syntax with additional features for composition and modularity.

### Basic Syntax Rules

- Statements end with semicolons (`;`)
- Code blocks are enclosed in curly braces (`{}`)
- Comments use `//` for single-line and `/* */` for multi-line
- Case-sensitive language

## Data Types

### Scalar Types

- `bool`: Boolean value (true/false)
- `int`: 32-bit signed integer
- `uint`: 32-bit unsigned integer
- `float`: 32-bit floating point
- `double`: 64-bit floating point

### Vector Types

- `float2`, `float3`, `float4`: 2D, 3D, and 4D float vectors
- `int2`, `int3`, `int4`: Integer vectors
- `uint2`, `uint3`, `uint4`: Unsigned integer vectors
- `bool2`, `bool3`, `bool4`: Boolean vectors

### Matrix Types

- `float4x4`: 4x4 float matrix
- `float3x3`: 3x3 float matrix
- `float2x2`: 2x2 float matrix

### Texture Types

- `Texture2D`: 2D texture
- `Texture3D`: 3D texture
- `TextureCube`: Cube map texture
- `Texture2DArray`: 2D texture array

## Shader Structure

```hlsl
shader ShaderName : BaseShader, Interface1, Interface2
{
    // Members
    float4 MyVariable;
    Texture2D MyTexture;
    
    // Methods
    stage override void VSMain()
    {
        // Vertex shader code
    }
    
    stage override void PSMain()
    {
        // Pixel shader code
    }
}
```

## Keywords

### Shader Keywords

- `shader`: Declares a shader
- `stage`: Marks shader stage methods
- `override`: Overrides base shader methods
- `abstract`: Declares abstract shaders

### Flow Control

- `if`, `else`: Conditional statements
- `for`: For loop
- `while`: While loop
- `do`: Do-while loop
- `switch`, `case`, `default`: Switch statement
- `break`: Exit loop or switch
- `continue`: Skip to next iteration
- `return`: Return from function

### Type Modifiers

- `const`: Constant value
- `static`: Static member
- `uniform`: Uniform variable
- `varying`: Varying variable

## Streams

Streams are special data structures for passing data between shader stages:

```hlsl
stage override void VSMain()
{
    streams.Position = input.Position;
    streams.Normal = input.Normal;
    streams.TexCoord = input.TexCoord;
}

stage override void PSMain()
{
    float3 normal = normalize(streams.Normal);
    float2 uv = streams.TexCoord;
}
```

### Common Stream Members

- `streams.Position`: Vertex position
- `streams.Normal`: Surface normal
- `streams.TexCoord`: Texture coordinates
- `streams.ColorTarget`: Output color
- `streams.ShadingPosition`: Transformed position

## Composition

SDSL supports shader composition through inheritance and interfaces:

```hlsl
// Interface
interface ILighting
{
    float3 ComputeLighting();
}

// Implementation
shader PhongLighting : ILighting
{
    override float3 ComputeLighting()
    {
        // Phong lighting calculation
        return float3(1, 1, 1);
    }
}

// Usage
shader MyShader : ShaderBase, PhongLighting
{
    stage override void PSMain()
    {
        float3 lighting = this.ComputeLighting();
        streams.ColorTarget = float4(lighting, 1);
    }
}
```

## Built-in Functions

### Mathematical Functions

- `abs(x)`: Absolute value
- `sqrt(x)`: Square root
- `pow(x, y)`: Power
- `sin(x)`, `cos(x)`, `tan(x)`: Trigonometric functions
- `min(x, y)`, `max(x, y)`: Minimum/maximum
- `clamp(x, min, max)`: Clamp value
- `lerp(a, b, t)`: Linear interpolation

### Vector Functions

- `dot(a, b)`: Dot product
- `cross(a, b)`: Cross product
- `normalize(v)`: Normalize vector
- `length(v)`: Vector length
- `distance(a, b)`: Distance between points

### Texture Functions

- `Sample(sampler, coord)`: Sample texture
- `SampleLevel(sampler, coord, level)`: Sample with explicit LOD
- `SampleGrad(sampler, coord, ddx, ddy)`: Sample with gradients

## Best Practices

1. **Use composition**: Break complex shaders into reusable components
2. **Leverage inheritance**: Build on existing shaders
3. **Optimize performance**: Avoid unnecessary calculations
4. **Document your code**: Use comments to explain complex logic
5. **Follow naming conventions**: Use clear, descriptive names

## Examples

See the [Tutorials](tutorials.md) section for practical examples and step-by-step guides.
