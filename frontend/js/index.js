import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faClipboard, faCode, faCog } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { editorConfig, modelDefinitions } from './config'
import impala from '@godeploy/impala'
import Split from 'split.js'
import notify from './notify'
import api from './api'
import 'alpinejs'

library.add(faClipboard, faCode, faCog, faGithub)
dom.watch()

const codeEditor = '#code-editor'
const tabArea = '#lang-tabs'
const codeExecutor = '#code-executor'

document.addEventListener('DOMContentLoaded', () => {
    impala.multicode(codeEditor, tabArea, editorConfig, modelDefinitions)
        .then((editor) => {
            Split([
                `${codeEditor}-container`,
                `${codeExecutor}-container`
            ], {
                direction: 'vertical'
            })

            window.$api = api
            window.$notify = notify

            addOnDidChangeEventListener(editor)
        }).catch(async (error) => {
            await notify.send('error', error.message)
        })
})

function addOnDidChangeEventListener(editor) {
    editor.onDidChangeModelContent(() => {
        const model = editor.getModel()
        const language = model.getLanguageIdentifier().language
        const value = model.getValue()

        setTimeout(() => {
            execute(language, value)
        }, 2000)
    })
}

let js = '', html = '', css = ''
function execute(lang, content) {
    let executor = document.querySelector(codeExecutor)
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

self.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
        if (label === 'json') {
            return 'assets/json.worker.js'
        }

        if (label === 'css') {
            return 'assets/css.worker.js'
        }

        if (label === 'html') {
            return 'assets/html.worker.js'
        }

        return 'assets/editor.worker.js'
    }
};