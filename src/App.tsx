const plannedCapabilities = [
  'Broker performance dashboard',
  'Broker settings management',
  'Market comparison tables',
  'Recharts performance visualization',
]

function App() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '3rem', lineHeight: 1.5 }}>
      <section style={{ maxWidth: '48rem' }}>
        <p style={{ margin: 0, color: '#2563eb', fontWeight: 700 }}>PerformanceAxis</p>
        <h1 style={{ marginTop: '0.5rem' }}>XFL broker performance analytics</h1>
        <p>
          PerformanceAxis is a React and TypeScript single page application for comparing XFL broker
          activity against DSE market trading statistics.
        </p>
        <h2>Foundation ready</h2>
        <ul>
          {plannedCapabilities.map((capability) => (
            <li key={capability}>{capability}</li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
