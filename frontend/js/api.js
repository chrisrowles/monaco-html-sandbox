import { exactly24HoursFromNow, generatedString } from './util'

const url = `${process.env.APP_URL}/api`
const api = {}

api.fetchCodes = async () => {
    const response = await fetch(`${url}/code`)

    if (!response.ok) {
        let message = 'An unexpected error has occurred.'
        if (response.status === 404 || response.status === 400) {
            const error = await response.json()
            if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                message = error.message
            } else {
                message = 'Invalid request.'
            }
        }
        throw new Error(message)
    }

    return response.json()
}

api.fetchCode = async (id) => {
    const response = await fetch(`${url}/code/${id}`)

    if (!response.ok) {
        let message = 'An unexpected error has occurred.'
        if (response.status === 404 || response.status === 400) {
            const error = await response.json()
            if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                message = error.message
            } else {
                message = 'Invalid request.'
            }
        }
        throw new Error(message)
    }

    return response.json()
}

api.saveCode = async ({ language, content }) => {
    const name = generatedString
    const link = `${process.env.APP_URL}/${name}`
    const expiresAt = exactly24HoursFromNow

    const response = await fetch(`${url}/code`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name,
            language,
            content,
            link,
            expiresAt
        })
    })

    if (!response.ok) {
        let message = 'An unexpected error has occurred.'
        if (response.status === 400) {
            const error = await response.json()
            if (Object.prototype.hasOwnProperty.call(error, 'message')) {
                message = error.message
            } else {
                message = 'Invalid request.'
            }
        }
        throw new Error(message)
    }

    return response.json()
}

export default api