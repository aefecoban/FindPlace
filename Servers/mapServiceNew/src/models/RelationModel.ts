import { Document, Types, Schema } from 'mongoose';

export interface IRelation extends Document {
    way: Types.ObjectId;
    type: Types.ObjectId;
}

export const RelationSchema: Schema = new Schema({
    way: { type: Types.ObjectId, ref: 'Way' },
    type: { type: Types.ObjectId, ref: 'Type' },
});