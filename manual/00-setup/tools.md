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

After install, verify it runs. Create a new document. That's your test bed.

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

See [Shader Explorer](../05-discovery/shader-explorer.md) for details.

---

## Code Editor (Choose One)

### Option A: Visual Studio Code (Recommended to Start)

Fast, lightweight, good enough for most work.

| | |
|---|---|
| **Download** | [code.visualstudio.com](https://code.visualstudio.com) |
| **Extension** | "Shader languages support for VS Code" by slevesque |

**Setup steps:**
1. Install VS Code
2. Open Extensions (Ctrl+Shift+X)
3. Search "shader languages support"
4. Install the slevesque extension
5. Associate .sdsl files with HLSL:
   - Open any .sdsl file
   - Click language mode in bottom-right (shows "Plain Text")
   - Select "Configure File Association for '.sdsl'"
   - Choose "HLSL"

**What you get:**
- Syntax highlighting
- Basic brace matching

**What you DON'T get:**
- Error checking (you won't see errors until vvvv compiles)
- Autocomplete
- Go to definition

---

### Option B: Visual Studio 2022 (Better for Debugging)

Heavier, but gives you actual error feedback while typing.

| | |
|---|---|
| **Download** | [visualstudio.microsoft.com](https://visualstudio.microsoft.com) |
| **Edition** | Community (free) is fine |
| **Extension** | Stride extension from VS Marketplace |

**Setup steps:**
1. Install Visual Studio 2022
2. During install, select ".NET desktop development" workload
3. After install: Extensions → Manage Extensions
4. Search "Stride" → Install the Stride extension
5. Restart Visual Studio

**What you get:**
- Error squiggles as you type
- Autocomplete for HLSL intrinsics
- Some go-to-definition support
- Better debugging experience

**Tradeoff:** ~5 second startup vs instant for VS Code

---

## Editor Comparison

| Feature | VS Code | Visual Studio |
|---------|---------|---------------|
| Syntax highlighting | ✅ | ✅ |
| Error squiggles | ❌ | ✅ |
| Autocomplete | ❌ | ✅ |
| Go to definition | ❌ | ✅ (partial) |
| Startup time | Instant | ~5 seconds |

**Recommendation:** 

Start with **VS Code** for the fast iteration cycle. You'll save, see errors in vvvv's console, fix, repeat. It's annoying but workable.

Switch to **Visual Studio** when:
- You're debugging a complex shader
- Error messages in vvvv aren't helpful enough
- You want autocomplete for HLSL functions

Many people use both: VS Code for quick edits, Visual Studio for debugging sessions.

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

---

## Quick Verification

1. Create a folder `test-project`
2. Save an empty vvvv document as `test-project/Test.vl`
3. Create `test-project/shaders/` folder
4. Create `test-project/shaders/Red_TextureFX.sdsl`:

```hlsl
shader Red_TextureFX : FilterBase
{
    float4 Filter(float4 tex0col)
    {
        return float4(1, 0, 0, 1);
    }
};
```

5. In vvvv, open NodeBrowser (double-click canvas)
6. Search "Red"
7. You should see "Red [TextureFX]"

If the node appears → your setup works.
If not → check file location, filename matches shader name.
