import { Model } from "mongoose";
import Repo, { IRepo } from "./Repo";
import { IRelation } from "../models/RelationModel";

export interface IRelationRepo extends IRepo<IRelation> { }

export default class RelationRepo extends Repo<IRelation> implements IRelationRepo {

    constructor(MyModel: Model<IRelation>) {
        super(MyModel);
    }

}