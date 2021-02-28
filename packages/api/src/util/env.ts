import env from 'env-var'

export interface EnvConfiguration {
  db: {
    host: string
    port: number
    username: string
    password: string
    database: string
  }
  server: {
    host: string
    port: number
    privateKey: string
  }
}

let config: EnvConfiguration

export function get (): EnvConfiguration {
  if (!config) {
    config = {
      db: {
        host: env.get('DB_ADDRESS').required().asString(),
        port: env.get('DB_PORT').required().asPortNumber(),
        username: env.get('DB_USERNAME').required().asString(),
        password: env.get('DB_PASSWORD').required().asString(),
        database: env.get('DB_DATABASE_NAME').required().asString()
      },
      server: {
        host: env.get('HOST').required().asString(),
        port: env.get('PORT').default(8080).asPortNumber(),
        privateKey: env.get('PRIVATE_KEY').required().asString()
      }
    }
  }
  return config
}
