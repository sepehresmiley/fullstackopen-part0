import mongoose from 'mongoose'

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    trim: true,
  },
  number: {
    type: String,
    required: true,
    minlength: 8,
    validate: {
      validator: (value) => /^\d{2,3}-\d+$/.test(value),
      message: (props) => `${props.value} must be in the format 09-1234567 or 040-12345678`,
    },
  },
})

personSchema.set('toJSON', {
  transform: (_document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

export default mongoose.model('Person', personSchema)
