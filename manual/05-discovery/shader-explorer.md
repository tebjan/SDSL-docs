# Shader Explorer

> "I need X. Which shader has it?"

This tool answers that question.

---

## What It Does

Shader Explorer parses all SDSL files and shows you:
- Every shader and its inheritance tree
- All variables, methods, and streams
- What each shader provides

Instead of guessing which shader to inherit, you search for what you need.

---

## Installation

1. Download from [github.com/tebjan/Stride.ShaderExplorer/releases](https://github.com/tebjan/Stride.ShaderExplorer/releases)
2. Extract and run the exe

Pin it to your taskbar. You'll use it constantly.

---

## Without Stride Installed

Shader Explorer normally requires Stride to be installed. If you only use vvvv and don't want to install Stride Studio (which is several gigabytes), you can install just the shader packages:

**Step 1:** Make sure this folder exists:
```
C:\Users\<yourusername>\.nuget\packages
```

**Step 2:** Open vvvv, then `Quad menu > Manage Nugets > Commandline`

**Step 3:** Navigate to the packages folder:
```
cd %userprofile%\.nuget\packages
```

**Step 4:** Install only the shader packages (no dependencies):
```
nuget install Stride.Rendering -Version 4.2.0.2188 -DependencyVersion ignore
nuget install Stride.Graphics -Version 4.2.0.2188 -DependencyVersion ignore
```

Replace the version number with your vvvv's Stride version (check `Hamburger menu > About`).

**Step 5:** Run Shader Explorer. It should now find the Stride shaders.

Credit: [motzi's forum tutorial](https://forum.vvvv.org/t/howto-explore-strides-shaders-without-installing-stride-studio/21020)

---

## Adding vvvv Shaders

By default, Shader Explorer only shows Stride's built-in shaders. To add vvvv shaders:

1. Click the folder icon in the toolbar
2. Navigate to: `C:\Program Files\vvvv\vvvv_gamma_...\lib\packs\VL.Stride.Runtime...\stride\Assets\Effects`
3. Click Select Folder

Now you can search `VS_PS_Base`, `TextureFX`, `FilterBase`, `ShaderUtils`, and other vvvv-specific shaders.

---

## Adding Your Own Shaders

Same process. Add any folder containing `.sdsl` files:

1. Click the folder icon
2. Navigate to your project's `shaders` folder
3. Click Select Folder

Your custom shaders now appear alongside the built-in ones.

---

## Finding What You Need

**Workflow:**

1. Type what you need in the search box (e.g., "WorldViewProjection")
2. Results show which shaders contain that term
3. Click a shader to see its full definition
4. Note the shader name and inherit from it

**Example:** You need transformation matrices.

1. Search "WorldViewProjection"
2. Find it in `Transformation`
3. In your shader: `shader MyShader : Transformation { }`
4. Now `WorldViewProjection`, `World`, `View`, `Projection` are all available

---

## Reading the UI

The left panel shows the inheritance tree:

```
ShaderBaseStream
└── ShaderBase
    └── Texturing
        └── TextureFX
            └── FilterBase
```

Click any shader to see its code in the right panel.

The code panel shows:
- Variables and their types
- Stream declarations
- Methods (with full signatures)
- What this shader inherits from

---

## Common Searches

| I need | Search | Inherit |
|--------|--------|---------|
| World/View/Projection matrices | `WorldViewProjection` | `Transformation` |
| Vertex position | `Position` | `PositionStream4` |
| Texture coordinates | `TexCoord` | `Texturing` |
| Normal vectors | `Normal` | `NormalStream` |
| Tangent vectors | `Tangent` | `TangentStream` |
| Vertex colors | `Color` | `ColorStream` |
| Instance ID | `InstanceID` | `ShaderBaseStream` |
| Time | `Time` | `Global` |
| SV_Position output | `ShadingPosition` | `ShaderBaseStream` |
| Pixel output | `ColorTarget` | `ShaderBaseStream` |
| Sampler | `Sampler` | `Texturing` |
| PI and math | `PI` | `ShaderUtils` (vvvv) |

---

## Tips

**Can't find something?** Try shorter search terms. "World" finds more than "WorldViewProjection".

**See the full hierarchy?** Click on a base shader and trace up the inheritance chain.

**Copy code?** Select and copy directly from the code panel.

**Multiple directories?** You can add as many shader directories as you need. Remove them by clicking the X next to the path.
