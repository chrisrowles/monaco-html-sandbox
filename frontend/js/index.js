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

            addEditorOnChangeEventListener(editor)
            addEditorOnSaveEventListener()
            setEditorModelsFromExistingLink()

            Alpine.start()
        }).catch(async (error) => {
            await notify.send('error', error.message)
        })
})

function addEditorOnChangeEventListener(editor) {
    editor.onDidChangeModelContent(() => {
        setTimeout(() => {
            executeEditorModelsContent()
        }, codeExecutorTimeout)
    })
}

function addEditorOnSaveEventListener() {
    const save = document.querySelector(saveButton)
    if (save) {
        save.addEventListener('click', (event) => {
            event.preventDefault()

            const content = {css: '', html: '', javascript: ''}
            const models = impala.root.getModels()
            models.forEach((model) => {
                const lang = model.getLanguageIdentifier().language
                content[lang] = model.getValue()
            })

            api.saveCode({ content })
                .then((response) => {
                    toggleShareableLinkModal('#shareable', response.link)
                }).catch(async (error) => {
                    await notify.send('error', error.message)
                })
        })
    }
}

function setEditorModelsFromExistingLink() {
    const link = document.querySelector('#linked')
    if (link && link.innerText !== '') {
        api.fetchCode(link.innerText)
            .then((response) => {
                if (response.content) {
                    for (const [key, value] of Object.entries(response.content)) {
                        const models = impala.root.getModels()
                        models.forEach((model) => {
                            const lang = model.getLanguageIdentifier().language
                            if (key === lang) {
                                model.setValue(value)
                            }
                        })
                    }
                }
            })
            .catch(async (error) => {
                await notify.send('error', error.message)
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

// TODO bug, sometimes script goes inside the style tag.
function executeEditorModelsContent() {
    const content = {css: 'body { background: #ffffff; }', html: '', javascript: ''}
    const models = impala.root.getModels()
    models.forEach((model) => {
        const lang = model.getLanguageIdentifier().language
        if (lang !== 'css') {
            content[lang] = model.getValue()
        } else {
            content[lang] += model.getValue()
        }
    })

    let executor = document.querySelector(codeExecutor)
    executor = executor.contentWindow
        || executor.contentDocument.document
        || executor.contentDocument

    executor.document.head.innerHTML = `<style>${content.css}</style>`
    executor.document.body.innerHTML = `${content.html}<script type="text/javascript" defer>${content.javascript}</script>`
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