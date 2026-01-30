# Setup & Workflow [Stride]

> Key differences when using SDSL in Stride Studio.

---

## File Location

Shaders live in the Assets folder:

```
MyGame/
├── MyGame.sln
└── MyGame/
    └── Assets/
        └── Effects/
            ├── MyShader.sdsl
            └── MyPostProcess.sdsl
```

Stride uses its asset system. Shaders are compiled during build.

---

## Hot Reload

Game Studio automatically reloads project shaders on file save:

1. Edit shader in your editor
2. Save the file
3. Game Studio detects the change and recompiles

The game runtime also hot reloads shaders when they are file-based on disc. This works in both the editor and running game.

---

## Generated Files

Stride generates `.sdsl.cs` files:

```
MyShader.sdsl      → MyShader.sdsl.cs (auto-generated)
```

The .cs file contains `ParameterKey` definitions for binding from C#.

**Don't edit the .cs file.** It's regenerated on every build.

---

## C# Binding

To use shader parameters from C#:

```csharp
// Access parameter key (generated from shader)
var brightnessKey = MyShaderKeys.Brightness;

// Set value on material
material.Passes[0].Parameters.Set(brightnessKey, 1.5f);
```

The `Keys` class is auto-generated from your shader parameters.

---

## Material Integration

Shaders appear in Game Studio's Property Grid:

1. Create shader inheriting from `ComputeColor`
2. Build project
3. In Material Editor → select property → choose your shader
4. Parameters appear in Property Grid

---

## Error Location

Errors appear in:
- Visual Studio's Error List
- Output window during build
- Game Studio's log

Visual Studio with Stride extension gives best error reporting.

---

## Base Shaders

Stride's core shaders are available:
- `ShaderBase`, `ShaderBaseStream`
- `Transformation`, `Texturing`
- `ComputeShaderBase`, `ComputeColor`
- All stream providers

**Not available:**
- `VS_PS_Base` (vvvv specific)
- `FilterBase`, `MixerBase`, `TextureFX` (vvvv specific)

For post-processing, use `ImageEffectShader` instead.

---

## Effect Files (.sdfx)

Stride supports effect files for shader permutations:

```
MyEffect.sdfx        → Defines shader variants
MyEffect.sdsl        → Shader code
```

Effect files handle conditional compilation and variant management.

See the [Stride documentation](https://doc.stride3d.net/latest/en/manual/graphics/effects-and-shaders/) for details.

---

## Quick Comparison

| Aspect | vvvv | Stride |
|--------|------|--------|
| Shader location | `shaders/` next to .vl | `Assets/Effects/` |
| Reload | Hot (on save) | Hot (on save) |
| Node creation | Suffix-based | C# registration |
| Parameter binding | Automatic pins | ParameterKey in C# |
| Error display | Console/TTY | Visual Studio |
| Base shaders | + vvvv extras | Core only |

---

## Further Reading

- [Stride Shader Documentation](https://doc.stride3d.net/latest/en/manual/graphics/effects-and-shaders/)
- [Custom Shaders in Stride](https://doc.stride3d.net/latest/en/manual/graphics/effects-and-shaders/custom-shaders.html)
