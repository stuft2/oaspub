import {Controllers} from './controller'
import {generateMetadataResponseObj, generateValidationResponseObj, HttpStatus, parseQueryToInt} from "../util/uapi"
import {Token} from "../db/models"

const controllers: Controllers = function (env, db) {
  return {
    async list (req, res) {
      const limit = parseQueryToInt(req.query.limit, 10)
      const offset = parseQueryToInt(req.query.offset, 0)
      const username = req.auth.entity?.sub
      if (!username) {
        // We should always have an authenticated entity due to our OpenAPI spec and auth middleware
        return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
      }
      const collectionSize = await Token.count(db, {username})
      const values = await Token.list(db, {username}, limit, offset)
      return res.status(HttpStatus.SUCCESS).send({
        metadata: {
          collectionSize,
          limit,
          offset,
          ...generateValidationResponseObj(HttpStatus.SUCCESS)
        },
        values: values.map(token => token.info())
      })
    },
    async generate (req, res) {
      const username = req.auth.entity?.sub
      if (!username) {
        // We should always have an authenticated entity due to our OpenAPI spec and auth middleware
        return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
      }
      const {description} = req.body
      const result = await Token.generate(db, {username, ...description && {description}})
      return res.status(HttpStatus.SUCCESS).send({
        ...generateMetadataResponseObj(HttpStatus.SUCCESS),
        ...result.info(true)
      })
    },
    async revoke (req, res) {
      const _id = req.params.tokenId
      const username = req.auth.entity?.sub
      if (!username) {
        // We should always have an authenticated entity due to our OpenAPI spec and auth middleware
        return res.status(HttpStatus.INTERNAL_ERROR).send(generateMetadataResponseObj(HttpStatus.INTERNAL_ERROR))
      }
      await Token.revoke(db, {username, _id})
      res.status(HttpStatus.NO_CONTENT).send()
    }
  }
}

export = controllers
