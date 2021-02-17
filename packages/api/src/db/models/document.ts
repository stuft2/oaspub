import {ValidateFunction} from 'ajv'
import { OpenAPIV2, OpenAPIV3 } from 'openapi-types'
import {ajv} from '../../util/ajv'
import {ValidationError} from '../../util/uapi'

export class DocumentV3 implements OpenAPIV3.Document {
  static validate: ValidateFunction

  openapi: OpenAPIV3.Document['openapi']
  info: OpenAPIV3.Document['info']
  servers: OpenAPIV3.Document['servers']
  paths: OpenAPIV3.Document['paths']
  components: OpenAPIV3.Document['components']
  security: OpenAPIV3.Document['security']
  tags: OpenAPIV3.Document['tags']
  externalDocs: OpenAPIV3.Document['externalDocs']

  constructor(doc: OpenAPIV3.Document) {
    this.openapi = doc.openapi
    this.info = doc.info
    this.servers = doc.servers
    this.paths = doc.paths
    this.components = doc.components
    this.security = doc.security
    this.tags = doc.tags
    this.externalDocs = doc.externalDocs
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

export class DocumentV2 implements OpenAPIV2.Document {
  static validate: ValidateFunction

  basePath: OpenAPIV2.Document['basePath']
  consumes: OpenAPIV2.Document['consumes']
  definitions: OpenAPIV2.Document['definitions']
  externalDocs: OpenAPIV2.Document['externalDocs']
  host: OpenAPIV2.Document['host']
  info: OpenAPIV2.Document['info']
  parameters: OpenAPIV2.Document['parameters']
  paths: OpenAPIV2.Document['paths']
  produces: OpenAPIV2.Document['produces']
  responses: OpenAPIV2.Document['responses']
  schemes: OpenAPIV2.Document['schemes']
  security: OpenAPIV2.Document['security']
  securityDefinitions: OpenAPIV2.Document['securityDefinitions']
  swagger: OpenAPIV2.Document['swagger']
  tags: OpenAPIV2.Document['tags']

  constructor(doc: OpenAPIV2.Document) {
    this.basePath = doc.basePath
    this.consumes = doc.consumes
    this.definitions = doc.definitions
    this.externalDocs = doc.externalDocs
    this.host = doc.host
    this.info = doc.info
    this.parameters = doc.parameters
    this.paths = doc.paths
    this.produces = doc.produces
    this.responses = doc.responses
    this.schemes = doc.schemes
    this.security = doc.security
    this.securityDefinitions = doc.securityDefinitions
    this.swagger = doc.swagger
    this.tags = doc.tags
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
}
