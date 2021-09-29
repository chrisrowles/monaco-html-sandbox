export const editorConfig = {
    accessibilityPageSize: 1000,
    automaticLayout: true,
    fastScrollSensitivity: 5,
    fontLigatures: true,
    formatOnPaste: true,
    formatOnType: true,
    inlineSuggest: {
        enabled: true,
        mode: 'prefix'
    },
    largeFileOptimizations: true,
    renderLineHighlight: 'gutter',
    roundedSelection: false,
    smoothScrolling: true,
    showFoldingControls: 'always',
    theme: 'vs-dark',
    useShadowDOM: true
}

export const modelDefinitions = {
    html: {
        model: null,
        state: null
    },
    css: {
        model: null,
        state: null
    },
    javascript: {
        model: null,
        state: null
    },
}

export const modelMappings = {
    html: '$model1',
    css: '$model2',
    javascript: `$model3`
}