import {Request, Response} from 'express'
import {MongoClient} from 'mongodb'

export default function (db: MongoClient): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async create (req: Request, res: Response) {

    },
    async retrieve (req: Request, res: Response) {

    },
    async update (req: Request, res: Response) {

    },
    async deactivate (req: Request, res: Response) {

    }
  }
}
