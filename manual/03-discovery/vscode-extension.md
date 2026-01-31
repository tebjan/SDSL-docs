# VS Code Extension

> Full IntelliSense for SDSL shaders.

---

## Install

1. Open VS Code
2. Extensions (Ctrl+Shift+X)
3. Search "SDSL"
4. Install [Stride SDSL Shader Tools](https://marketplace.visualstudio.com/items?itemName=tebjan.sdsl)

Requires .NET 8 Runtime (auto-installed).

---

## Smart Completions

Context-aware suggestions:

| After typing | You see |
|--------------|---------|
| `:` in shader declaration | Base shaders only |
| `compose` | Interface shaders only |
| `base.` | Inherited methods only |
| `streams.` | All stream variables (sorted by proximity) |
| `override` | Overridable methods from base shaders |

Plus 100+ HLSL intrinsics with signatures.

---

## Navigation

**F12 / Ctrl+Click** works on:

- Shader names → Jump to definition
- Base shaders → Opens file (even external Stride/vvvv shaders)
- Method calls → Jump to definition in inheritance chain
- Variables → Jump to declaration

External shaders (Stride, vvvv) open read-only.

---

## Rich Hover Info

Hover over any identifier:

| Item | Shows |
|------|-------|
| Shader | Base classes, variable/method count, compositions, file location |
| Variable | Type, qualifiers (`stage`, `stream`, `compose`), inherited or local |
| Method | Full signature, override chain across inheritance |
| Swizzle | Type inference (e.g., `float4.xy` → `float2`) |

---

## Real-time Diagnostics

Errors and warnings as you type:

| Issue | Severity |
|-------|----------|
| `'ColorTarget' is not defined` | Error |
| `Method 'Compute' is marked as override but no base method found` | Error |
| `Base shader 'ShaderBase' not found in workspace` | Warning |
| `Redundant: already inherited via 'MaterialShaderBase'` | Hint (faded) |

---

## One-Click Base Shader Management

When you use an undefined variable, hover shows which shaders provide it:

```
Click to add as base shader:
Defined in: ShaderBaseStream
Also via: MaterialShaderBase, ComputeColorTextureBase
```

Click any shader name → instantly added to your inheritance list.

Redundant base shaders show a **Remove** link.

---

## Sidebar Panels

Four panels in the **Stride Shaders** activity bar:

| Panel | Shows |
|-------|-------|
| **Inheritance** | Current shader + all base shaders (click to open) |
| **Streams** | All `stream` variables from inheritance chain |
| **Variables** | `stage`, `compose`, and regular variables |
| **Methods** | All methods including inherited |

Each item shows its source shader. Click to jump to definition.

---

## Shader Discovery

The extension automatically finds shaders from:

1. **Your workspace** — Any `.sdsl` files
2. **NuGet packages** — `Stride.*` packages in global cache
3. **vvvv gamma** — Auto-detects in `C:\Program Files\vvvv\`

Add custom paths in settings:

```json
{
  "strideShaderTools.shaderPaths": [
    "C:/MyShaderLibrary"
  ]
}
```

---

## Commands

| Command | Description |
|---------|-------------|
| `Stride Shaders: Restart Language Server` | Reload if things get stuck |
| `Stride Shaders: Show Inheritance Tree` | Focus the inheritance panel |
| `Stride Shaders: Refresh Panels` | Update all sidebar panels |

---

## Complements Shader Explorer

| Task | Tool |
|------|------|
| Writing code | VS Code extension |
| Deep hierarchy exploration | Shader Explorer |
| Quick "what provides X?" | Extension hover |
| Browse all available shaders | Either |

The extension is for in-editor work. Shader Explorer is for broader exploration before you start.
