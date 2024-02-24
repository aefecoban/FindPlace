import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFaultLine extends Document {
    fault_line: number;
    mean: number;
    mode: number;
    max: number;
    len: number;
    alert: number;
}

export const FaultLineSchema: Schema = new Schema({
    fault_line: {type: Number, unique: true},
    mean: Number,
    mode: Number,
    max: Number,
    len: Number,
    alert: Number
});
