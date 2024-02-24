import { Model, Document, ObtainSchemaGeneric } from "mongoose";

export interface IRepo<T extends Document>{

    Create(val: T | any): Promise<T | null>;
    CreateMany(val: T | any): Promise<T[] | null>;
    FindByID(id: string): Promise<T | null>;
    FindOne(fields: Record<keyof T, any> | any, projection? : Object | null): Promise<T | null>;
    FindAll(fields: Record<string, any> | null, projection? : Object | null): Promise<T[] | null>;
    Update(id: string, updateVal: Partial<T>): Promise<T | null>;
    Delete(id: string): Promise<boolean>;
    Distinct(val: any): Promise<string[] | null>;
    GetModel(): Model<T>;
}

export default class Repo<T extends Document> implements IRepo<T> {

    MyModel: Model<T>;

    constructor(MyModel: Model<T>) {
        this.MyModel = MyModel;
    }

    public GetModel(): Model<T> {
        return this.MyModel;
    }

    public async Create(val: T | any): Promise<T | null> {
        return await this.MyModel.create(val);
    }

    public async CreateMany(val: T[] | any): Promise<T[] | null> {
        return await this.MyModel.insertMany(val);
    }

    public async FindByID(id: string): Promise<T | null> {
        return await this.MyModel.findById(id).exec();
    }

    public async FindOne(fields: Record<keyof T, any> | any, projection : Object | null = null): Promise<T | null> {
        if(projection != null)
            return await this.MyModel.findOne(fields, projection).exec();
        return await this.MyModel.findOne(fields).exec();
    }

    public async FindAll(fields: Record<string, any> | null, projection : Object | null = null): Promise<T[] | null> {
        if (fields != null)
            if(projection != null)
                return await this.MyModel.find(fields, projection).exec();
            else
                return await this.MyModel.find(fields).exec();
        else
            if(projection != null)
                return await this.MyModel.find({}, projection).exec();
            else
                return await this.MyModel.find({}).exec();
    }

    public async Update(id: string, updateVal: Partial<T>): Promise<T | null> {
        return await this.MyModel.findByIdAndUpdate(id, updateVal, { new: true }).exec();
    }

    public async Delete(id: string): Promise<boolean> {
        return (await this.MyModel.deleteOne({ _id: id }).exec()).deletedCount !== 0;
    }

    public async Distinct(val: any): Promise<string[] | null> {
        return (await this.MyModel.distinct(val))
    }

}