# The Discovery Problem

> "I'm staring at a blank shader. What can I even use?"

---

## The Frustration

You know SDSL uses inheritance. You've seen shaders inherit from `Transformation` to get matrices. But:

- How do you know `Transformation` exists?
- How do you know it has `WorldViewProjection`?
- What other matrices does it provide?
- What else is out there?

**This is the discovery problem.** SDSL is powerful, but only if you know what's available.

---

## The Questions

Every SDSL developer asks these:

| Question | What You Need |
|----------|---------------|
| "I need UV coordinates" | Which shader provides `streams.TexCoord`? |
| "I need time" | Which shader has `Time`? |
| "I need the camera position" | What's it called? Where is it? |
| "I need instance ID" | Which shader declares `streams.InstanceID`? |
| "What matrices exist?" | List all transform matrices |
| "What can I override in VS_PS_Base?" | What methods does it have? |

The answers exist. But they're not obvious.

---

## Why Documentation Isn't Enough

You could memorize a reference table. But:

1. **There are hundreds of shaders** — can't memorize them all
2. **They form a hierarchy** — you need to understand what inherits what
3. **They evolve** — new shaders get added, old ones change
4. **Custom shaders** — your team might have project-specific ones

You need a way to **explore**, not just read.

---

## The Solution: Two Tools

### In-Editor: VS Code Extension

The SDSL extension brings discovery into your editor:

- **Sidebar panels** — Browse inheritance, streams, variables, methods
- **Hover info** — See what any shader provides
- **One-click fixes** — Use undefined variable → hover shows which shader has it → click to add
- **Completions** — `streams.` shows all available streams from your inheritance

This is your primary tool while coding. See [VS Code Extension](vscode-extension.md).

### Deep Exploration: Shader Explorer

For understanding full hierarchies before you start:

- Complete inheritance tree visualization
- Search across all shaders
- View full source code
- Explore custom project shaders

See [Shader Explorer](shader-explorer.md).

---

## The Workflow

**With VS Code extension:**

1. Use a variable like `Eye`
2. Hover shows: "Defined in: Transformation"
3. Click to add `Transformation` to inheritance
4. Done

**With Shader Explorer:**

1. **Have a need:** "I need the camera position"
2. **Search:** Open Shader Explorer, search "camera" or "eye"
3. **Find:** `Transformation` has `Eye` (float3)
4. **Inherit:** Add `Transformation` to your shader

```hlsl
shader MyShader_DrawFX : VS_PS_Base
{
    override stage void PSMain()
    {
        float3 cameraPos = Eye;  // From Transformation
        // ...
    }
};
```

---

## What You'll Learn

In the next pages:

1. **[VS Code Extension](vscode-extension.md)** — In-editor discovery and fixes
2. **[Shader Explorer](shader-explorer.md)** — Browse the full hierarchy
3. **[Common Searches](common-searches.md)** — Quick answers to frequent questions

→ Next: [VS Code Extension](vscode-extension.md)
