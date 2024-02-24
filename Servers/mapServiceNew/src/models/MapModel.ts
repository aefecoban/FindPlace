import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMap extends Document {
    title: string;
    isRealWorld: boolean;
    startLat: number;
    startLon: number;
    endLat: number;
    endLon: number;
}

export const MapSchema: Schema = new Schema({
    title: String,
    isRealWorld: Boolean,
    startLat: Number,
    startLon: Number,
    endLat: Number,
    endLon: Number,
});
