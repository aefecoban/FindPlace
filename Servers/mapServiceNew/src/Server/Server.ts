import express, { Application, Request, Response, RequestHandler, Router } from "express";

const morgan = require("morgan");
const cors = require('cors');
const bodyParser = require('body-parser');

interface ServerConfig {
    Port?: number;
    Limit?: {
        JSON: string,
        UrlEncoded: string
    }
}

export default class MainServer {

    private static instance: MainServer;
    private config: ServerConfig;

    public App: Application;

    public static CreateServer(config?: ServerConfig) {
        if (MainServer.instance == null) {
            MainServer.instance = new MainServer(config || {});
        }
        return MainServer.instance;
    }

    private constructor(config: ServerConfig) {
        this.config = config || {};

        this.App = express();

        this.Boot();
    }

    private Boot() {

        this.App.use(morgan("dev"));

        //#region CORS
        this.App.use(cors());
        //#endregion

        //#region ExpressLimit
        if (this.config?.Limit?.JSON && this.config?.Limit?.JSON != "") {
            this.App.use(express.json({ limit: this.config?.Limit?.JSON }));
        } else {
            this.App.use(express.json());
        }

        if (this.config?.Limit?.UrlEncoded && this.config?.Limit?.UrlEncoded != "") {
            this.App.use(express.urlencoded({ limit: this.config?.Limit?.UrlEncoded, extended: true }));
        } else {
            this.App.use(express.urlencoded({ extended: true }));
        }
        //#endregion

        //#region BodyParser
        this.App.use(bodyParser.urlencoded({ extended: true }));
        this.App.use(bodyParser.json());
        //#endregion

    }

    public SetMW(MW: RequestHandler) {
        this.App.use(MW);
    }

    public SetRouter(Router: Router) {
        this.App.use(Router);
    }

    public SetRoute(uri:string, callback: (req: Request, res: Response, next?: any) => void) {
        this.App.all(uri, callback);
    }

    public Run() {
        if (this.App != null) {
            this.App.listen(this.config.Port, () => {
                console.log(`Server running on port ${this.config.Port}`);
            });
        }
    }

}