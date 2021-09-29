export const exactly24HoursFromNow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000))
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ')

export const generatedString = (Math.random() + 1).toString(36).substring(2)

export function mergeObject(a, b) {
    return {
        ...a, ...b
    }
}