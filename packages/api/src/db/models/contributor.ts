import { Debugger } from "debug"
import {Collection, Db } from "mongodb"
import {OpenAPIV2, OpenAPIV3} from 'openapi-types'

export enum Role {
    OWNER,
    MAINTAINER,
    VIEWER
}

export type ContributorModel = {
    role: Role
    username: string
    document: string
    accepted: boolean
}

export class Contributor implements ContributorModel {
    readonly role: Role
    readonly username: string
    readonly document: string
    readonly accepted: boolean

    constructor(model: ContributorModel) {
        this.role = model.role
        this.username = model.username
        this.document = model.document
        this.accepted = model.accepted
    }

    static from (model: ContributorModel): Contributor {
        return new Contributor(model)
    }

    static collection (db: Db): Collection<ContributorModel> {
        return db.collection<ContributorModel>(Contributor.name)
    }

    static async initialize (db: Db, logger: Debugger): Promise<void> {
        // Ensure collection exists
        const collectionName = Contributor.name
        const collections = await db.collections()
        if (collections.some(collection => collection.collectionName === collectionName)) {
            logger('Collection %s already exists', collectionName)
            return
        }
        await db.createCollection(collectionName)
        logger('Created collection %s', collectionName)

        // Ensure indexes exist
        const collection = db.collection(collectionName)
        await collection.createIndexes([
            { key: { 'username': 1, 'document': 1 }, unique: true },
        ])
        logger('Created indexes for collection %s', collectionName)
    }

    static async list (
        db: Db,
        query: Required<Pick<ContributorModel, 'document'>> & Partial<Pick<ContributorModel, 'role' | 'accepted'>>,
        limit: number,
        offset?: number
    ): Promise<Contributor[]> {
        const result = await Contributor.collection(db).find({
            accepted: true, // Default to only list acknowledged contributors
            ...query
        }, {
            sort: { 'username': 1 },
            skip: offset,
            limit
        }).toArray()
        return result.map(contributor => Contributor.from(contributor))
    }

    static async invite (db: Db, model: Omit<ContributorModel, 'accepted'>): Promise<Contributor> {
        const {ops: [result]} = await Contributor.collection(db).insertOne({...model, accepted: false})
        return Contributor.from(result)
    }

    static async acknowledge (db: Db, query: Pick<ContributorModel, 'document' | 'username'>, accepted: boolean): Promise<Contributor | null> {
        const result = await Contributor.collection(db).findOneAndUpdate(query, {$set: {accepted}}, {returnOriginal: false})
        return result.value ? Contributor.from(result.value) : null
    }

    static async revoke (db: Db, filter: Pick<ContributorModel, 'document' | 'username'>): Promise<void> {
        await Contributor.collection(db).deleteOne(filter)
    }
}