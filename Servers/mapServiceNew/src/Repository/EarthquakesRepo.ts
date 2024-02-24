import { Model } from "mongoose";
import { IEarthquake } from "../models/EarthquakeModel";
import Repo, { IRepo } from "./Repo";

export interface IEarthquakesRepo extends IRepo<IEarthquake> { }

export default class EarthquakesRepo extends Repo<IEarthquake> implements IEarthquakesRepo {

    constructor(MyModel: Model<IEarthquake>) {
        super(MyModel);
    }

}