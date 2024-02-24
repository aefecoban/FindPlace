import { Model } from "mongoose";
import Repo, { IRepo } from "./Repo";
import { IType } from "../models/TypeModel";

export interface ITypeRepo extends IRepo<IType> { }

export default class TypeRepo extends Repo<IType> implements ITypeRepo {

    constructor(MyModel: Model<IType>) {
        super(MyModel);
    }

}