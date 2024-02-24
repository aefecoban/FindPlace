
import DatabaseServer from "../databaseServer";
import { Response } from "express";
import { INode } from "../models/NodeModel";

export interface INodeController {
    AddNode(Node: INode | INode[] | any, response: Response) : any;
    AddNodeForce(Node: INode | INode[] | any, response: Response) : any;
}

export default class NodeController implements INodeController {

    public MapServer: DatabaseServer;

    constructor(MapServer: DatabaseServer) {
        this.MapServer = MapServer;
    }

    public async AddNode(Node: INode | INode[] | any, response: Response) {
        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }

        try {
            let nodes: any[] = [];
            Node = (!Array.isArray(Node)) ? [Node] : Node;

            let nodesForInsert : any = [];
            for (let i = 0; i < Node.length; i++) {
                try {
                    await this.MapServer.Repositories.Node.FindOne({
                        lat: Node[i]?.lat,
                        lon: Node[i]?.lon,
                        sourceID: Node[i]?.sourceID
                    }).then(async (check) => {
                        if (check == null) {
                            nodesForInsert.push(Node[i]);
                        }
                    }).catch((e) => {
                        console.log("e", e);
                    });
                } catch (error) {
                    console.log(error);
                    return response.send({
                        "Process": true,
                        "Error": true,
                        "Body": {
                            "Nodes": nodes,
                            "Error": error
                        }
                    })
                }
            }

            await this.MapServer.Repositories.Node.CreateMany(nodesForInsert).then((check2) => {
                nodes = check2 ?? [];
                console.log(nodes);
            });

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Node": nodes
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
    
    public async AddNodeForce(Node: INode | INode[] | any, response: Response) {
        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }

        try {
            let nodes: any[] = [];
            Node = (!Array.isArray(Node)) ? [Node] : Node;

            await this.MapServer.Repositories.Node.CreateMany(Node).then((check) => {
                nodes = check ?? [];
                console.log(nodes);
            });

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Node": nodes
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


    public async GetEarthquakes(startPos: INode, endPos: INode, response: Response) {
        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }

        try {
            console.log("Gelen istek : ", startPos, endPos);
            let earthquakes = await this.MapServer.Repositories.Earthquake.GetModel().find({
                'location.coordinates': {
                    $geoWithin: {
                        $geometry: {
                            type: 'Polygon',
                            coordinates: [[
                                [startPos.lon, startPos.lat],
                                [endPos.lon, startPos.lat],
                                [endPos.lon, endPos.lat],
                                [startPos.lon, endPos.lat],
                                [startPos.lon, startPos.lat],
                            ]],
                        },
                    },
                },
            }).exec();
            console.log("Sonu�");
            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Earthquakes": earthquakes,
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