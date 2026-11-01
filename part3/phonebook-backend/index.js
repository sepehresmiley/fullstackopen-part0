import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import morgan from 'morgan'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Person from './models/person.js'

const app = express()
const port = process.env.PORT || 3001
const directory = path.dirname(fileURLToPath(import.meta.url))

let memoryPeople = [
  { id: '1', name: 'Arto Hellas', number: '040-123456' },
  { id: '2', name: 'Ada Lovelace', number: '39-44-5323523' },
  { id: '3', name: 'Dan Abramov', number: '12-43-234345' },
  { id: '4', name: 'Mary Poppendieck', number: '39-23-6423122' },
]
const usesDatabase = Boolean(process.env.MONGODB_URI)

app.use(express.json())
morgan.token('body', (request) => request.body ? JSON.stringify(request.body) : '')
app.use(morgan(':method :url :status :response-time ms :body'))
app.use(express.static(path.join(directory, 'dist')))

async function allPeople() {
  return usesDatabase ? Person.find({}) : memoryPeople
}

app.get('/api/persons', async (_request, response, next) => {
  try {
    response.json(await allPeople())
  } catch (error) {
    next(error)
  }
})

app.get('/info', async (_request, response, next) => {
  try {
    const count = (await allPeople()).length
    response.type('html').send(`<main><h1>Phonebook</h1><p>There are ${count} entries in the phonebook.</p><p>${new Date().toString()}</p></main>`)
  } catch (error) {
    next(error)
  }
})

app.get('/api/persons/:id', async (request, response, next) => {
  try {
    const person = usesDatabase
      ? (mongoose.isValidObjectId(request.params.id) ? await Person.findById(request.params.id) : null)
      : memoryPeople.find((entry) => entry.id === request.params.id)
    if (!person) return response.status(404).json({ error: 'person not found' })
    response.json(person)
  } catch (error) {
    next(error)
  }
})

app.post('/api/persons', async (request, response, next) => {
  try {
    const name = request.body.name?.trim()
    const number = request.body.number?.trim()
    if (!name || !number) return response.status(400).json({ error: 'name and number are required' })

    const existing = usesDatabase
      ? await Person.findOne({ name: { $regex: `^${escapeRegExp(name)}$`, $options: 'i' } })
      : memoryPeople.find((person) => person.name.toLocaleLowerCase() === name.toLocaleLowerCase())
    if (existing) return response.status(400).json({ error: `${name} is already in the phonebook` })

    const created = usesDatabase
      ? await Person.create({ name, number })
      : { id: String(Date.now()), name, number }
    if (!usesDatabase) memoryPeople = [...memoryPeople, created]
    response.status(201).json(created)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/persons/:id', async (request, response, next) => {
  try {
    const removed = usesDatabase
      ? (mongoose.isValidObjectId(request.params.id) ? await Person.findByIdAndDelete(request.params.id) : null)
      : memoryPeople.find((person) => person.id === request.params.id)
    if (!removed) return response.status(404).json({ error: 'person not found' })
    if (!usesDatabase) memoryPeople = memoryPeople.filter((person) => person.id !== request.params.id)
    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

app.put('/api/persons/:id', async (request, response, next) => {
  try {
    const number = request.body.number?.trim()
    if (!number) return response.status(400).json({ error: 'number is required' })
    let updated
    if (usesDatabase) {
      if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ error: 'person not found' })
      updated = await Person.findByIdAndUpdate(request.params.id, { number }, { new: true, runValidators: true })
    } else {
      const existing = memoryPeople.find((person) => person.id === request.params.id)
      if (existing) {
        updated = { ...existing, number }
        memoryPeople = memoryPeople.map((person) => person.id === existing.id ? updated : person)
      }
    }
    if (!updated) return response.status(404).json({ error: 'person not found' })
    response.json(updated)
  } catch (error) {
    next(error)
  }
})

app.use((_request, response) => response.status(404).json({ error: 'unknown endpoint' }))

app.use((error, _request, response, next) => {
  console.error(error.message)
  if (error.name === 'ValidationError') return response.status(400).json({ error: error.message })
  if (error.name === 'CastError') return response.status(400).json({ error: 'malformatted id' })
  if (error.code === 11000) return response.status(409).json({ error: 'name already exists' })
  next(error)
})

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function start() {
  if (usesDatabase) {
    await mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    console.log('Connected to MongoDB')
  } else {
    console.log('Running with in-memory sample data. Set MONGODB_URI to enable MongoDB.')
  }
  app.listen(port, () => console.log(`Phonebook server listening on port ${port}`))
}

start().catch((error) => {
  console.error('Could not start the phonebook server:', error.message)
  process.exit(1)
})
