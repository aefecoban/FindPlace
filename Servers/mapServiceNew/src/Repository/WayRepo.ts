import { Model } from "mongoose";
import Repo, { IRepo } from "./Repo";
import { IWay } from "../models/WayModel";

export interface IWayRepo extends IRepo<IWay> { }

export default class WayRepo extends Repo<IWay> implements IWayRepo {

    constructor(MyModel: Model<IWay>) {
        super(MyModel);
    }

}