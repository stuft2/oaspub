import {MongoError} from 'mongodb'
import {Controllers} from './controller'
import {Account} from '../db/models'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {SelfService} from "../middleware/authorization"

const DuplicateKeyErrorCode = 11000 // Mongo Duplicate Key Error Code

const controllers: Controllers = function (env, db) {
  const ss = new SelfService(env, db)
  return {
    async create (req, res) {
      try {
        const account = await Account.create(db, req.body)
        res.setHeader('location', `${env.server.host}/accounts/${account.data.username}`) // TODO - Ensure that username doesn't have special characters
        return res.status(HttpStatus.CREATED).send({
          ...account.info(),
          ...generateMetadataResponseObj(HttpStatus.CREATED)
        })
      } catch (err) {
        if (err instanceof MongoError && err.code === DuplicateKeyErrorCode) {
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        throw err
      }
    },
    async retrieve (req, res, next) {
      await ss.middleware(ss.account)(req, res, next)
      if (res.writableEnded) return
      const {username} = req.params
      const account = await Account.fetch(db, {username})
      if (!account) return res.status(HttpStatus.NOT_FOUND).send(generateMetadataResponseObj(HttpStatus.NOT_FOUND))
      return res.send({
        ...account.info(),
        ...generateMetadataResponseObj(HttpStatus.SUCCESS)
      })
    },
    async update (req, res, next) {
      await ss.middleware(ss.account)(req, res, next)
      if (res.writableEnded) return
      try {
        const {username} = req.params
        const account = await Account.update(db, username, req.body)
        if (!account) return res.status(HttpStatus.NOT_FOUND).send(generateMetadataResponseObj(HttpStatus.NOT_FOUND))
        return res.send({
          ...account.info(),
          ...generateMetadataResponseObj(HttpStatus.SUCCESS)
        })
      } catch (err) {
        if (err instanceof MongoError && err.code === DuplicateKeyErrorCode) { // Duplicate Key Error
          return res.status(HttpStatus.CONFLICT).send(generateMetadataResponseObj(HttpStatus.CONFLICT, 'An account with that username or email already exists'))
        }
        throw err
      }
    },
    async deactivate (req, res, next) {
      await ss.middleware(ss.account)(req, res, next)
      if (res.writableEnded) return
      const {username} = req.params
      await Account.deactivate(db, username)
      return res.status(HttpStatus.NO_CONTENT).send()
    }
  }
}

export = controllers
