import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faClipboard, faCode, faCog, faExpandArrowsAlt, faLink, faShare } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { editorConfig, modelDefinitions } from './config'
import impala from '@chrisrowles/impala'
import Split from 'split.js'
import Alpine from 'alpinejs'
import notify from './notify'
import api from './api'

library.add(faBars, faClipboard, faCode, faCog, faExpandArrowsAlt, faGithub, faLink, faShare)
dom.watch()

const tabArea = '#lang-tabs'
const saveButton = '#save-code'
const codeEditor = '#code-editor'
const codeExecutor = '#code-executor'
const codeExecutorTimeout = 2000

document.addEventListener('DOMContentLoaded', () => {
    impala.multicode(codeEditor, tabArea, editorConfig, modelDefinitions)
        .then((editor) => {
            Split([
                `${codeEditor}-container`,
                `${codeExecutor}-container`
            ], {
                direction: 'vertical'
            })

            addOnChangeEventListener(editor)
            addOnSaveEventListener(editor)
            fetchExistingCodeFromLink(editor)

            window.$api = api
            window.$editor = editor
            window.$notify = notify

            Alpine.start()
        }).catch(async (error) => {
            await notify.send('error', error.message)
        })
})

function fetchExistingCodeFromLink(editor) {
    const link = document.querySelector('#linked')
    if (link && link.innerText !== '') {
        api.fetchCode(link.innerText)
            .then((response) => {
                if (response.content) {
                    editor.setValue(response.content)
                }
            })
            .catch(async (error) => {
                await notify.send('error', error.message)
            })
    }
}

function addOnChangeEventListener(editor) {
    editor.onDidChangeModelContent(() => {
        const model = editor.getModel()
        const language = model.getLanguageIdentifier().language
        const content = model.getValue()


        setTimeout(() => {
            execute(language, content)
                .catch(async (error) => {
                    await notify.send('error', error.message)
                })
        }, codeExecutorTimeout)
    })
}

function addOnSaveEventListener(editor) {
    const save = document.querySelector(saveButton)
    if (save) {
        save.addEventListener('click', (event) => {
            event.preventDefault()

            api.saveCode({
                language: editor.getModel().getLanguageIdentifier().language,
                content: editor.getValue()
            }).then((response) => {
                toggleShareableLinkModal('#shareable', response.link)
            }).catch(async (error) => {
                await notify.send('error', error.message)
            })
        })
    }
}

function toggleShareableLinkModal(id, link) {
    const shareable = document.querySelector(`#shareable-link`)
    if (link) {
        shareable.value = link
    }

    const modal = document.querySelector(id)
    const backdrop = document.querySelector('.backdrop')
    if (modal) {
        if (!modal.classList.contains('show')) {
            if (backdrop) {
                backdrop.classList.add('show')
            }

            const buttons = modal.querySelectorAll('button')
            buttons.forEach((button) => {
                if (Object.prototype.hasOwnProperty.call(button.dataset, 'dismiss')) {
                    button.addEventListener('click', () => {
                        modal.style.display = 'none'
                        modal.classList.remove('show')
                        if (backdrop) {
                            backdrop.classList.remove('show')
                        }
                    })
                }
            })

            modal.style.display = 'block'
            modal.classList.add('show')
        } else {
            if (backdrop) {
                backdrop.classList.remove('show')
            }

            modal.style.display = 'none'
            modal.classList.remove('show')
        }
    }
}

let js = '', html = '', css = ''
async function execute(lang, content) {
    let executor = document.querySelector(codeExecutor)
    css = '<style>body { background: #ffffff; }'
    if (lang === 'javascript') {
        js = '<script>' + content + '</script>'
    } else if(lang === 'css') {
        css += content + '</style>'
    } else if (lang === 'html') {
        html = content
    } else {
        throw new Error('Invalid submission detected.')
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