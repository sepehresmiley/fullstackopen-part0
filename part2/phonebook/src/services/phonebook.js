const baseUrl = 'http://localhost:3001/persons'

async function request(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    const error = new Error(body.error || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }
  return response.status === 204 ? null : response.json()
}

const getAll = () => request(baseUrl)
const create = (person) => request(baseUrl, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(person),
})
const update = (id, person) => request(`${baseUrl}/${id}`, {
  method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(person),
})
const remove = (id) => request(`${baseUrl}/${id}`, { method: 'DELETE' })

export default { getAll, create, update, remove }
