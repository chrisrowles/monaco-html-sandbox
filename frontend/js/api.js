const url = "http://localhost:8080/api"
const api = {}

api.fetchCodes = async () => {
    const response = await fetch(`${url}/code`)
    return response.json()
}

api.fetchCode = async (id) => {
    console.log(id)
    const response = await fetch(`${url}/code/${id}`)
    return response.json()
}

api.createCode = async ({ language, content }) => {
    try {
        const name = (Math.random() + 1).toString(36).substring(2)
        const link = `http://localhost:8080/${name}`
        const expiresAt = new Date(new Date().getTime() + (24 * 60 * 60 * 1000))
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ')
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

        return response.json()
    } catch(err) {
        return err
    }
}

export default api