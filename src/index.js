import impala from '@chrisrowles/impala'

document.addEventListener('DOMContentLoaded', () => {
    impala.multicode('#code-editor', '#lang-tabs', {
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
    }, {
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
    }).then((editor) => {
        editor.onDidChangeModelContent(() => {
            const model = editor.getModel()

            const language = model.getLanguageIdentifier().language
            const value = model.getValue()

            setTimeout(() => {
                execute(language, value)
            }, 2000)
        })
    }).catch((error) => {
        console.log(error.message)
    })
})

let js = '', html = '', css = ''
function execute(lang, content) {
    let executor = document.querySelector('#code-executor')
    css = '<style>body { background: #ffffff; }'
    if (lang === 'javascript') {
        js = '<script>' + content + '</script>'
    } else if(lang === 'css') {
        css += content + '</style>'
    } else if (lang === 'html') {
        html = content
    }

    executor = executor.contentWindow
        || executor.contentDocument.document
        || executor.contentDocument

    executor.document.open()
    executor.document.write(html + css + js)
    executor.document.close()
}