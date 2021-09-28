import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faClipboard, faCode, faCog, faShare } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { editorConfig, modelDefinitions } from './config'
import impala from '@godeploy/impala'
import Split from 'split.js'
import notify from './notify'
import api from './api'

library.add(faClipboard, faCode, faCog, faGithub, faShare)
dom.watch()

const tabArea = '#lang-tabs'
const saveButton = '#save-code'
const codeEditor = '#code-editor'
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
            window.$editor = editor
            window.$notify = notify

            addOnDidChangeEventListener(editor)
            addOnSaveEventListener(editor)
        }).catch(async (error) => {
            await notify.send('error', error.message)
        })
})

function addOnDidChangeEventListener(editor) {
    editor.onDidChangeModelContent(() => {
        const model = editor.getModel()
        const language = model.getLanguageIdentifier().language
        const content = model.getValue()

        setTimeout(() => {
            execute(language, content)
        }, 2000)
    })
}

function addOnSaveEventListener() {
    const save = document.querySelector(saveButton)

    if (save) {
        save.addEventListener('click', (event) => {
            event.preventDefault()

            api.saveCode({
                language: $editor.getModel().getLanguageIdentifier().language,
                content: $editor.getValue()
            }).then((response) => {
                console.log(response)
            }).catch(async (error) => {
                console.log(error)
                await notify.send('error', 'Unable to save code.')
            })
        })
    }
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