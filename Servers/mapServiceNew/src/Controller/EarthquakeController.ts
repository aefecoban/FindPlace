
import DatabaseServer from "../databaseServer";
import { IEarthquake } from "../models/EarthquakeModel";
import { Response } from "express";
import { IFaultLine } from "../models/FaultLineModel";
import { INode } from "../models/NodeModel";

export interface IEarthquakeController {
    AddFaultLines(faultLines: IFaultLine | IFaultLine[] | any, response: Response) : any;
    AddEarthquake(earthquake: IEarthquake | IEarthquake[] | any, response: Response): any;
}

export default class EarthquakeController implements IEarthquakeController {

    public MapServer: DatabaseServer;

    constructor(MapServer: DatabaseServer) {
        this.MapServer = MapServer;
    }

    public async AddFaultLines(faultLines: IFaultLine | IFaultLine[] | any, response: Response) {
        if (!this.MapServer.IsConnected()) {
            response.send({
                "Process": false,
                "Error": true,
                "Body": {}
            })
            return;
        }

        faultLines = (Array.isArray(faultLines) ? faultLines : [faultLines]);
        try {
            let vals = [];
            for (let i = 0; i < faultLines.length; i++) {
                let faultLine = faultLines[i];

                let dbFaultLine = await this.MapServer.Repositories.FaultLine.FindOne({
                    fault_line: faultLine.fault_line
                });

                if (dbFaultLine == null) {
                    console.log("Faultline added : " + faultLine.fault_line);
                    vals.push(await this.MapServer.Repositories.FaultLine.Create(faultLine));
                }
            }

            response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Faultlines": vals
                }
            })
        } catch (error) {
            console.log(error);
            response.send({
                "Process": false,
                "Error": true,
                "Body": {}
            })
        }

    }

    public async AddEarthquake(earthquake: IEarthquake | IEarthquake[] | any, response: Response) {
        if (!this.MapServer.IsConnected()) {
            return this.ErrorResponse(response);
        }

        try {
            let earthquakes: any[] = [];

            if (!Array.isArray(earthquake)) {
                earthquake = [earthquake];
            }

            for (let i = 0; i < earthquake.length; i++) {
                let loc = {
                    type: "Point",
                    coordinates: [(earthquake[i].location?.longitude ?? earthquake[i].location?.lon), (earthquake[i].location?.latitude ?? earthquake[i].location?.lat)]
                }
                earthquake[i].location = loc;
                if (earthquake[i].fault_line != null) {
                    let id = await this.MapServer.Repositories.FaultLine.FindOne({
                        fault_line: earthquake[i].fault_line
                    });
                    if (id != null && id?._id != null) {
                        earthquake[i].fault_line = id._id;
                    } else {
                        earthquake[i].fault_line = null;
                    }
                }
                try {
                    const data = await this.MapServer.Repositories.Earthquake.Create(earthquake[i]);
                    console.log(data);
                    earthquakes.push(data);
                    console.log(i + ". data eklendi.");
                } catch (error) {
                    console.log(error);
                    return response.send({
                        "Process": true,
                        "Error": true,
                        "Body": {
                            "Earthquakes": earthquakes,
                            "Error": error
                        }
                    })
                }
            }

            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Earthquakes": earthquakes
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

            let eqs : any[] = [];
            earthquakes.map((e : IEarthquake) => {
                let obj = e.toObject();
                eqs.push({
                    lat : obj.location.coordinates[1],
                    lon : obj.location.coordinates[0],
                    magnitude : obj.magnitude,
                    depth : obj.depth,
                    date : obj.date,
                    fault_line : obj.fault_line,
                    alert : obj.alert
                });
            })
            console.log("Sonuc");
            return response.send({
                "Process": true,
                "Error": false,
                "Body": {
                    "Earthquakes": eqs,
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