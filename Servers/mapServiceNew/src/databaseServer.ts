import mongoose, { Model } from "mongoose";
import { INode, NodeSchema } from "./models/NodeModel";
import { IMap, MapSchema } from "./models/MapModel";
import { IType, TypeSchema } from "./models/TypeModel";
import { IWay, WaySchema } from "./models/WayModel";
import { IRelation, RelationSchema } from "./models/RelationModel";
import { FaultLineSchema, IFaultLine } from "./models/FaultLineModel";
import { EarthquakeSchema, IEarthquake } from "./models/EarthquakeModel";
import { Response } from "express";
import EarthquakesRepo, { IEarthquakesRepo } from "./Repository/EarthquakesRepo";
import WayRepo, { IWayRepo } from "./Repository/WayRepo";
import MapRepo, { IMapRepo } from "./Repository/MapRepo";
import FaultLineRepo, { IIFaultLineRepo } from "./Repository/FaultLineRepo";
import NodeRepo, { INodeRepo } from "./Repository/NodeRepo";
import WayService from "./Service/WayService";

type ModelsT = {
    Node: Model<INode>,
    Map: Model<IMap>,
    Type: Model<IType>,
    Way: Model<IWay>,
    Relation: Model<IRelation>,
    Earthquake: Model<IEarthquake>,
    FaultLine: Model<IFaultLine>
}

type RepoT = {
    Earthquake: IEarthquakesRepo
    FaultLine: IIFaultLineRepo
    Map: IMapRepo
    Node: INodeRepo
    Way: IWayRepo
}

type ServicesT = {
    Way : WayService
}

export default class DatabaseServer{

    private DBUri = ""
    private DBOptions:any;
    private Models:ModelsT;
    private Connected: boolean = false;
    public Repositories: RepoT;
    public Services: ServicesT;

    constructor(DBUri : string) {
        this.DBUri = DBUri;
        this.DBOptions = { };

        this.Models = {
            Node : mongoose.model<INode>('Node', NodeSchema),
            Map : mongoose.model<IMap>('Map', MapSchema),
            Relation : mongoose.model<IRelation>('Relation', RelationSchema),
            Type : mongoose.model<IType>('Type', TypeSchema),
            Way : mongoose.model<IWay>('Way', WaySchema),
            Earthquake : mongoose.model<IEarthquake>('Earthquake', EarthquakeSchema),
            FaultLine : mongoose.model<IFaultLine>('FaultLine', FaultLineSchema),
        }

        this.Repositories = {
            Earthquake: new EarthquakesRepo(this.Models.Earthquake),
            FaultLine: new FaultLineRepo(this.Models.FaultLine),
            Map: new MapRepo(this.Models.Map),
            Node: new NodeRepo(this.Models.Node),
            Way: new WayRepo(this.Models.Way),
        }

        this.Services = {
            Way : new WayService(this.Repositories.Way, this.Repositories.Node)
        }
    }

    public async Boot(){
        try{
            await mongoose.connect(this.DBUri, this.DBOptions);
            this.Connected = true;
        }catch(error){
            console.log(error);
            this.Connected = false;
        }
    }

    public async SetDefaultValues(){

        try {
            const MapModel = this.Models.Map;
            const initialDatas = [
                {
                    title: "İzmir / Türkiye",
                    isRealWorld: true,
                    startLat: 38.92988,
                    startLon: 26.24607,
                    endLat: 37.98176,
                    endLon: 28.22620,
                },
                {
                    title: "İstanbul / Türkiye",
                    isRealWorld: true,
                    startLat: 41.30443,
                    startLon: 28.69968,
                    endLat: 40.80595,
                    endLon: 29.26192,
                },
                {
                    title: "Ankara / Türkiye",
                    isRealWorld: true,
                    startLat: 40.11132,
                    startLon: 32.48358,
                    endLat: 39.69725,
                    endLon: 33.05469,
                }
            ]

            let existingTitles: any | string[] = await this.Repositories.Map.Distinct("title");
            existingTitles = (existingTitles == null ? [] : existingTitles);
            const newDataToInsert = initialDatas.filter(
                (data) => !existingTitles.includes(data.title)
            );
            if (newDataToInsert.length > 0) {
                await this.Repositories.Map.Create(newDataToInsert);
                newDataToInsert.forEach((data) => {
                    console.log(data);
                })
                console.log("Yeni veriler başarıyla eklendi.");
            } else {
                console.log("Tüm veriler zaten var, yeni veri eklenmedi.");
            }

        } catch (error) {
            console.log("mongodb hata");
            console.log(error);
        }

    }

    public IsConnected(): boolean { return this.Connected; }

    public async Run(){
        await this.Boot();
        await this.SetDefaultValues();
    }

}