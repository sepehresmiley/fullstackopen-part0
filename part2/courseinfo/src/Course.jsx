function Header({ name }) {
  return <h2>{name}</h2>
}

function Part({ part }) {
  return <li><span>{part.name}</span><strong>{part.exercises}</strong></li>
}

function Content({ parts }) {
  return (
    <>
      <ul className="parts">
        {parts.map((part) => <Part key={part.id} part={part} />)}
      </ul>
      <p className="total">Total <strong>{parts.reduce((sum, part) => sum + part.exercises, 0)}</strong> exercises</p>
    </>
  )
}

export default function Course({ course }) {
  return (
    <section className="course-card">
      <Header name={course.name} />
      <Content parts={course.parts} />
    </section>
  )
}
