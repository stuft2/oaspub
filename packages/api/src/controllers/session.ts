import {Controllers} from './controller'
import {Account} from '../db/models'
import {generateMetadataResponseObj, HttpStatus} from '../util/uapi'
import {Session} from '../db/models/session'

const controllers: Controllers = function ({server}, db) {
  const session = new Session(server.privateKey)
  return {
    async create (req, res) {
      const {username, email, password} = req.body
      const account = await Account.fetch(db, username ? username : email)
      if (!account || !account.verify(password)) {
        return res.status(HttpStatus.FORBIDDEN).send(generateMetadataResponseObj(HttpStatus.FORBIDDEN, 'Invalid username or password'))
      }
      return res.send({
        ...generateMetadataResponseObj(HttpStatus.CREATED, 'Authenticated'),
        ...session.sign(account.claims())
      })
    }
  }
}
export = controllers
