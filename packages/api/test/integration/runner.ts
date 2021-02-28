import * as newman from 'newman'
import * as glob from 'glob'
import {NewmanRunOptions, NewmanRunSummary} from 'newman'

function newmanRunAsync (options: NewmanRunOptions): Promise<NewmanRunSummary> {
  return new Promise((resolve, reject) => {
    newman.run(options, (err, summary) => {
      if (err) reject(err)
      resolve(summary)
    })
  })
}

const pattern = 'test/integration/**/*collection.json'

;(async () => {
  const files = glob.sync(pattern)
  let failed = false

  // Run collections in glob
  for (const file of files) {
    try {
      const summary = await newmanRunAsync({
        collection: file,
        environment: file.replace('collection.json', 'environment.json'),
        reporters: ['cli'] // CLI output
      })
      if (summary.run.failures) failed = true
    } catch (e) {
      console.error(`Error during collection "${file}"`)
      console.error(e.stack)
      process.exit(1)
    }
  }
  // Exit unsuccessfully for failed run
  if (failed) {
    console.error('One or more collections finished with errors')
    process.exit(1)
  }

  // Collection completed successfully
  console.log('Collection completed successfully')
  process.exit(0)
})()
