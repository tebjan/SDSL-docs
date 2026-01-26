# Common Errors

> What went wrong and how to fix it.

---

## Compilation Errors

### "Mixin not found" / "Dependency is not a module"

**Cause:** Shader file not found or name mismatch.

**Fix:**
1. Save the file
2. Filename must match shader name: `MyShader_DrawFX.sdsl` → `shader MyShader_DrawFX`
3. File must be in `shaders` folder next to your `.vl` document
4. Restart vvvv if it persists

---

### "Unable to find stream variable X"

**Cause:** Missing inheritance from shader that declares the stream.

**Fix:** Add the required base shader.

| Missing Stream | Add This |
|----------------|----------|
| `streams.Position` | `PositionStream4` |
| `streams.TexCoord` | `Texturing` |
| `streams.Normal` | `NormalStream` |
| `streams.Color` | `ColorStream` |
| `streams.InstanceID` | `ShaderBaseStream` |
| `streams.DispatchThreadId` | `ComputeShaderBase` |

Use Shader Explorer to find which shader declares any stream.

---

### "Method X already defined"

**Cause:** Missing `override` keyword.

**Fix:**
```hlsl
// Wrong
void VSMain() { }

// Correct
override stage void VSMain() { }
```

---

### "Cannot find variable WorldViewProjection"

**Cause:** Missing `Transformation` in inheritance chain.

**Note:** `VS_PS_Base` already includes `Transformation`. If using a basic shader like `ShaderBase`, add it:

**Fix:**
```hlsl
shader My_DrawFX : ShaderBase, Transformation
```

---

### "Semantic X is undefined"

**Cause:** Using HLSL semantics directly instead of streams.

**Fix:** Use stream system instead:
```hlsl
// Wrong (HLSL style)
float4 PSMain() : SV_TARGET { return color; }

// Correct (SDSL style)
override stage void PSMain()
{
    streams.ColorTarget = color;
}
```

---

### "Type X is not defined"

**Cause:** Custom struct not visible.

**Fix:**
1. Define struct in same file, or
2. Define in separate `.sdsl` and inherit from it

---

## Runtime / Node Issues

### Input pin doesn't appear

**Cause:** Variable declared but never used. Compiler optimizes it away.

**Fix:** Use the variable somewhere:
```hlsl
float Brightness;  // Unused = no pin

// Use it:
streams.ColorTarget = color * Brightness;  // Pin appears
```

---

### Node is red / no output

**Check these:**
1. All required inputs connected?
2. Buffer/texture inputs valid (not null)?
3. Instance/dispatch count > 0?
4. Shader compiled? (Look at vvvv console for errors)

---

### All instances at same position

**Cause:** `IsStructuredBuffer` not enabled on DynamicBuffer.

**Fix:** Enable the hidden pin `IsStructuredBuffer = true`.

---

### Compute shader doesn't run

**Check:**
1. Dispatch count set correctly?
2. `[numthreads(X,Y,Z)]` attribute present?
3. Buffer has elements?

---

### Output is black

**Common causes:**
1. `streams.ColorTarget` not assigned in PSMain
2. Alpha is 0 (change to 1)
3. Texture not bound
4. Wrong UV coordinates

**Debug:** Output solid color first:
```hlsl
streams.ColorTarget = float4(1, 0, 1, 1);  // Magenta = shader runs
```

---

### Output is wrong color / washed out

**Cause:** Color space mismatch (linear vs sRGB).

**Fix:** Check `[OutputFormat]` attribute matches your intent:
```hlsl
[OutputFormat("R8G8B8A8_UNorm_SRgb")]  // sRGB output
```

---

### Flickering / z-fighting

**Cause:** Depth precision issues or objects at same depth.

**Fix:**
1. Offset objects slightly
2. Use depth bias if available
3. Check near/far plane settings

---

## Logic Errors

### Shader compiles but output is wrong

**Debug approach:**
1. Output intermediate values as colors:
   ```hlsl
   streams.ColorTarget = float4(streams.TexCoord, 0, 1);  // Show UVs
   ```
2. Check coordinate spaces (object vs world vs view vs clip)
3. Use RenderDoc for GPU debugging

---

### Division by zero artifacts

**Cause:** Dividing by a value that can be zero.

**Fix:** Add small epsilon:
```hlsl
float result = value / max(divisor, 0.0001);
```

---

### Normals look inverted

**Cause:** Normal not transformed to world space, or wrong winding.

**Fix:**
```hlsl
float3 worldNormal = normalize(mul(streams.Normal, (float3x3)World));
```

---

### GPU readback is one frame delayed

**Cause:** GPU runs asynchronously. ReadBack gets previous frame's data.

**This is expected.** Design around it or use double buffering.

---

## Tips

- **Check vvvv console** — actual error messages appear there
- **Save often** — shader changes require file save to recompile
- **Start simple** — get basic output working before adding complexity
- **Use Shader Explorer** — verify inheritance provides what you need
- **Output debug colors** — magenta for "I got here", red for errors
