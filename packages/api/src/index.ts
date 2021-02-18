import path from 'path'
import express, {Express, Request, Response} from 'express'
import debug from 'debug'
import Enforcer from 'openapi-enforcer-middleware'
import * as env from './util/env'
import * as db from './db/connection'
import {EnforcerError} from './middleware/openapi-error'
import {Logger} from './middleware/logger'

const logger = debug('api:server')

export default async function server(): Promise<Express> {
    // Connect to and initialize database
    const database = await db.initialize()

    // Create Express server instance
    const app = express()

    // Server health check
    app.get('/xhealth', (req: Request, res: Response) => res.status(200).send('The force is strong with this one.'))

    // Parse JSON request bodies
    app.use(express.json())

    // Log all requests to the server
    app.use(Logger)

    // Set up server paths using api definition document
    const controllerDir = path.resolve(__dirname, 'controllers')
    const oasPath = path.resolve(__dirname, 'openapi.json')

    const enforcer = new Enforcer(oasPath, {
      componentOptions: {
        exceptionSkipCodes: [
          'WSCH001', // Ignore non standard format "email" used for type "string" (#/.../account)
          'WSCH005' // Ignore schemas with an indeterminable type (#/.../document, #/.../document_info)
        ]
      }
    })
    await enforcer.promise // Wait for enforcer to resolve OAS doc

    // Set up controllers, use dependency injection to pass through database connection
    await enforcer.controllers(controllerDir, database)

    // Plugin enforcer middleware to Express
    app.use(enforcer.middleware())

    // Enforcer error handling middleware
    app.use(EnforcerError)

    return app
}

// Start standalone server if directly running
if (require.main === module) {
  (async () => {
    try {
      const config = env.get()
      const app = await server()
      // Start server
      app.listen(config.server.port, () => {
        logger(`Server started on port ${config.server.port}`)
      })
    } catch (e) {
      logger('Error starting server:', e)
      process.exit(1)
    }
  })()
}
