const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const PORT = 3001
const database = path.join(__dirname, 'db.json')
const initial = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' },
]

if (!fs.existsSync(database)) fs.writeFileSync(database, JSON.stringify({ persons: initial }, null, 2))
const readPeople = () => JSON.parse(fs.readFileSync(database, 'utf8')).persons
const writePeople = (persons) => fs.writeFileSync(database, JSON.stringify({ persons }, null, 2))
const send = (response, status, data) => {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' })
  response.end(data === undefined ? '' : JSON.stringify(data))
}
const readBody = (request) => new Promise((resolve, reject) => {
  let raw = ''
  request.on('data', (chunk) => { raw += chunk })
  request.on('end', () => { try { resolve(JSON.parse(raw || '{}')) } catch (error) { reject(error) } })
})

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') return send(response, 204)
  const url = new URL(request.url, `http://${request.headers.host}`)
  const id = decodeURIComponent(url.pathname.split('/').at(-1))
  try {
    if (url.pathname === '/persons' && request.method === 'GET') return send(response, 200, readPeople())
    if (url.pathname === '/persons' && request.method === 'POST') {
      const body = await readBody(request)
      if (!body.name?.trim() || !body.number?.trim()) return send(response, 400, { error: 'Name and number are required.' })
      const persons = readPeople()
      if (persons.some((person) => person.name.toLocaleLowerCase() === body.name.trim().toLocaleLowerCase())) return send(response, 400, { error: 'Name already exists.' })
      const created = { id: String(Date.now()), name: body.name.trim(), number: body.number.trim() }
      persons.push(created); writePeople(persons)
      return send(response, 201, created)
    }
    if (url.pathname.startsWith('/persons/') && request.method === 'PUT') {
      const persons = readPeople()
      const index = persons.findIndex((person) => person.id === id)
      if (index < 0) return send(response, 404, { error: 'Contact not found.' })
      const body = await readBody(request)
      if (!body.name?.trim() || !body.number?.trim()) return send(response, 400, { error: 'Name and number are required.' })
      persons[index] = { ...persons[index], name: body.name.trim(), number: body.number.trim() }
      writePeople(persons)
      return send(response, 200, persons[index])
    }
    if (url.pathname.startsWith('/persons/') && request.method === 'DELETE') {
      const persons = readPeople()
      const remaining = persons.filter((person) => person.id !== id)
      if (remaining.length === persons.length) return send(response, 404, { error: 'Contact not found.' })
      writePeople(remaining)
      return send(response, 204)
    }
    return send(response, 404, { error: 'Route not found.' })
  } catch {
    return send(response, 400, { error: 'Request body must be valid JSON.' })
  }
})

server.listen(PORT, '127.0.0.1', () => console.log(`Phonebook API listening at http://localhost:${PORT}/persons`))
