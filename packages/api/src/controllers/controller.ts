import {EnvConfiguration} from '../util/env'
import {Db} from 'mongodb'
import {Middleware} from '../middleware/middleware'

export type Controllers = (env: EnvConfiguration, db: Db) => Record<string, Middleware>
