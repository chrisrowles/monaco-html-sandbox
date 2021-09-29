import { dom, library } from '@fortawesome/fontawesome-svg-core'
import { faBars, faCheck, faClipboard, faCode, faExpandArrowsAlt, faLink, faShare, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { editorConfig, modelDefinitions } from './config'
import impala from '@chrisrowles/impala'
import Split from 'split.js'
import Alpine from 'alpinejs'
import notify from './notify'
import api from './api'

library.add(faBars, faCheck, faClipboard, faCode, faExpandArrowsAlt, faGithub, faLink, faShare, faTimes)
dom.watch()

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
                    toggleShareableLinkModal(shareableModal, response.link)
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

function toggleShareableLinkModal(id, link) {
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