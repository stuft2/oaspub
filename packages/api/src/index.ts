import path from 'path'
import express, {Request, Response} from 'express'
import debug from 'debug'
import Enforcer from 'openapi-enforcer-middleware'
import {EnforcerError} from './middleware/openapi-error'

const logger = debug('api:server')

;(async (): Promise<void> => {
  try {
    const app = express()

    const controllerDir = path.resolve(__dirname, 'controllers')
    const oasPath = path.resolve(__dirname, 'openapi.yaml')

    app.get('/xhealth', (req: Request, res: Response) => res.status(200).send('The force is strong with this one.'))

    app.use(express.json())

    app.use((req, res, next) => {
      const now = new Date()
      logger(`${req.method} called on ${req.originalUrl} at ${now.toLocaleTimeString('en-US', { timeZone: 'America/Denver', timeZoneName: 'short', weekday: 'short', month: 'short', day: 'numeric' })} (${now.toISOString()})`)
      logger('Query:', req.query)
      logger('Body:', JSON.stringify(req.body))
      next()
    })

    // Wait for enforcer to resolve OAS doc
    const enforcer = new Enforcer(oasPath)
    await enforcer.promise

    // Init controllers
    await enforcer.controllers(controllerDir)

    // Plugin enforcer middleware to Express
    app.use(enforcer.middleware())

    // Enforcer error handling middleware
    app.use(EnforcerError)

    // Start server
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000
    app.listen(port, () => {
      logger(`Server started on port ${port}`)
    })
  } catch (e) {
    logger('Error starting server:', e)
    process.exit(1)
  }
})()
