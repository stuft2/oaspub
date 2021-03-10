import {Controllers} from './controller'
import {Account} from '../db/models'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {Session} from '../db/models/session'

const controllers: Controllers = function ({server}, db) {
  const session = new Session(server.privateKey)
  return {
    async create (req, res) {
      const {username, email, password} = req.body
      const account = await Account.fetch(db, username ? {username} :{email}, null)
      if (!account || !account.verify(password)) {
        return res.status(HttpStatus.UNAUTHORIZED).send(generateMetadataResponseObj(HttpStatus.UNAUTHORIZED, 'Invalid username or password'))
      }
      await Account.activate(db, account.data.username)
      res.setHeader('location', `${server.host}/accounts/${account.data.username}`)
      return res.status(HttpStatus.CREATED).send({
        ...generateMetadataResponseObj(HttpStatus.CREATED, 'Authenticated'),
        ...session.sign(account.claims())
      })
    }
  }
}
export = controllers
