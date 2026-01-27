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

## The Solution: Shader Explorer

The Stride Shader Explorer is a tool that:

- Parses all .sdsl files
- Shows the inheritance hierarchy
- Lets you search by name
- Displays source code
- Shows what each shader provides

**This is how you discover what's available.**

Not by memorizing documentation. By exploring the actual shaders.

---

## The Workflow

1. **Have a need:** "I need to access the camera position"
2. **Search:** Open Shader Explorer, search "camera" or "eye"
3. **Find:** `Transformation` has `Eye` (float3 camera position)
4. **Inherit:** Add `Transformation` to your shader
5. **Use:** Access `Eye` in your code

```hlsl
shader MyShader_DrawFX : VS_PS_Base
{
    override stage void PSMain()
    {
        float3 cameraPos = Eye;  // Available because of Transformation
        // ...
    }
};
```

---

## What You'll Learn

In the next pages:

1. **[Shader Explorer](shader-explorer.md)** — How to set it up and use it
2. **[Common Searches](common-searches.md)** — Quick answers to frequent questions
3. **[The Hierarchy](../02-core-concepts/inheritance.md)** — Understanding what inherits what

Once you internalize this workflow, you'll never feel lost in SDSL again.

→ Next: [Shader Explorer](shader-explorer.md)
