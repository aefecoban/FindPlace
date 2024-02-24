import { Model } from "mongoose";
import Repo, { IRepo } from "./Repo";
import { INode } from "../models/NodeModel";

export interface INodeRepo extends IRepo<INode> { }

export default class NodeRepo extends Repo<INode> implements INodeRepo {

    constructor(MyModel: Model<INode>) {
        super(MyModel);
    }

}