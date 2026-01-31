# Errors [vvvv]

> The node goes red. Now what?

---

## With VS Code Extension (Recommended)

The SDSL extension shows errors in real-time as you type:

| Issue | Severity |
|-------|----------|
| `'ColorTarget' is not defined` | Error |
| `Method 'Compute' is marked as override but no base method found` | Error |
| `Redundant: already inherited via 'MaterialShaderBase'` | Hint (faded) |

**One-click fixes:** Hover an undefined variable to see which shaders provide it, then click to add.

This is faster than the save-and-check workflow below.

See [VS Code Extension](../03-discovery/vscode-extension.md) for full documentation.

---

## Console-Based (Without Extension)

### Where Errors Actually Show

**Not on the node.** The node just turns red or pink. No message.

**In the Console:**
1. Quad menu → Logging → Show Console
2. Or press F1 to open TTY window

This is where compilation errors appear with actual messages.

---

## Reading Error Messages

Typical error format:

```
Error compiling shader MyEffect_TextureFX:
  at line 12: unable to find stream variable 'Position'
```

Key parts:
- **Shader name** — which shader failed
- **Line number** — where to look (approximately)
- **Message** — what went wrong

Line numbers are approximate. SDSL compiles through multiple stages, so the line might be off by a few.

---

## Common Errors and Fixes

### "Mixin not found: SomeShader"

**Cause:** Inherited shader doesn't exist.

```hlsl
// ERROR: "Mixin not found: filterbase"
shader MyFX : filterbase { }      // ✗ Wrong case

// CORRECT
shader MyFX : FilterBase { }      // ✓ Capital F, capital B
```

---

### "Unable to find stream variable X"

**Cause:** Using a stream that wasn't declared.

**Fix:** Inherit from the shader that provides that stream.

| Missing Stream | Inherit This |
|----------------|--------------|
| `streams.Position` | `PositionStream4` or `VS_PS_Base` |
| `streams.TexCoord` | `Texturing` |
| `streams.Normal` | `NormalStream` |
| `streams.Color` | `ColorStream` |
| `streams.InstanceID` | `ShaderBaseStream` or `VS_PS_Base` |
| `streams.DispatchThreadId` | `ComputeShaderBase` |

---

### "Method X is already defined"

**Cause:** Missing `override` keyword.

```hlsl
// ERROR
shader MyFX : VS_PS_Base
{
    void VSMain() { }           // ✗ Missing override
};

// CORRECT  
shader MyFX : VS_PS_Base
{
    override stage void VSMain() { }  // ✓
};
```

---

### "Cannot find variable WorldViewProjection"

**Cause:** Missing `Transformation` in inheritance chain.

**Note:** `VS_PS_Base` already includes `Transformation`. If you're using a more basic base shader like `ShaderBase`, you need to add it:

```hlsl
// ERROR
shader MyFX : ShaderBase
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);  // ✗
    }
};

// CORRECT
shader MyFX : ShaderBase, Transformation    // ✓ Add Transformation
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }
};
```

---

### "Dependency is not a module"

**Cause:** vvvv's internal state is corrupted.

**Fix:** Restart vvvv. No other solution.

---

### Shader compiles but pin doesn't appear

**Cause:** Variable declared but never used. Compiler optimizes it away.

```hlsl
float Brightness;  // Declared but unused = no pin

// Fix: use it somewhere
float Brightness;
override stage void PSMain()
{
    streams.ColorTarget = tex * Brightness;  // Now Brightness pin appears
}
```

---

## Debugging Strategies

### Strategy 1: Output solid colors

```hlsl
override stage void PSMain()
{
    // Instead of complex logic:
    streams.ColorTarget = float4(1, 0, 1, 1);  // Magenta = shader runs
}
```

If you see magenta → shader is executing. Problem is in your logic.
If you see nothing → shader isn't running at all.

---

### Strategy 2: Output intermediate values as colors

```hlsl
override stage void PSMain()
{
    // Debug: visualize UVs
    streams.ColorTarget = float4(streams.TexCoord, 0, 1);
    
    // Debug: visualize normals
    streams.ColorTarget = float4(streams.Normal * 0.5 + 0.5, 1);
    
    // Debug: visualize a float value (0-1 range)
    float value = someCalculation();
    streams.ColorTarget = float4(value, value, value, 1);
}
```

---

### Strategy 3: Comment out and bisect

```hlsl
override stage void PSMain()
{
    float a = step1();
    // float b = step2();    // Comment out
    // float c = step3();    // Comment out
    streams.ColorTarget = float4(a, 0, 0, 1);
}
```

Find which step breaks by uncommenting one at a time.

---

### Strategy 4: Use RenderDoc

For complex issues:
1. Launch vvvv through RenderDoc
2. Capture a frame
3. Inspect actual GPU state

See [Tools Setup](../04-setup/tools.md) for RenderDoc configuration.

---

## Quick Reference

| Error | Likely Cause | Fix |
|-------|--------------|-----|
| Mixin not found | Wrong name or file | Case-sensitive name match |
| Stream not found | Missing inheritance | Add correct base shader |
| Method already defined | Missing override | Add `override` keyword |
| Variable not found | Missing inheritance | Add `Transformation`, etc. |
| Dependency not a module | Corrupted state | Restart vvvv |
| No pin for parameter | Variable unused | Actually use the variable |
| No output (black) | Shader not running | Check node is connected, buffers valid |
