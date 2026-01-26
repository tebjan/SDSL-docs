# SDSL: Stop Duplicating Shader Logic

SDSL (Stride Shading Language) adds object-oriented features to HLSL. Inherit vertex shaders, matrices, and texturing from base classes instead of duplicating code across every shader.

```hlsl
shader TexturedQuad : ShaderBase, PositionStream4, Transformation, Texturing
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

Position from `PositionStream4`. Matrices from `Transformation`. UVs from `Texturing`. No boilerplate.

## **[tebjan.github.io/SDSL-docs](https://tebjan.github.io/SDSL-docs)**

---

## What You'll Learn

- **Why SDSL** - The boilerplate problem and how inheritance solves it
- **Core concepts** - Streams, inheritance, composition
- **Working examples** - TextureFX, DrawFX, ComputeFX, ShaderFX
- **System design** - Multi-shader systems, particles, pipelines
- **Platform setup** - vvvv gamma and Stride workflows

## In Production

SDSL is the shader language of the [Stride](https://stride3d.net/) game engine. [vvvv gamma](https://vvvv.org/) uses Stride's rendering and SDSL through deep integration, adding its own base shaders (`VS_PS_Base`, `FilterBase`) and the TextureFX/DrawFX/ComputeFX/ShaderFX node system. [VL.Fuse](https://www.thefuselab.io/) overlays a polished visual workflow that makes GPU development accessible, rapid, and production-ready.

vvvv has powered large-scale media installations since 2002: the Guggenheim Bilbao, immersive exhibitions, multi-machine live events. Its hybrid workflow lets you mix SDSL text shaders, visual shader graphs, visual programming nodes, and C# code in the same project, all hot-reloading as you work.

### New SDSL Compiler

[stride3d/SDSL](https://github.com/stride3d/SDSL) is a new compiler for the same language:

- Pure C#, targets SPIR-V directly
- Faster compilation
- Active development

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

---

## Local Development

To build the documentation locally:

1. Install [.NET SDK](https://dotnet.microsoft.com/download) (8.x or later)
2. Install DocFX:
   ```bash
   dotnet tool install -g docfx
   ```
3. Build:
   ```bash
   docfx docfx.json
   ```
4. Serve locally:
   ```bash
   docfx serve _site
   ```
5. Open `http://localhost:8080`

## Contributing

Contributions welcome. Edit the markdown files in `articles/` and submit a pull request.

## License

Documentation is open source. SDSL itself is part of the [Stride](https://stride3d.net/) game engine (MIT licensed, .NET Foundation).
