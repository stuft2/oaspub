import {EnvConfiguration} from '../util/env'
import {Db} from 'mongodb'
import {RequestHandler} from 'express'

export type Controllers = (env: EnvConfiguration, db: Db) => Record<string, RequestHandler>
