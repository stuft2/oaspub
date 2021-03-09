import 'express-serve-static-core'
import { OpenAPIV3 } from 'openapi-types'
import {RequestAuthentication} from './middleware/authentication'

declare module 'express-serve-static-core' {
  export interface Request extends RequestAuthentication {
    // TODO - Upgrade to Enforcer definitions of OpenAPI document when available
    openapi: OpenAPIV3.Document
    operation: OpenAPIV3.OperationObject
  }
}


