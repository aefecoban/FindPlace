import DatabaseServer from "../databaseServer";
import { Response } from "express";
import { IWay } from "../models/WayModel";
import CacheSystem from "../cacheSystem"
import { INode } from "../models/NodeModel";

export interface IWayController {
    AddWay(Way: IWay | IWay[] | any, response: Response): any;
    GetWaysWithQuery(Query : Object, response: Response) : any;
    GetWays(response: Response): any;
    GetWayWithCoords(TopLeft : any, BottomRight : any, response: Response) : any;
}

export default class WayController implements IWayController {

    public MapServer: DatabaseServer;

    constructor(MapServer: DatabaseServer) {
        this.MapServer = MapServer;
    }

    public async AddWay(Way: IWay | IWay[] | any, response: Response) {
        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }

        console.log("gelen way: ", Way);

        try {
            let ways: any[] = [];

            if (!Array.isArray(Way)) {
                Way = [Way];
            }

            for (let i = 0; i < Way.length; i++) {
                try {
                    let check = await this.MapServer.Repositories.Way.FindOne({
                        name: Way[i]?.name,
                        code: Way[i]?.code,
                        tags: Way[i]?.tags
                    });

                    if (check == null) {
                        check = await this.MapServer.Repositories.Way.Create(Way[i]);
                    }

                    ways.push(check);
                } catch (error) {
                    console.log(error);
                    return response.send({
                        "Process": true,
                        "Error": true,
                        "Body": {
                            "Way": ways,
                            "Error": error
                        }
                    })
                }
            }

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Way": ways
                }
            })
        } catch (error) {
            console.log(error);

            return response.send({
                "Process": false,
                "Error": true,
                "Body": {}
            })
        }
    }

    public async GetWaysWithQuery(Query : Object, response: Response){
        
        let key = CacheSystem.CreateKey(Query);
        let cs = CacheSystem.getInstance();

        if(cs.IsExists(key)){
            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Way": cs.Get(key)
                }
            })
        }

        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }
        console.log(Query);
        const projection = { _id: 1, name: 1, code: 1, nodes: 1, tags : 1, centerPoint: 1 };

        this.MapServer.Services.Way.Find(Query, projection).then((All) => {
            cs.Set(key, All);

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Way": All
                }
            })
        }).catch((error) => {
            console.log(error);

            return response.send({
                "Process": false,
                "Error": true,
                "Body": {}
            })
        });
    }

    public async GetWays(response: Response) {
        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }

        try {
            let All = await this.MapServer.Services.Way.FindAll();

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Way": All
                }
            })
        } catch (error) {
            console.log(error);

            return response.send({
                "Process": false,
                "Error": true,
                "Body": {}
            })
        }
    }

    public async GetWayWithCoords(TopLeft : any, BottomRight : any, response: Response) {
        TopLeft = {
            Lat : TopLeft?.Lat ?? 0,
            Lon : TopLeft?.Lon ?? 0
        }
        BottomRight = {
            Lat : BottomRight?.Lat ?? 1,
            Lon : BottomRight?.Lon ?? 1
        }

        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }
        
        const projection = { _id: 1, name: 1, code: 1, nodes: 1, tags : 1, centerPoint: 1 };

        try {
            let All = await this.MapServer.Services.Way.FindAllWithCoords(
                {
                    Lat : parseFloat((TopLeft.Lat as number).toFixed(8)),
                    Lon : parseFloat((TopLeft.Lon as number).toFixed(8))
                },
                {
                    Lat : parseFloat((BottomRight.Lat as number).toFixed(8)),
                    Lon : parseFloat((BottomRight.Lon as number).toFixed(8))
                },
                projection
            );

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Way": All
                }
            })
        } catch (error) {
            console.log(error);

            return response.send({
                "Process": false,
                "Error": true,
                "Body": {}
            })
        }

    }

    private ErrorResponse(response: Response) {
        return response.send({
            "Process": false,
            "Error": true,
            "Body": {}
        });
    }
}