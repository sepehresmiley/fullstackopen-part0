import { useEffect, useMemo, useRef, useState } from 'react'
import phonebookService from './services/phonebook'
import Notification from './components/Notification'
import './index.css'

function PersonForm({ name, number, onName, onNumber, onSubmit }) {
  return (
    <form className="person-form" onSubmit={onSubmit}>
      <label>Name<input value={name} onChange={(event) => onName(event.target.value)} autoComplete="name" required /></label>
      <label>Phone number<input value={number} onChange={(event) => onNumber(event.target.value)} type="tel" autoComplete="tel" required /></label>
      <button className="primary-button" type="submit">Save contact <span aria-hidden="true">↗</span></button>
    </form>
  )
}

function PersonList({ persons, onDelete }) {
  if (!persons.length) return <p className="empty-state">No contacts match this search.</p>
  return (
    <ul className="people-list">
      {persons.map((person) => (
        <li className="person-row" key={person.id}>
          <div className="avatar" aria-hidden="true">{person.name.slice(0, 1).toUpperCase()}</div>
          <div className="person-info"><strong>{person.name}</strong><a href={`tel:${person.number}`}>{person.number}</a></div>
          <button className="delete-button" type="button" onClick={() => onDelete(person)} aria-label={`Delete ${person.name}`}>Delete</button>
        </li>
      ))}
    </ul>
  )
}

export default function App() {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState(null)
  const [loading, setLoading] = useState(true)
  const noticeTimer = useRef(null)

  const notify = (message, type = 'success') => {
    setNotice({ message, type })
    window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000)
  }

  useEffect(() => () => window.clearTimeout(noticeTimer.current), [])

  useEffect(() => {
    phonebookService.getAll()
      .then(setPersons)
      .catch(() => notify('Could not connect to the phonebook server.', 'error'))
      .finally(() => setLoading(false))
  }, [])

  const visiblePeople = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return persons.filter((person) => person.name.toLocaleLowerCase().includes(query))
  }, [persons, search])

  const addPerson = async (event) => {
    event.preventDefault()
    const name = newName.trim()
    const number = newNumber.trim()
    if (!name || !number) return

    const existing = persons.find((person) => person.name.toLocaleLowerCase() === name.toLocaleLowerCase())
    let saved = false
    if (existing) {
      if (!window.confirm(`${existing.name} is already in the phonebook. Replace their number?`)) return
      try {
        const updated = await phonebookService.update(existing.id, { ...existing, number })
        setPersons((current) => current.map((person) => person.id === existing.id ? updated : person))
        notify(`Updated ${existing.name}'s number.`)
        saved = true
      } catch (error) {
        if (error.status === 404) {
          setPersons((current) => current.filter((person) => person.id !== existing.id))
          notify(`${existing.name} was removed from the server.`, 'error')
        } else {
          notify(`Could not update ${existing.name}. Please try again.`, 'error')
        }
      }
    } else {
      try {
        const created = await phonebookService.create({ name, number })
        setPersons((current) => [...current, created])
        notify(`Added ${name} to the phonebook.`)
        saved = true
      } catch {
        notify('Could not add this contact. Please try again.', 'error')
      }
    }
    if (saved) {
      setNewName('')
      setNewNumber('')
    }
  }

  const deletePerson = async (person) => {
    if (!window.confirm(`Delete ${person.name} from the phonebook?`)) return
    try {
      await phonebookService.remove(person.id)
      setPersons((current) => current.filter((entry) => entry.id !== person.id))
      notify(`Removed ${person.name}.`)
    } catch (error) {
      if (error.status === 404) {
        setPersons((current) => current.filter((entry) => entry.id !== person.id))
        notify(`${person.name} was already removed from the server.`, 'error')
      } else {
        notify(`Could not delete ${person.name}. Please try again.`, 'error')
      }
    }
  }

  return (
    <main className="shell">
      <header className="topbar"><a className="wordmark" href="#top"><span className="brand-mark">P</span> peoplebook</a><span className="top-label">PART 2 · EXERCISES 2.6–2.17</span></header>
      <div className="layout" id="top">
        <section className="hero-panel">
          <p className="eyebrow">YOUR PEOPLE, IN ONE PLACE</p>
          <h1>A thoughtful little<br />phonebook.</h1>
          <p className="hero-copy">A simple, searchable directory for the people you want to stay connected with.</p>
          <div className="stat"><strong>{persons.length.toString().padStart(2, '0')}</strong><span>contacts saved</span></div>
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
        </section>
        <section className="content-panel">
          <Notification notice={notice} />
          <section className="form-section">
            <p className="section-kicker">01 / ADD SOMEONE</p><h2>New contact</h2>
            <PersonForm name={newName} number={newNumber} onName={setNewName} onNumber={setNewNumber} onSubmit={addPerson} />
          </section>
          <section className="directory-section">
            <div className="directory-heading"><div><p className="section-kicker">02 / YOUR DIRECTORY</p><h2>Contacts <span>{persons.length}</span></h2></div>
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a person" aria-label="Search contacts" /></label>
            </div>
            {loading ? <p className="empty-state">Loading your contacts…</p> : <PersonList persons={visiblePeople} onDelete={deletePerson} />}
          </section>
          <footer className="footer-note">Changes are saved to your local course server.</footer>
        </section>
      </div>
    </main>
  )
}
