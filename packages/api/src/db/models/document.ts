import {ValidateFunction} from 'ajv'
import {OpenAPIV2, OpenAPIV3} from 'openapi-types'
import {ajv} from '../../util/ajv'
import {ValidationError} from '../../util/uapi'
import {Db} from 'mongodb'
import {Debugger} from 'debug'

export class DocumentV3 {
  static validate: ValidateFunction

  data: OpenAPIV3.Document

  constructor(doc: OpenAPIV3.Document) {
    this.data = doc
  }

  static async promise (): Promise<typeof DocumentV3> {
    DocumentV3.validate = await ajv.compileAsync<OpenAPIV3.Document>({ $ref: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v2.0/schema.json' })
    return DocumentV3
  }

  static async fromJson (obj: unknown) {
    if (!DocumentV3.isDocumentV2(obj)) throw new ValidationError(DocumentV3.validate.errors?.slice()) // copy errors
    return new DocumentV3(obj)
  }

  static isDocumentV2 (value: unknown): value is OpenAPIV3.Document {
    return DocumentV3.validate(value)
  }
}

export class DocumentV2 {
  static validate: ValidateFunction

  data: OpenAPIV2.Document

  constructor(doc: OpenAPIV2.Document) {
    this.data = doc
  }

  static async promise (): Promise<typeof DocumentV2> {
    DocumentV2.validate = await ajv.compileAsync<OpenAPIV2.Document>({ $ref: 'https://raw.githubusercontent.com/OAI/OpenAPI-Specification/master/schemas/v3.0/schema.json' })
    return DocumentV2
  }

  static async fromJson (obj: unknown) {
    if (!DocumentV2.isDocumentV2(obj)) throw new ValidationError(DocumentV2.validate.errors?.slice()) // Copy errors
    return new DocumentV2(obj)
  }

  static isDocumentV2 (value: unknown): value is OpenAPIV2.Document {
    return DocumentV2.validate(value)
  }
}

export class Document {
  static v3 = DocumentV3
  static v2 = DocumentV2
  static async initialize (db: Db, logger: Debugger) {
    // Ensure collection exists
    const collectionName = Document.name
    const collections = await db.collections()
    if (collections.some(collection => collection.collectionName === collectionName)) {
      logger('Collection %s already exists', collectionName)
      return
    }
    await db.createCollection(collectionName)
    logger('Created collection %s', collectionName)

    // Ensure indexes exist
    const collection = db.collection(collectionName)
    await collection.createIndexes([
      { key: { 'info.version': 1, 'info.title': 1 }, unique: true },
    ])
    logger('Created indexes for collection %s', collectionName)
  }
}
