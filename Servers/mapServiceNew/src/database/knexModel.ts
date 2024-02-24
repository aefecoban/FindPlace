import Knex from "knex";
import TableModel, { TableModelElementTypes } from "./TableModel";

export default class KnexModel{

    Knex : Knex.Knex;
    Model : TableModel;

    /**
     *
     */
    constructor(knex : Knex.Knex, Model : TableModel) {
        this.Knex = knex;
        this.Model = Model;
    }

    public CreateTable(): void {
        this.CreateTableIfNotExists();
    }

    public async CreateTableIfNotExists(): Promise<any> {
        if(this.Model.TableName == null || this.Model.TableModel == null) return;

        return this.Knex?.schema.hasTable(this.Model.TableName).then((exists : any) => {
            if(!exists && this.Model.TableModel != null && this.Model.TableName != null){
                return this.Knex.schema.createTable(this.Model.TableName, (table : any) => {

                    if(this.Model.TableModel != null){
                        let Rows = Object.keys(this.Model.TableModel);
                        let Values = Object.values(this.Model.TableModel);
    
                        Rows.map((row, index) =>{
                            let r = null;
                            switch (Values[index].type) {
                                case TableModelElementTypes.int:
                                    r = (Values[index].autoincrement) ? table.increments(row) : table.integer(row);
                                break;
                                case TableModelElementTypes.bigint:
                                    r = (Values[index].autoincrement) ? table.bigIncrements(row) : table.bigInteger(row);
                                break;
                                case TableModelElementTypes.tinyint:
                                    r = table.tinyint(row);
                                break;
                                case TableModelElementTypes.float:
                                    r = table.float(row);
                                break;
                                case TableModelElementTypes.double:
                                    r = table.double(row);
                                break;
                                case TableModelElementTypes.binary:
                                    r = table.binary(row);
                                break;
                                case TableModelElementTypes.boolean:
                                    r = table.boolean(row);
                                break;
                                case TableModelElementTypes.date:
                                    r = table.date(row);
                                break;
                                case TableModelElementTypes.datetime:
                                    r = table.dateTime(row);
                                break;
                                case TableModelElementTypes.timestamp:
                                    r = table.timestamp(row);
                                break;
                                case TableModelElementTypes.varchar:
                                case TableModelElementTypes.string:
                                    r = table.string(row);
                                break;
                                case TableModelElementTypes.json:
                                    r = table.json(row);
                                break;
                                default:
                                    r = table.string(row);
                                    break;
                            }
                            
                            let { key, references, notNull, unique, unsigned, defaultValue } = Values[index];

                            switch (key) {
                                case "primary":
                                    r.primary();
                                break;
                                case "foreign":
                                    table.foreign(row).references(references ?? "");
                                break;
                            }

                            if(notNull) r.notNullable();
                            if(unique) r.unique();
                            if(unsigned) r.unsigned();
                            if(Values[index].type == TableModelElementTypes.timestamp && defaultValue == "CURRENT_TIMESTAMP")
                                r.defaultTo(this.Knex.fn.now());
                            else if(defaultValue) r.defaultTo(defaultValue);
                        })
                    }

                })
            }
        })
    }

    public async Select(selector : string | string[]= "*" , where : string | Record<string, any> | null = null, opts : string = ""): Promise<Knex.QueryBuilder | undefined> {
        if(this.Model.TableName == null || this.Model.TableModel == null) return;
        let q = this.Knex?.select(selector).from(this.Model.TableName);

        if(where != null && where != undefined) {
            if(typeof where === 'string') q = q.whereRaw(where);
            else if(typeof where === 'object') q = q.where(where as Record<string, any>);
        }

        return q.first();
    }

    public async SelectAll(selector : string | string[] = "*", where : string | Record<string, any> | null = null, opts : string = ""): Promise<Knex.QueryBuilder | undefined> {
        console.log("where", where);
        if(this.Model.TableName == null || this.Model.TableModel == null) return;

        let query = this.Knex?.select(selector).from(this.Model.TableName);
        console.log("query", query);

        if(where != null && where != undefined){
            if(typeof where === 'string') query = query.whereRaw(where);
            else if(typeof where === 'object') query= query.where(where as Record<string, any>);
        }

        return query;
    }

    public async Count(selector : string = "*"): Promise<any> {
        if(this.Model.TableName == null || this.Model.TableModel == null) return;
        return this.Knex?.count(selector).from(this.Model.TableName);
    }

    public async Insert(data : any): Promise<any> {
        if(this.Model.TableName == null) return;
        return this.Knex?.insert(data).into(this.Model.TableName);
    }

    public async Update(data : any, where : string | Record<string, any>): Promise<any> {
        if(this.Model.TableName == null) return;
        let q =  this.Knex?.update(data).from(this.Model.TableName);
        
        if(typeof where === 'object') q = q.where(where as Record<string, any>);
        else q = q.whereRaw(where);

        return q;
    }

    public async Delete(where : string): Promise<any> {
        if(this.Model.TableName == null) return;
        let q = this.Knex?.delete().from(this.Model.TableName);

        if(typeof where === 'object') q = q.where(where as Record<string, any>);
        else q = q.whereRaw(where);

        return q;
    }

}