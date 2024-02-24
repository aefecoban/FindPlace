import mongoose, { Document, Model, Schema } from "mongoose";
import { IFaultLine } from "./FaultLineModel";

export interface IEarthquake extends Document {
    location: {
        type: {
            type: string;
            enum: ["Point"];
            default: "Point";
        };
        coordinates: [number, number]; // Float olarak tanımlanmış coordinates alanı
    };
    magnitude: number;
    depth: number | null;
    date: Date;
    fault_line: IFaultLine['_id'] | null;
    alert: number;
}

export const EarthquakeSchema: Schema = new Schema(
    {
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                index: "2dsphere",
            },
        },
        magnitude: Number,
        depth: { type: Number, default: null },
        date: Date,
        fault_line: { type: Schema.Types.ObjectId, ref: 'FaultLine', default: null },
        alert: Number
    }
)