import MapServer from "./databaseServer";
import ServiceServer from "./ServiceServer";
import ServiceManager from "./global/serviceManager/ServiceManager"
import CacheSystem from "./cacheSystem"
import dotenv from "dotenv";
dotenv.config({path : ".env"});

class MapService{

    SM;
    DBServer;
    ServiceServer;
    CacheServer : CacheSystem;

    constructor(){
        let Url = process.env.PROTOCOL + "://" + process.env.URL;
        let Port = parseInt(process.env.PORT ?? "8888");

        let ServiceLedgerURL = process.env.SERVICE_LEDGER_PROTOCOL + "://" + process.env.SERVICE_LEDGER_URL + ((process.env?.SERVICE_LEDGER_PORT ?? 80) == 80 ? "" : `:${process.env.SERVICE_LEDGER_PORT}`);

        this.SM = new ServiceManager(ServiceLedgerURL, `${Url}${(Port == 80 ? "" : `:${Port}`)}/`, "MapService", process.env.PROTOCOL);
        this.CacheServer = CacheSystem.getInstance();

        this.DBServer = new MapServer((process.env.MONGO_URL as string));
        this.ServiceServer = new ServiceServer(this.SM, this.DBServer, Url, Port);
    }

    public async Main(){
        await this.SM.Boot();
        await this.SM.Subscribe();

        this.DBServer.Run();
        this.ServiceServer.Main();
    }

}

async function Main(){
    const Server = new MapService();
    Server.Main();
}

Main();