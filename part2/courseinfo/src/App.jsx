import Course from './Course'
import './index.css'

const courses = [
  {
    id: 1,
    name: 'Half Stack application development',
    parts: [
      { id: 1, name: 'Fundamentals of React', exercises: 10 },
      { id: 2, name: 'Using props to pass data', exercises: 7 },
      { id: 3, name: 'State of a component', exercises: 14 },
      { id: 4, name: 'Redux', exercises: 11 },
    ],
  },
  {
    id: 2,
    name: 'Node.js',
    parts: [
      { id: 1, name: 'Routing', exercises: 3 },
      { id: 2, name: 'Middlewares', exercises: 7 },
    ],
  },
]

export default function App() {
  return (
    <main className="page">
      <p className="eyebrow">FULL STACK OPEN · PART 2</p>
      <h1>Course information</h1>
      <p className="intro">A data driven view of courses, parts, and exercise totals.</p>
      <div className="courses">
        {courses.map((course) => <Course key={course.id} course={course} />)}
      </div>
    </main>
  )
}
