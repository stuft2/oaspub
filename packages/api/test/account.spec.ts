import 'mocha'
import {expect} from 'chai'
import * as sinon from 'sinon'
import AccountControllers = require('../src/controllers/account')
import {Db, MongoWriteConcernError} from 'mongodb'
import {SinonStubbedInstance} from 'sinon'
import {Request, Response} from 'express'
import {HttpStatus} from "../src/util/uapi"

describe('Account Controllers', () => {
  let req: any
  let res: any
  let db: SinonStubbedInstance<Db>
  let controllers: Record<string, (req: Request, res: Response) => Promise<unknown>>

  beforeEach(() => {
    req = {params: {}, body: {}}
    const send = sinon.stub()
    const status = sinon.stub().returns({send})
    res = {status, send}
    db = sinon.createStubInstance(Db)
    controllers = AccountControllers(db as any)
  })

  describe('Creating an account', () => {
    it('should create a new account', async () => {
      const dbResult = {
        username: '',
        email: '',
        password: ''
      }
      const insertOne = sinon.stub().returns({ ops: [dbResult]})
      db.collection.returns({insertOne} as any)

      await controllers.create(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(insertOne.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.CREATED)
      expect(responseBody).to.have.property('username')
      expect(responseBody).to.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
    })
    it('should not create an account that already exists', async () => {
      const insertOne = sinon.stub().throws(new MongoWriteConcernError('Error about a duplicate'))
      db.collection.returns({insertOne} as any)

      await controllers.create(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(insertOne.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.CONFLICT)
      expect(responseBody).to.not.have.property('username')
      expect(responseBody).to.not.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
    })
    it('should fail gracefully for any other unexpected errors', async () => {
      const insertOne = sinon.stub().throws(Error('Unexpected Error'))
      db.collection.returns({insertOne} as any)

      await controllers.create(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(insertOne.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.INTERNAL_ERROR)
      expect(responseBody).to.not.have.property('username')
      expect(responseBody).to.not.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
    })
  })
})
