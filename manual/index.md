# SDSL Manual

This manual covers everything you need to write shaders in SDSL for vvvv and Stride.

---

## Getting Started

### New to SDSL?

1. [Setup](04-setup/tools.md) - Install the tools
2. [Why SDSL?](01-why-sdsl/the-problem.md) - The motivation
3. [Core Concepts](02-core-concepts/streams.md) - Fundamentals

### Building Systems?

- [Discovery](03-discovery/the-problem.md) - Finding available shaders
- [System Design](08-system-design/shader-systems.md) - Multi-shader patterns
- [Patterns](09-patterns/instancing.md) - Common recipes

---

## By Platform

### vvvv

vvvv uses special file naming conventions (`_TextureFX`, `_DrawFX`, etc.) to automatically create nodes from your shaders.

- [File Rules](06-vvvv/file-rules.md) - Where files go
- [Reload Behavior](06-vvvv/reload-behavior.md) - Hot reload quirks
- [Finding Errors](06-vvvv/finding-errors.md) - Where to look

**Shader Types:**

- [TextureFX](07-shaders/texturefx.md) - Image effects
- [DrawFX](07-shaders/drawfx.md) - Geometry rendering
- [ComputeFX](07-shaders/computefx.md) - GPU compute
- [ShaderFX](07-shaders/shaderfx.md) - Material building blocks

### Stride

In Stride, you write `.sdsl` files directly and use them through the effect system.

- [Overview](05-stride/overview.md) - Key differences
- [Basic Shaders](07-shaders/stride-shaders.md) - Draw, compute, material shaders

---

## Core Concepts

These concepts apply to both platforms:

- [Streams](02-core-concepts/streams.md) - Data flows between shader stages automatically
- [Inheritance](02-core-concepts/inheritance.md) - Multiple parents, override what you need
- [Composition](02-core-concepts/composition.md) - Pluggable shader slots
- [Keywords](02-core-concepts/keywords.md) - `stage`, `stream`, `compose`, `override`

---

## Advanced Topics

- [Geometry Shaders](07-shaders/geometry-shaders.md) - Expand, modify, or generate primitives
- [System Design](08-system-design/shader-systems.md) - Particle systems, trail patterns
- [When to Split](08-system-design/when-to-split.md) - One shader or many?
- [Multi-Pass](08-system-design/multi-pass.md) - Compute pipelines
- [File Organization](08-system-design/file-organization.md) - Project structure

---

## Reference

- [Cheatsheet](appendix/cheatsheet.md) - Quick lookup
- [Base Shaders](appendix/base-shaders.md) - Available inheritance
- [Common Errors](appendix/errors.md) - Troubleshooting
- [HLSL to SDSL](10-porting/hlsl-to-sdsl.md) - Migration guide
