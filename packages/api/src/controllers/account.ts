import {Request, Response} from 'express'
import {Db, MongoError} from 'mongodb'
import {Account} from '../db/models'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import * as env from '../util/env'

const {server} = env.get()

export = function (db: Db): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async create (req: Request, res: Response) {
      try {
        const account = await Account.create(db, req.body)
        res.setHeader('location', `${server.host}/accounts/${account.data.username}`)
        return res.status(HttpStatus.CREATED).send({
          ...account.readable(),
          ...generateMetadataResponseObj(HttpStatus.CREATED)
        })
      } catch (err) {
        if (err instanceof MongoError && err.code === 11000) { // Duplicate Key Error
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        throw err
      }
    },
    async retrieve (req: Request, res: Response) {
      const {username} = req.params
      const account = await Account.fetch(db, {username})
      if (!account) return res.status(HttpStatus.NOT_FOUND).send(generateMetadataResponseObj(HttpStatus.NOT_FOUND))
      return res.send({
        ...account.readable(),
        ...generateMetadataResponseObj(HttpStatus.SUCCESS)
      })
    },
    async update (req: Request, res: Response) {
      try {
        const {username} = req.params
        const account = await Account.update(db, username, req.body)
        if (!account) return res.status(HttpStatus.NOT_FOUND).send(generateMetadataResponseObj(HttpStatus.NOT_FOUND))
        return res.send({
          ...account.readable(),
          ...generateMetadataResponseObj(HttpStatus.SUCCESS)
        })
      } catch (err) {
        if (err instanceof MongoError && err.code === 11000) { // Duplicate Key Error
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        throw err
      }
    },
    async deactivate (req: Request, res: Response) {
      const {username} = req.params
      await Account.deactivate(db, username)
      return res.status(HttpStatus.NO_CONTENT).send()
    }
  }
}
