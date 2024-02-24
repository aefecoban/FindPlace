import express, { Router, Request, Response } from 'express';

interface MyRoute {
    CommandName: string,
    Callback: (req: Request, res: Response, next?: any, PreparedBody?: any) => void
}

export default class APIBuilder {

    private Routes: MyRoute[] = [];
    private DefaultCallback?: null | ((req: Request, res: Response, next?: any, body?: any) => void) = null;
    private router: Router;
    private MainUrl: string;
    private Method: string;

    constructor(MainUrl:string = "/", Method:string = "POST", routes?: MyRoute[]) {

        this.router = express.Router();

        this.MainUrl = MainUrl;
        this.Method = Method.toLowerCase();

        if (routes && Array.isArray(routes)) {
            this.Routes = routes;
        }
    }

    public AddDefault(Callback: (req: Request, res: Response, next?: any, body?: any) => void) {
        this.DefaultCallback = Callback;
        return this;
    }

    public AddRoute(CommandName: string, Callback: (req: Request, res: Response, next?: any, body?: any) => void) {
        this.Routes.push({ CommandName, Callback });
        return this;
    }

    public RemoveRoute(CommandName: string) {
        this.Routes = this.Routes.filter(x => x.CommandName != CommandName);
        return this;
    }

    public Build() {
        switch (this.Method) {
            case "post":
                this.router.post(this.MainUrl, this.Callback.bind(this));
            break;
            default:
                this.router.get(this.MainUrl, this.Callback.bind(this));
        }
        return this.router;
    }

    private Callback(req: Request, res: Response, next: any) {
        const Command = req.body?.Command ?? null;

        if (Command == null || Command == undefined) {
            return res.send({
                "Process": false,
                "Error": true,
                "Body": {
                    "Error": 100,
                    "Message": "Command not found"
                }
            })
        }

        let BodyValue = req.body?.Body ?? req.body?.body ?? {};

        try {
            if (typeof (BodyValue) == typeof (""))
                BodyValue = JSON.parse(BodyValue);
        } catch (error) {
            return res.send({
                "Process": false,
                "Error": true,
                "Body": {
                    "Error": 101,
                    "Message": "Value not found or incorrect type."
                }
            });
        }

        if (typeof (BodyValue) != typeof ({})) return res.send({
            "Process": false,
            "Error": true,
            "Body": {
                "Error": 101,
                "Message": "Value type not correct"
            }
        });

        let Found = false;

        for (let i = 0; i < this.Routes.length; i++) {
            if (this.Routes[i].CommandName == Command) {
                this.Routes[i].Callback(req, res, next, BodyValue);
                Found = true;
                break;
            }
        }

        if (!Found){
            if(this.DefaultCallback != null){
                this.DefaultCallback(req, res, next, BodyValue);
            }
            next();
        }
    }

}