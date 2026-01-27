// HLSL/SDSL language definition for highlight.js
// Based on highlightjs-hlsl with SDSL additions

export default function(hljs) {
  // Number patterns
  const NUMBER = {
    className: 'number',
    variants: [
      { begin: '\\b0[xX][a-fA-F0-9]+[uUlL]?' },
      { begin: '\\b\\d+\\.\\d*([eE][-+]?\\d+)?[fFhHlL]?' },
      { begin: '\\b\\.\\d+([eE][-+]?\\d+)?[fFhHlL]?' },
      { begin: '\\b\\d+([eE][-+]?\\d+)?[fFhHlL]?' },
      { begin: '\\b\\d+[uUlL]?' }
    ],
    relevance: 0
  };

  // Generate type combinations (float4, float4x4, etc.)
  const dims = ['', '1', '2', '3', '4', '1x1', '1x2', '1x3', '1x4', '2x1', '2x2', '2x3', '2x4', '3x1', '3x2', '3x3', '3x4', '4x1', '4x2', '4x3', '4x4'];
  const baseTypes = 'bool double float half int uint min16float min10float min16int min12int min16uint'.split(' ');
  const vectorMatrixTypes = [];
  for (const base of baseTypes) {
    for (const dim of dims) {
      vectorMatrixTypes.push(base + dim);
    }
  }

  // All type keywords
  const TYPES = vectorMatrixTypes.join(' ') +
    ' void vector matrix string dword ' +
    'Buffer StructuredBuffer RWBuffer RWStructuredBuffer ByteAddressBuffer RWByteAddressBuffer AppendStructuredBuffer ConsumeStructuredBuffer ' +
    'Texture1D Texture1DArray Texture2D Texture2DArray Texture2DMS Texture2DMSArray Texture3D TextureCube TextureCubeArray ' +
    'RWTexture1D RWTexture1DArray RWTexture2D RWTexture2DArray RWTexture3D ' +
    'SamplerState SamplerComparisonState sampler texture ' +
    'InputPatch OutputPatch TriangleStream LineStream PointStream ' +
    'VertexShader PixelShader GeometryShader HullShader DomainShader ComputeShader';

  // Built-in functions
  const FUNCTIONS =
    'abs acos all AllMemoryBarrier AllMemoryBarrierWithGroupSync any asdouble asfloat asin asint asuint atan atan2 ' +
    'ceil CheckAccessFullyMapped clamp clip cos cosh countbits cross ' +
    'D3DCOLORtoUBYTE4 ddx ddx_coarse ddx_fine ddy ddy_coarse ddy_fine degrees determinant DeviceMemoryBarrier DeviceMemoryBarrierWithGroupSync distance dot dst ' +
    'EvaluateAttributeAtCentroid EvaluateAttributeAtSample EvaluateAttributeSnapped exp exp2 ' +
    'f16tof32 f32tof16 faceforward firstbithigh firstbitlow floor fma fmod frac frexp fwidth ' +
    'GetRenderTargetSampleCount GetRenderTargetSamplePosition GroupMemoryBarrier GroupMemoryBarrierWithGroupSync ' +
    'InterlockedAdd InterlockedAnd InterlockedCompareExchange InterlockedCompareStore InterlockedExchange InterlockedMax InterlockedMin InterlockedOr InterlockedXor ' +
    'isfinite isinf isnan ldexp length lerp lit log log10 log2 ' +
    'mad max min modf msad4 mul noise normalize pow ' +
    'radians rcp reflect refract reversebits round rsqrt saturate sign sin sincos sinh smoothstep sqrt step ' +
    'tan tanh tex1D tex1Dbias tex1Dgrad tex1Dlod tex1Dproj tex2D tex2Dbias tex2Dgrad tex2Dlod tex2Dproj ' +
    'tex3D tex3Dbias tex3Dgrad tex3Dlod tex3Dproj texCUBE texCUBEbias texCUBEgrad texCUBElod texCUBEproj transpose trunc ' +
    'Sample SampleLevel SampleGrad SampleCmp SampleCmpLevelZero Load Store GetDimensions';

  // Control flow and declaration keywords (HLSL + SDSL)
  const KEYWORDS =
    'break case continue default discard do else for if return switch while ' +
    'struct class interface namespace typedef ' +
    'cbuffer tbuffer technique technique10 technique11 pass ' +
    'in out inout uniform const static extern inline ' +
    'register packoffset ' +
    'linear centroid nointerpolation noperspective sample ' +
    'row_major column_major ' +
    'precise groupshared shared volatile ' +
    'export compile compile_fragment ' +
    // SDSL keywords
    'shader stage stream streams compose override clone base mixin';

  return {
    name: 'HLSL',
    case_insensitive: false,
    keywords: {
      keyword: KEYWORDS,
      type: TYPES,
      built_in: FUNCTIONS,
      literal: 'true false NULL'
    },
    contains: [
      hljs.C_LINE_COMMENT_MODE,
      hljs.C_BLOCK_COMMENT_MODE,

      // Preprocessor
      {
        className: 'meta',
        begin: '#\\s*[a-z]+\\b',
        end: '$',
        keywords: {
          keyword: 'define undef if ifdef ifndef else elif endif include pragma line error warning'
        },
        contains: [
          { begin: /\\\n/, relevance: 0 },
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.QUOTE_STRING_MODE,
          { className: 'string', begin: '<', end: '>', illegal: '\\n' }
        ]
      },

      hljs.QUOTE_STRING_MODE,
      NUMBER,

      // Semantic annotations - match ": SEMANTIC" specifically
      // Only matches uppercase semantic names after colon (not inheritance)
      {
        className: 'symbol',
        begin: ':\\s*(SV_\\w+|POSITION\\d*|NORMAL\\d*|TEXCOORD\\d*|COLOR\\d*|TANGENT\\d*|BINORMAL\\d*|BLENDWEIGHT\\d*|BLENDINDICES\\d*|PSIZE\\d*|TESSFACTOR\\d*|DEPTH\\d*|FOG|VFACE|VPOS|POSITIONT)\\b',
        relevance: 10
      },

      // Shader stage entry points (VSMain, PSMain, etc.)
      {
        className: 'title.function',
        begin: '\\b(VSMain|PSMain|GSMain|HSMain|DSMain|CSMain)\\b'
      }
    ]
  };
}
