import mongoose, { Document, Model, Schema } from "mongoose";

export interface INode extends Document {
    lat: number;
    lon: number;
    sourceID : number;
}

export const NodeSchema: Schema = new Schema({
    lat: Number,
    lon: Number,
    sourceID: Number,
});
