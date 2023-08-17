import { Fragment, Profiler } from 'react'
import Layout from './Layout/Layout'
import { Interaction } from 'scheduler/tracing'

function App() {
  return (
    <Fragment>
      <Profiler id={'Layout'} onRender={
        (id: string, phase: 'mount' | 'update' | 'nested-update', actualDuration: number, baseDuration: number, startTime: number, commitTime: number, interactions: Set<Interaction>): void => {
          if (phase === "mount") {
            console.log(`${id} rendering:\n`)
            console.log(`Base duration: ${baseDuration}`)
            console.log(`Commit time: ${commitTime}`)
            console.log(`Number of interactions: ${interactions ? interactions.size : 0}`)
            return
          }
          console.log(`${id} updating:\n`)
          console.log(`Actual duration: ${actualDuration}`)
          console.log(`Start time: ${startTime}`)
          console.log(`Number of interactions: ${interactions ? interactions.size : 0}`)
        }
      }>
          <Layout />
      </Profiler>
    </Fragment>
  )
}

export default App
