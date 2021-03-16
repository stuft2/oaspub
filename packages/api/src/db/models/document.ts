import {ValidateFunction} from 'ajv'
import {OpenAPIV2, OpenAPIV3} from 'openapi-types'
import {ajv} from '../../util/ajv'
import {ValidationError} from '../../util/uapi'
import {Collection, Db} from 'mongodb'
import {Debugger} from 'debug'
import { Contributor, Role } from './contributor'

export type DocumentModel = OpenAPIV2.Document | OpenAPIV3.Document

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

  static async fromJson (obj: unknown): Promise<DocumentV3> {
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

  static async fromJson (obj: unknown): Promise<DocumentV2> {
    if (!DocumentV2.isDocumentV2(obj)) throw new ValidationError(DocumentV2.validate.errors?.slice()) // Copy errors
    return new DocumentV2(obj)
  }

  static isDocumentV2 (value: unknown): value is OpenAPIV2.Document {
    return DocumentV2.validate(value)
  }
}

export class Document {
  readonly data: DocumentModel

  constructor(model: DocumentModel) {
    this.data = model
  }

  static v3 = DocumentV3
  static v2 = DocumentV2

  static from (model: DocumentModel): Document {
    return new Document(model)
  }

  static collection (db: Db): Collection<DocumentModel> {
    return db.collection<DocumentModel>(Document.name)
  }

  static async initialize (db: Db, logger: Debugger): Promise<void> {
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

  info (): DocumentModel['info'] {
    return this.data.info
  }

  static async count (db: Db, query: Pick<DocumentModel['info'], 'title'>): Promise<number> {
    return await Document.collection(db).countDocuments(query)
  }

  static async list (db: Db, query: Pick<DocumentModel['info'], 'title'>, limit: number, offset?: number): Promise<Document[]> {
    const versions = await Document.collection(db).find(query, {
      sort: { 'info.version': 1 },
      skip: offset,
      limit
    }).toArray()
    return  versions.map(version => Document.from(version))
  }

  static async fetch (db: Db, filters: Pick<DocumentModel['info'], 'version' | 'title'>): Promise<Document | null> {
    const result = await Document.collection(db).findOne(filters)
    return result ? Document.from(result) : null
  }

  static async publish (db: Db, request: DocumentModel): Promise<Document> {
    const {ops: [result]} = await Document.collection(db).insertOne(request)
    return Document.from(result)
  }
}
