import 'dotenv/config'
import mongoose from 'mongoose'
import Person from './models/person.js'

const [name, number] = process.argv.slice(2)

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in your local .env file first. See .env.example.')
  process.exit(1)
}

try {
  await mongoose.connect(process.env.MONGODB_URI, { family: 4 })
  if (name && number) {
    await Person.create({ name, number })
    console.log(`added ${name} number ${number} to phonebook`)
  } else if (name || number) {
    console.error('Provide both a name and number, or neither to list entries.')
    process.exitCode = 1
  } else {
    const people = await Person.find({})
    console.log('phonebook:')
    people.forEach((person) => console.log(`${person.name} ${person.number}`))
  }
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  await mongoose.connection.close()
}
