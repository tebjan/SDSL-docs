# Keywords

SDSL adds a handful of keywords to HLSL. Here they are.

---

## stream

Declares a variable that exists at every shader stage and passes automatically between them.

```hlsl
stream float4 Color : COLOR0;

void VSMain()
{
    streams.Color = float4(1, 0, 0, 1);   // Write in vertex shader
}

void PSMain()
{
    float4 c = streams.Color;              // Read in pixel shader
}
```

The compiler handles the inter-stage plumbing. You just use the variable.

---

## streams

The global container that holds all stream variables. Access any stream through it.

```hlsl
streams.Position         // Vertex position (from PositionStream4)
streams.ShadingPosition  // Output position (SV_POSITION)
streams.TexCoord         // Texture coordinates (from Texturing)
streams.ColorTarget      // Pixel shader output (SV_TARGET)
streams.InstanceID       // Instance index (from ShaderBaseStream)
streams.DispatchThreadId // Compute shader thread ID
```

---

## stage

Ensures a variable or method exists only once, even with complex inheritance.

```hlsl
shader BaseShader
{
    stage float4 computedValue;

    stage float4 ExpensiveCalculation()
    {
        // Runs only once, result shared everywhere
    }
}
```

Without `stage`, diamond inheritance could create duplicates. With `stage`, there's exactly one instance.

Use for:
- Expensive calculations
- Shared state across inheritance tree
- Methods that should only execute once

---

## override

Required when replacing a method from a parent shader.

```hlsl
shader MyShader : VS_PS_Base
{
    override stage void PSMain()    // Replacing parent's PSMain
    {
        streams.ColorTarget = float4(1, 1, 1, 1);
    }
};
```

Forgetting `override` causes a compiler error: "method already defined".

---

## abstract

Declares a method without implementing it. Forces child shaders to provide implementation.

```hlsl
shader ColorInterface
{
    abstract float4 ComputeColor();   // No body
};

shader RedColor : ColorInterface
{
    override float4 ComputeColor()    // Must implement
    {
        return float4(1, 0, 0, 1);
    }
};
```

You can inherit from a shader with abstract methods without implementing them (compiler warns but allows it). But the final shader must implement all abstracts.

---

## compose

Declares a slot for a pluggable shader piece.

```hlsl
shader MyShader
{
    compose ComputeColor colorSource;

    void DoSomething()
    {
        float4 c = colorSource.Compute();   // Calls the plugged-in shader
    }
};
```

See [Composition](composition.md) for full details.

---

## clone

Forces a separate instance when the same shader appears multiple times in compositions.

```hlsl
shader MyShader
{
    clone compose ComputeColor colorA;
    clone compose ComputeColor colorB;
};
```

Without `clone`, both would share state. With `clone`, each is independent.

---

## base

Calls the parent shader's implementation of a method.

```hlsl
shader ChildShader : ParentShader
{
    override void Compute()
    {
        base.Compute();        // Run parent's code first
        // Then add your own logic
    }
};
```

---

## Static Calls

Not a keyword, but useful: call a shader's method without inheriting from it.

```hlsl
float4 result = SomeOtherShader.HelperMethod(x, y);
```

Works like a static method call. The shader you're calling must not use instance variables, or it won't compile.

---

## Quick Reference

| Keyword | Purpose | Example |
|---------|---------|---------|
| `stream` | Variable available at all stages | `stream float4 Color;` |
| `streams` | Global container for stream vars | `streams.Position` |
| `stage` | Single instance across inheritance | `stage float4 value;` |
| `override` | Replace parent method | `override void PSMain()` |
| `abstract` | Declare method without body | `abstract float4 Compute();` |
| `compose` | Slot for pluggable shader | `compose ComputeColor c;` |
| `clone` | Force separate instance | `clone compose ComputeColor c;` |
| `base` | Call parent implementation | `base.Method();` |
