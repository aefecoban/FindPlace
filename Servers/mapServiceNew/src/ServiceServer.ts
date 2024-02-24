import { Request, Response, response } from "express";
import ServiceManager from "./global/serviceManager/ServiceManager";
import DatabaseServer from "./databaseServer";

import IEarthquakeController from "./Controller/EarthquakeController";
import EarthquakeController from "./Controller/EarthquakeController";
import NodeController, { INodeController } from "./Controller/NodeController";
import WayController, { IWayController } from "./Controller/WayController";
import MainServer from "./Server/Server";
import APIBuilder from "./Server/APIBuilder";

type ControllersT = {
    Eartquake: IEarthquakeController
    Node: INodeController
    Way: IWayController
}

export default class ServiceServer{

    public Port : number;
    private SM : ServiceManager;
    private DBServer: DatabaseServer;
    private Controllers: ControllersT;
    private Server: MainServer;
    private API: APIBuilder;

    constructor(ServiceManager : ServiceManager, DBServer : DatabaseServer, Url : string = "http://127.0.0.1", Port : number = 8888){
        this.Port = Port;
        this.SM = ServiceManager;
        this.DBServer = DBServer;

        this.Controllers = {
            Eartquake: new EarthquakeController(this.DBServer),
            Node: new NodeController(this.DBServer),
            Way: new WayController(this.DBServer)
        }

        this.Server = MainServer.CreateServer({
            Port : this.Port,
            Limit : {
                JSON : "5000mb",
                UrlEncoded : "5000mb"
            }
        });

        this.API = new APIBuilder("/", "post");
        
    }

    public Main(){
        this.Server.SetRouter(
            this.API
                .AddRoute("AddEarthquake", this.AddEarthquake.bind(this))
                .AddRoute("AddFaultLine", this.AddFaultLine.bind(this))
                .AddRoute("AddWay", this.AddWay.bind(this))
                .AddRoute("GetWays", this.GetWays.bind(this))
                .AddRoute("GetEarthquakes", this.GetEarthquakes.bind(this))
                .AddDefault(this.DefaultCallback.bind(this))
                .Build()
        );
        this.Server.Run();
    }

    public DefaultCallback(request: Request, response: Response){
        return response.send({
            "Process" : false,
            "Error" : true,
            "Body" : {
                "Error" : 102,
                "Message" : "Command not found"
            }
        });
    }

    public GetEarthquakes(request: Request, response: Response, next:any, body: any) {
        let startPos = body.StartPos;
        let endPos = body.EndPos;
        if (startPos == null || endPos == null) {
            return response.send({
                "Process": false,
                "Error": true,
                "Body": {
                    "startPos": (startPos != null),
                    "endPos": (endPos != null)
                }
            });
        }
        this.Controllers.Eartquake.GetEarthquakes(startPos, endPos, response);
    }

    // body need to nodes
    public AddNodeForce(request: Request, response: Response, next:any, body: any){
        let nodes = body.Nodes;
        if(nodes == null){
            return response.send({
                "Process" : false,
                "Error" : true,
                "Body" : {
                    "Node" : (nodes != null)
                }
            });
        }
        this.Controllers.Node.AddNodeForce(nodes, response);
    }

    // body need to node
    public AddNode(request: Request, response: Response, next:any, body: any){
        let node = body.Node;
        if(node == null){
            return response.send({ "Process" : false, "Error" : true, "Body" : { "Node" : (node != null)}});
        }
        this.Controllers.Node.AddNode(node, response);
    }

    public AddWay(request: Request, response: Response, next:any, body: any) {
        let way = body.Way;
        if (way == null) {
            return response.send({
                "Process": false,
                "Error": true,
                "Body": {
                    "Way": (way != null)
                }
            });
        }
        this.Controllers.Way.AddWay(way, response);
    }

    public GetWays(request: Request, response: Response, next:any, body: any) {
        if(typeof(body?.Query ?? undefined) == typeof({})){
            console.log("query");
            this.Controllers.Way.GetWaysWithQuery(body.Query, response);
        }else if(
            typeof(body?.Start ?? undefined) == typeof({}) &&
            typeof(body?.End ?? undefined) == typeof({})
        ){
            this.Controllers.Way.GetWayWithCoords(
                {
                    Lat : body.Start.Lat,
                    Lon : body.Start.Lon
                },
                {
                    Lat : body.End.Lat,
                    Lon : body.End.Lon
                },
                response
            );
        }else{
            this.Controllers.Way.GetWays(response);
        }
    }

    public AddEarthquake(request : Request, response : Response, next : any, body : any){
        let earthquakeSources = body.Earthquakes;
        if(earthquakeSources == null){
            response.send({
                "Process" : false,
                "Error" : true,
                "Body" : {
                    "Earthquakes" : (earthquakeSources != null)
                }
            });
            return;
        }

        this.Controllers.Eartquake.AddEarthquake(earthquakeSources, response)
    }

    
    public AddFaultLine(request: Request, response: Response, next:any, body: any){
        let faultLines = body.FaultLines;
        if(faultLines == null){
            return response.send({
                "Process" : false,
                "Error" : true,
                "Body" : {
                    "FaultLine" : (faultLines != null)
                }
            });
        }
        this.Controllers.Eartquake.AddFaultLines(faultLines, response);

    }


}