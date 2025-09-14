import './App.css'
import FindMedian from './components/FindMedian.jsx'

function App() {
  return (
    <>
      <main className="container stack" style={{"--gap":"24px"}}>
        <section className="grid" style={{"--gap":"24px"}}>
          <div className="card shadow">
            <h2 className="mb-3">Median Value Finder</h2>
            <p className="muted mb-4">Upload a .txt file</p>
            <FindMedian />
          </div>
        </section>
      </main>
    </>
  )
}

export default App
