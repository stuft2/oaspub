import {EnvConfiguration} from '../util/env'
import {Db} from 'mongodb'
import {Request, Response} from 'express'

export type Controllers = (env: EnvConfiguration, db: Db) => Record<string, Controller>
export type Controller = (req: Request, res: Response) => Promise<unknown>
