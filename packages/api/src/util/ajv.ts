import Ajv, {AnySchemaObject} from 'ajv'
import formatters from 'ajv-formats'
import got from 'got'

async function loadSchema(uri: string): Promise<AnySchemaObject> {
  return got(uri).json()
}

export const ajv = new Ajv({loadSchema})
formatters(ajv) // Add some formatters
