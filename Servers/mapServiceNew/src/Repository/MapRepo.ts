import { Model } from "mongoose";
import Repo, { IRepo } from "./Repo";
import { IMap } from "../models/MapModel";

export interface IMapRepo extends IRepo<IMap> { }

export default class MapRepo extends Repo<IMap> implements IMapRepo {

    constructor(MyModel: Model<IMap>) {
        super(MyModel);
    }

}