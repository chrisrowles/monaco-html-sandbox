import './icons'
import { editorConfig, modelDefinitions } from './config'
import impala from '@chrisrowles/impala'
import Split from 'split.js'
import Alpine from 'alpinejs'
import notify from './notify'
import api from './api'

const tabArea = '#lang-tabs'
const saveButton = '#save-code'
const codeEditor = '#code-editor'
const codeExecutor = '#code-executor'
const codeExecutorTimeout = 2000

const isLinked = document.querySelector('#linked')
const shareableBackdrop = document.querySelector('.backdrop')
const shareableModal = document.querySelector('#shareable')
const shareableLink = document.querySelector(`#shareable-link`)
const shareableCopy = document.querySelector(`#copy-button`)

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
            addEditorOnChangeThemeEventListener()
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

function addEditorOnChangeThemeEventListener() {
    const toggler = document.querySelector('#toggle-theme')
    if (toggler) {
        toggler.addEventListener('click', (event) => {
            let target = event.target
            if (target.nodeName === 'svg') {
                target = target.parentElement
            } else if (target.nodeName === 'path') {
                target = target.parentElement.parentElement
            }

            if (Object.prototype.hasOwnProperty.call(target.dataset, 'theme')) {
                let theme = (target.dataset.theme === 'vs') ? 'vs-dark' : 'vs'
                impala.root.setTheme(theme)
                target.dataset.theme = theme
                const body = document.querySelector('body')
                if (Object.prototype.hasOwnProperty.call(body.dataset, 'theme')) {
                    body.dataset.theme = theme
                }
            }
        })
    }
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
                    displayShareableLink(shareableModal, response.link)
                }).catch(async (error) => {
                    await notify.send('error', error.message)
                })
        })
    }
}

function setEditorModelsFromExistingLink() {
    if (isLinked && isLinked.innerText !== '') {
        api.fetchCode(isLinked.innerText)
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

function displayShareableLink(id, link) {
    shareableLink.value = link
    if (shareableModal) {
        if (!shareableModal.classList.contains('show')) {
            if (shareableBackdrop) {
                shareableBackdrop.classList.add('show')
            }

            const buttons = shareableModal.querySelectorAll('button')
            buttons.forEach((button) => {
                if (Object.prototype.hasOwnProperty.call(button.dataset, 'dismiss')) {
                    button.addEventListener('click', () => {
                        shareableModal.style.display = 'none'
                        shareableModal.classList.remove('show')
                        if (shareableBackdrop) {
                            shareableBackdrop.classList.remove('show')
                        }
                    })
                }
            })

            shareableCopy.addEventListener('click', () => {
                copyShareableLinkToClipboard()
            })

            shareableModal.style.display = 'block'
            shareableModal.classList.add('show')
        } else {
            if (shareableBackdrop) {
                shareableBackdrop.classList.remove('show')
            }

            shareableModal.style.display = 'none'
            shareableModal.classList.remove('show')
        }
    }
}

function copyShareableLinkToClipboard() {
    if (shareableLink && shareableLink.value !== '') {
        shareableLink.focus()
        shareableLink.select()

        document.execCommand('copy')
        const svg = document.querySelector('svg#copy-icon')
        svg.dataset.icon = 'check'
        svg.style.color = '#008000'
        setTimeout(() => {
            const svg = document.querySelector('svg#copy-icon')
            svg.dataset.icon = 'clipboard'
            svg.style.color = '#EEEEEE'
        }, 1500)
    }
}

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
    executor.document.body.innerHTML = `${content.html}`
    executor.document.body.innerHTML += `<script>${content.javascript}<\/script>`
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