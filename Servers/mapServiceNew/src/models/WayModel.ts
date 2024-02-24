import { Schema, Document, Model, Types } from "mongoose";
import { INode, NodeSchema } from "./NodeModel";

export interface IWay extends Document {
    name: string;
    description: string;
    code: string;
    nodes: INode[];
    tags: string;
    centerPoint: {
        lat: number;
        lon: number;
    };
}

export const WaySchema: Schema = new Schema({
    name: String,
    description: String,
    code: String,
    nodes: [NodeSchema],
    tags: String,
    centerPoint: {
        lat: Number,
        lon: Number,
    },
});
