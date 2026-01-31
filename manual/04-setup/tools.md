# Tools & Setup (Windows)

> Tools you need before writing shaders.

---

## Required Software

### vvvv gamma

The runtime that compiles and executes your shaders.

| | |
|---|---|
| **Download** | [visualprogramming.net](https://visualprogramming.net) |
| **Version** | Latest stable (2024.6+) |
| **License** | Free for non-commercial |

---

### Stride Shader Explorer

**This is essential.** Without it, you're guessing what shaders exist.

| | |
|---|---|
| **Download** | [github.com/tebjan/Stride.ShaderExplorer/releases](https://github.com/tebjan/Stride.ShaderExplorer/releases) |
| **Requires** | .NET 6+ runtime |

The explorer shows you:
- Every shader in Stride's hierarchy
- What each shader provides (streams, methods, variables)
- The inheritance tree

See [Shader Explorer](../03-discovery/shader-explorer.md) for details.

---

## Code Editor (Choose One)

### Option A: VS Code + SDSL Extension (Recommended)

Full IntelliSense for SDSL shaders.

| | |
|---|---|
| **Download** | [code.visualstudio.com](https://code.visualstudio.com) |
| **Extension** | [Stride SDSL Shader Tools](https://marketplace.visualstudio.com/items?itemName=tebjan.sdsl) |
| **Requires** | .NET 8 Runtime (auto-installed) |

**What you get:**

- **Smart completions** — After `:` only base shaders, after `streams.` all available streams
- **Go to definition** — F12/Ctrl+Click on shaders, variables, methods (even external Stride shaders)
- **Rich hover** — Type info, qualifiers, inheritance origin, override chains
- **Real-time errors** — Problems appear as you type, not after save
- **One-click fixes** — Undefined variable? Hover shows which shader provides it, click to add
- **Sidebar panels** — Inheritance tree, streams, variables, methods for current shader

See [VS Code Extension](../03-discovery/vscode-extension.md) for full documentation.

---

### Option B: Visual Studio 2022 (Better for Debugging)

Heavier, but gives you actual error feedback while typing.

| | |
|---|---|
| **Download** | [visualstudio.microsoft.com](https://visualstudio.microsoft.com) |
| **Edition** | Community (free) is fine |
| **Extension** | Stride extension from VS Marketplace |

**What you get:**
- Error squiggles as you type
- Autocomplete for HLSL intrinsics
- Some go-to-definition support
- Better debugging experience

**Tradeoff:** ~5 second startup vs instant for VS Code

---

## Editor Comparison

| Feature | VS Code + SDSL | Visual Studio |
|---------|----------------|---------------|
| Syntax highlighting | ✅ | ✅ |
| Real-time errors | ✅ | ✅ |
| Completions | ✅ SDSL-aware | ✅ HLSL only |
| Go to definition | ✅ Full (even external) | ✅ Partial |
| One-click add base shader | ✅ | ❌ |
| Inheritance browser | ✅ Sidebar panels | ❌ |
| Startup time | Instant | ~5 seconds |

**Recommendation:** Use **VS Code + SDSL extension**. It understands SDSL inheritance, not just HLSL syntax.

---

## Optional: RenderDoc

GPU debugger. Lets you inspect what your shader actually computed.

| | |
|---|---|
| **Download** | [renderdoc.org](https://renderdoc.org) |
| **Use when** | Output is wrong but shader compiles |

Basic workflow:
1. Launch vvvv through RenderDoc
2. Capture a frame (F12 or PrintScreen)
3. Inspect textures, buffers, draw calls
4. See actual values at each pipeline stage

---

## Folder Structure

Before writing shaders, create this structure:

```
my-project/
├── MyProject.vl          ← Your vvvv patch
└── shaders/              ← MUST be named "shaders"
    └── (your .sdsl files go here)
```

The `shaders` folder name is **not optional**. vvvv looks specifically for this folder name next to your .vl document.
