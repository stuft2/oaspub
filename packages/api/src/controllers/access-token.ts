import {Request, Response} from 'express'
import {MongoClient} from 'mongodb'

export default function (db: MongoClient): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async list (req: Request, res: Response) {

    },
    async generate (req: Request, res: Response) {

    },
    async revoke (req: Request, res: Response) {

    }
  }
}
