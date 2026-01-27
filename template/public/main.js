import hlsl from './hlsl.js'

export default {
  configureHljs: (hljs) => {
    // Register HLSL language
    hljs.registerLanguage('hlsl', hlsl);
    // Also register as 'sdsl' alias for convenience
    hljs.registerLanguage('sdsl', hlsl);
  }
}
