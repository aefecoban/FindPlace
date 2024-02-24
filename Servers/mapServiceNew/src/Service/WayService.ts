import { IWayRepo } from "../Repository/WayRepo";
import { IWay } from "../models/WayModel";
import { INodeRepo } from "../Repository/NodeRepo";
import { INode } from "../models/NodeModel";

export default class WayService {

    WayRepo: IWayRepo;
    NodeRepo: INodeRepo;

    constructor(MyModel: IWayRepo, NodeRepo: INodeRepo) {
        this.WayRepo = MyModel;
        this.NodeRepo = NodeRepo;
    }

    async CreateWay(way: IWay): Promise<IWay | null> {
        try {
            return await this.WayRepo.Create(way);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async FindByID(id: string): Promise<IWay | null> {
        try {
            return await this.WayRepo.GetModel().findById(id).exec();
        } catch (error) {
            console.error(error);
            return null;
        }
    }
    
    async Find(Query : Object, Projection: Object|null = null) : Promise<IWay[] | null> {
        try {
            let All: IWay[] = await this.WayRepo.FindAll(Query, Projection) ?? [];
            if(!All.length) return null;
            return All;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async FindAllWithCoords(TopLeft : {Lat:number, Lon:number}, BottomRight : {Lat:number, Lon:number}, Projection: Object|null = null) : Promise<IWay[] | null>{
        try {
            let All: IWay[] = await this.WayRepo.GetModel().find({
                "centerPoint" : {
                    $geoWithin : {
                        $geometry : {
                            type : "Polygon",
                            coordinates : [
                                [
                                    [TopLeft.Lat, TopLeft.Lon],
                                    [BottomRight.Lat, TopLeft.Lon],
                                    [BottomRight.Lat, BottomRight.Lon],
                                    [TopLeft.Lat, BottomRight.Lon],
                                    [TopLeft.Lat, TopLeft.Lon]
                                ]
                            ]
                        }
                    }
                }
            }, Projection) ?? [];
            if(!All.length) return null;
            return All;
        } catch (error) {
            console.error(error);
            return null;
        }

    }

    async FindAll() : Promise<IWay[] | null> {
        return this.Find({});
    }

}