export type TableModelType = {
    [key : string] : TableModelElement
}
export enum TableModelElementTypes {
    "int" = "INTEGER",
    "float" = "FLOAT",
    "double" = "DOUBLE",
    "varchar" = "VARCHAR",
    "boolean" = "BOOLEAN",
    "date" = "DATE",
    "datetime" = "DATETIME",
    "timestamp" = "TIMESTAMP",
    "time" = "TIME",
    "char" = "CHAR",
    "tinyint" = "TINYINT",
    "smallint" = "SMALLINT",
    "mediumint" = "MEDIUMINT",
    "bigint" = "BIGINT",
    "binary" = "BINARY",
    "varbinary" = "VARBINARY",
    "tinyblob" = "TINYBLOB",
    "blob" = "BLOB",
    "mediumblob" = "MEDIUMBLOB",
    "longblob" = "LONGBLOB",
    "tinytext" = "TINYTEXT",
    "text" = "TEXT",
    "mediumtext" = "MEDIUMTEXT",
    "longtext" = "LONGTEXT",
    "enum" = "ENUM",
    "set" = "SET",
    "json" = "JSON",
    "string" = "TEXT",
}
export type TableModelElement = {
    type : TableModelElementTypes,
    key? : string,
    autoincrement? : boolean,
    notNull? : boolean,
    unique? : boolean,
    unsigned? : boolean,
    length? : number,
    defaultValue? : any,
    references? : string,
}

export default abstract class TableModel{

    public TableName? : string;
    public TableModel? : Record<string, TableModelElement>;
    
    public CreateModel(Obj : { [key: string]: any }, DeleteID : boolean = true) : any{

        if(this.TableModel == null) return;

        let Keys = Object.keys(Obj);
        let NecessaryKeys = Object.keys(this.TableModel);
        let valFromTable = Object.values(this.TableModel);

        for (const key of Keys) {
            if(( !NecessaryKeys.includes(key) ) || ( DeleteID && ((this.TableModel[key] as any)["autoincrement"] == true) ))
                delete Obj[key];
        }

        for (const key of NecessaryKeys) {
            if(!Keys.includes(key) && (!DeleteID && ((NecessaryKeys[NecessaryKeys.indexOf(key)] as any)["autoincrement"] == true)))
                Obj[key] = (valFromTable[NecessaryKeys.indexOf(key)] != null) ? ((valFromTable[NecessaryKeys.indexOf(key)] as any)["defaultValue"] ?? null) : null;
            
        }

        return Obj;

    }

}