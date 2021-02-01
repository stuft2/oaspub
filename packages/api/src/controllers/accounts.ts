import {Request, Response} from 'express'
import {MongoClient} from 'mongodb'

export default function (db: MongoClient): Record<string, (req: Request, res: Response) => Promise<unknown>> {
  return {
    async createAccount (req: Request, res: Response) {

    },
    async getAccountInfo(req: Request, res: Response) {

    },
    async updateAccountInfo(req: Request, res: Response) {

    },
    async deactivateAccount(req: Request, res: Response) {

    }
  }
}
