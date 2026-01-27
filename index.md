# SDSL: The Fast Track

**Stop duplicating shader logic. Start inheriting it.**

SDSL extends HLSL with object-oriented features. Inherit matrices, streams, and rendering setups from base shaders. Compose shaders together at runtime.

```hlsl
shader UVGradient : ShaderBase, PositionStream4, Transformation, Texturing
{
    override stage void VSMain()
    {
        streams.ShadingPosition = mul(streams.Position, WorldViewProjection);
    }

    override stage void PSMain()
    {
        streams.ColorTarget = float4(streams.TexCoord, 0, 1);
    }
};
```

Position from `PositionStream4`. Matrices from `Transformation`. UVs from `Texturing`. You only write what changes.

---

## How to Read This Guide

**New to SDSL?** Start here:

1. [Setup](manual/00-setup/tools.md) - Install the tools
2. [Why SDSL?](manual/01-why-sdsl/the-problem.md) - The motivation
3. [Core Concepts](manual/02-core-concepts/streams.md) - Fundamentals
4. [First Shaders](manual/04-first-shaders/texturefx.md) - Working examples

**Building systems?**

- [Setup & Workflow](manual/03-setup-workflow-vvvv/file-rules.md) - File locations, reload behavior
- [Discovery](manual/05-discovery/the-problem.md) - Finding available shaders
- [System Design](manual/06-system-design/shader-systems.md) - Multi-shader patterns

**Reference:**

- [Patterns](manual/07-patterns/instancing.md) - Common recipes
- [Appendix](manual/appendix/cheatsheet.md) - Quick lookups

---

## Documentation

### Setup

- [Tools & Setup](manual/00-setup/tools.md)

### Why SDSL

- [The Problem](manual/01-why-sdsl/the-problem.md) - HLSL boilerplate
- [The Solution](manual/01-why-sdsl/the-solution.md) - Inheritance
- [The Payoff](manual/01-why-sdsl/the-payoff.md) - System design benefits
- [Two Tracks](manual/01-why-sdsl/two-tracks.md) - vvvv vs Stride workflows

### Core Concepts

- [Streams](manual/02-core-concepts/streams.md) - Data flow between stages
- [Inheritance](manual/02-core-concepts/inheritance.md) - Multiple parents, override
- [Composition](manual/02-core-concepts/composition.md) - Pluggable shader slots
- [Keywords](manual/02-core-concepts/keywords.md) - `stage`, `stream`, `compose`, `override`

### Setup & Workflow [vvvv]

- [File Rules](manual/03-setup-workflow-vvvv/file-rules.md) - Where files go
- [Reload Behavior](manual/03-setup-workflow-vvvv/reload-behavior.md) - Hot reload quirks
- [Finding Errors](manual/03-setup-workflow-vvvv/finding-errors.md) - Where to look

### Setup & Workflow [Stride]

- [Overview](manual/03-setup-workflow-stride/overview.md) - Key differences

### First Shaders

- [TextureFX](manual/04-first-shaders/texturefx.md) - Image effects
- [ComputeFX](manual/04-first-shaders/computefx.md) - GPU compute
- [DrawFX](manual/04-first-shaders/drawfx.md) - Geometry rendering
- [Geometry Shaders](manual/04-first-shaders/geometry-shaders.md) - GSMain
- [ShaderFX](manual/04-first-shaders/shaderfx.md) - Material building blocks

### Discovery

- [The Discovery Problem](manual/05-discovery/the-problem.md)
- [Shader Explorer](manual/05-discovery/shader-explorer.md)
- [Common Searches](manual/05-discovery/common-searches.md)

### System Design

- [Shader Systems](manual/06-system-design/shader-systems.md) - Particle & trail patterns
- [When to Split](manual/06-system-design/when-to-split.md) - One shader or many?
- [Shared Base](manual/06-system-design/shared-base.md) - Type definitions
- [Multi-Pass](manual/06-system-design/multi-pass.md) - Compute pipelines
- [File Organization](manual/06-system-design/file-organization.md) - Project structure

### Patterns

- [Instancing](manual/07-patterns/instancing.md)

### Porting

- [HLSL to SDSL](manual/08-porting/hlsl-to-sdsl.md)

### Appendix

- [Cheatsheet](manual/appendix/cheatsheet.md)
- [Base Shaders](manual/appendix/base-shaders.md)
- [Common Errors](manual/appendix/errors.md)

---

## In Production

SDSL is the shader language of the [Stride](https://stride3d.net/) game engine. [vvvv gamma](https://vvvv.org/) uses Stride's rendering and SDSL through deep integration, adding its own base shaders (`VS_PS_Base`, `FilterBase`) and the TextureFX/DrawFX/ComputeFX/ShaderFX node system. [VL.Fuse](https://www.thefuselab.io/) overlays a polished visual workflow that makes GPU development accessible, rapid, and production-ready.

vvvv has powered large-scale media installations since 2002 - the Guggenheim Bilbao, immersive exhibitions, multi-machine live events. Its hybrid workflow lets you mix SDSL text shaders, visual shader graphs, visual programming nodes, and C# code in the same project - all hot-reloading as you work.

### New SDSL Compiler

[stride3d/SDSL](https://github.com/stride3d/SDSL) is a new compiler for the same language:

- Pure C#, targets SPIR-V directly
- Faster compilation
- Active development (780+ commits)

---

## Origins

SDSL implements ideas from:

> **[Spark: Modular, Composable Shaders for Graphics Hardware](https://graphics.stanford.edu/papers/spark/spark_preprint.pdf)**
> Tim Foley & Pat Hanrahan, SIGGRAPH 2011

SDSL builds on the [original Spark research](https://github.com/spark-shading-language/spark).

### Developers

**Virgile Bello** ([xen2](https://github.com/xen2)) leads Stride development. Previously: Silicon Studio Tokyo (Lead Architect), NVIDIA (OpenGL team), Woven by Toyota (vehicle simulator).

**Alexandre Mutel** ([xoofx](https://github.com/xoofx)) created SharpDX and designed Unity's Burst compiler. Microsoft MVP. Co-created Xenko at Silicon Studio Tokyo.

Built at Silicon Studio in Tokyo (2011-2016), now part of [Stride](https://stride3d.net/) (MIT license, .NET Foundation).

---

## Resources

- [Spark Paper](https://graphics.stanford.edu/papers/spark/spark_preprint.pdf) (SIGGRAPH 2011)
- [New SDSL Compiler](https://github.com/stride3d/SDSL)
- [Stride Docs](https://doc.stride3d.net/latest/en/manual/graphics/effects-and-shaders/shading-language/)
- [Shader Explorer](https://github.com/tebjan/Stride.ShaderExplorer)
- [vvvv](https://vvvv.org/)
- [vvvv Gray Book](https://thegraybook.vvvv.org/reference/libraries/3d/shaders.html)
