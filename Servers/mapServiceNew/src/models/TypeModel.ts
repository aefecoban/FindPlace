import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IType extends Document {
    name: string;
    tag: string;
    color: string;
}

export const TypeSchema: Schema = new Schema({
    name: String,
    tag: String,
    color: String,
});