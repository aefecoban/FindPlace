import { Model } from "mongoose";
import Repo, { IRepo } from "./Repo";
import { IFaultLine } from "../models/FaultLineModel";

export interface IIFaultLineRepo extends IRepo<IFaultLine> { }

export default class FaultLineRepo extends Repo<IFaultLine> implements IIFaultLineRepo {

    constructor(MyModel: Model<IFaultLine>) {
        super(MyModel);
    }

}