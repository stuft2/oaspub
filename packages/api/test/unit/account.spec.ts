import 'mocha'
import {URL} from 'url'
import chai = require('chai')
import chaiAsPromised = require('chai-as-promised')
import * as sinon from 'sinon'
import AccountControllers = require('../../src/controllers/account')
import {Db, MongoError} from 'mongodb'
import {SinonStubbedInstance} from 'sinon'
import {Request, Response} from 'express'
import {HttpStatus} from "../../src/util/uapi"
import {AccountModel} from "../../src/db/models"

chai.use(chaiAsPromised)
const {expect} = chai

describe('Account Controllers', () => {
  let req: any
  let res: any
  let db: SinonStubbedInstance<Db>
  let controllers: Record<string, (req: Request, res: Response) => Promise<unknown>>
  let dbResult: AccountModel

  beforeEach(() => {
    req = {params: {}, body: {}}
    const send = sinon.stub()
    const status = sinon.stub().returns({send})
    const setHeader = sinon.stub()
    res = {status, send, setHeader}
    db = sinon.createStubInstance(Db)
    controllers = AccountControllers(db as any)
    dbResult = {
      _id: '',
      username: '',
      email: '',
      password: {
        value: '',
        _salt: ''
      },
      active: true
    }
  })

  describe('Creating an account', () => {
    beforeEach(() => {
      req.body = {
        username: 'john.doe',
        email: 'john.doe@example.com',
        password: 'fakePassword'
      }
    })
    it('should create a new account', async () => {
      const insertOne = sinon.stub().resolves({ ops: [dbResult]})
      db.collection.returns({insertOne} as any)

      await controllers.create(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [header, value] = res.setHeader.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(insertOne.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.CREATED)
      expect(header).to.equal('location')
      expect(new URL(value)).to.not.throw(TypeError)
      expect(responseBody).to.have.property('username')
      expect(responseBody).to.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
    })
    it('should not create an account that already exists', async () => {
      const insertOne = sinon.stub().rejects(new MongoError('Error about a duplicate'))
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
    it('should throw other errors', async () => {
      const insertOne = sinon.stub().rejects(Error('Unexpected Error'))
      db.collection.returns({insertOne} as any)
      expect(controllers.create(req, res)).to.eventually.be.rejectedWith(Error)

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(insertOne.calledOnce).to.equal(true)

      // check actual results
      expect(res.status.called).to.equal(false)
      expect(res.send.called).to.equal(false)
    })
  })

  describe('Retrieving an account', () => {
    beforeEach(() => {
      req.params.username = 'john.doe'
    })
    it('should get an account that exists', async () => {
      const findOne = sinon.stub().resolves(dbResult)
      db.collection.returns({findOne} as any)

      await controllers.retrieve(req, res)
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOne.calledOnce).to.equal(true)
      expect(res.status.called).to.equal(false)

      // check actual results
      expect(responseBody).to.have.property('username')
      expect(responseBody).to.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
      expect(responseBody.metadata.validation_response.code).to.equal(HttpStatus.SUCCESS)
    })
    it('should return 404 for an account that does not exist or is inactive', async () => {
      const findOne = sinon.stub().resolves(null)
      db.collection.returns({findOne} as any)

      await controllers.retrieve(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOne.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.NOT_FOUND)
      expect(responseBody).to.not.have.property('username')
      expect(responseBody).to.not.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
    })
  })

  describe('Updating an account', () => {
    beforeEach(() => {
      req.params.username = 'john.doe'
      req.body = {
        username: 'jane.doe'
      }
    })
    it('should update an account', async () => {
      const findOneAndUpdate = sinon.stub().resolves({value: dbResult})
      db.collection.returns({findOneAndUpdate} as any)

      await controllers.update(req, res)
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOneAndUpdate.calledOnce).to.equal(true)

      // check actual results
      expect(responseBody).to.have.property('username')
      expect(responseBody).to.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
      expect(responseBody.metadata.validation_response.code).to.equal(HttpStatus.SUCCESS)
    })
    it('should not update an account username or email that already exists', async () => {
      const findOneAndUpdate = sinon.stub().rejects(new MongoError('Error about a duplicate'))
      db.collection.returns({findOneAndUpdate} as any)

      await controllers.update(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOneAndUpdate.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.CONFLICT)
      expect(responseBody).to.not.have.property('username')
      expect(responseBody).to.not.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
    })
    it('should return 404 for an account that does not exist or is inactive', async () => {
      const findOneAndUpdate = sinon.stub().resolves({})
      db.collection.returns({findOneAndUpdate} as any)

      await controllers.update(req, res)
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOneAndUpdate.calledOnce).to.equal(true)

      // check actual results
      expect(responseBody).to.not.have.property('username')
      expect(responseBody).to.not.have.property('email')
      expect(responseBody).to.not.have.property('password')
      expect(responseBody).to.have.property('metadata')
      expect(responseBody.metadata.validation_response.code).to.equal(HttpStatus.NOT_FOUND)
    })
    it('should throw other errors', async () => {
      const findOneAndUpdate = sinon.stub().rejects(Error('Unexpected Error'))
      db.collection.returns({findOneAndUpdate} as any)
      expect(controllers.update(req, res)).to.eventually.be.rejectedWith(Error)

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOneAndUpdate.calledOnce).to.equal(true)

      // check actual results
      expect(res.status.called).to.equal(false)
      expect(res.send.called).to.equal(false)
    })
  })

  describe('Deactivating an account', () => {
    it('should mark an account as inactive, regardless of previous state', async () => {
      const findOneAndUpdate = sinon.stub().resolves({value: dbResult})
      db.collection.returns({findOneAndUpdate} as any)

      await controllers.deactivate(req, res)
      const [statusCode] = res.status.getCall(0).args
      const [responseBody] = res.send.getCall(0).args

      // check logic flow
      expect(db.collection.calledOnce).to.equal(true)
      expect(findOneAndUpdate.calledOnce).to.equal(true)

      // check actual results
      expect(statusCode).to.equal(HttpStatus.NO_CONTENT)
      expect(responseBody).to.equal(undefined)
    })
  })
})
