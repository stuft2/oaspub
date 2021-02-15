import {Request, Response} from 'express'
import {Db} from 'mongodb'

export = function (db: Db): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async list (req: Request, res: Response) {

    }
  }
}
