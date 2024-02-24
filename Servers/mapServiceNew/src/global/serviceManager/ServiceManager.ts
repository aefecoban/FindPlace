const Commands = {
    GetURLS : {
        Command : "GetURLS"
    },
    Subscribe : {
        Command : "Subscribe"
    },
    Unsubscribe : {
        Command : "Unsubscribe"
    },
    GetServiceURL : {
        Command : "GetServiceURL"
    }
}

const Headers = {
    "Content-Type" : "application/json",
    "Accept" : "application/json",
    "User-Agent" : "ServiceManager",
}

export default class ServiceManager{

    private ServiceLedgerURL : string;
    private MyServiceURL : string;
    private MyProtocol : string = "";
    private LedgerURLs = {
        GetURLS : "/boot",
        Subscribe : "",
        Unsubscribe : "",
        GetServiceURL : "",
    };
    private MyServiceID : string = ""; //Service Ledger sets it
    private active : boolean = false;
    private MyServiceName : string;

    private LastError : string = ""; 

    constructor(ServiceLedgerURL : string, MyServiceURL : string, MyServiceName : string, Protocol : string = ""){
        this.ServiceLedgerURL = ServiceLedgerURL;
        this.MyServiceURL = MyServiceURL;
        this.MyServiceName = MyServiceName;
        Protocol = Protocol.toUpperCase();
        this.MyProtocol = ((Protocol == "" || Protocol == "HTTP" || Protocol == "HTTPS") ? "HTTP" : "WS");
        this.MyServiceID = "";
        this.active = false;
    }

    public async Boot(){
        try{
            let response = await fetch(this.ServiceLedgerURL, {
                    method : "POST",
                    body : JSON.stringify(Commands.GetURLS),
                    headers : {
                        ...Headers
                    }
                });

            if(response.ok){
                let data = (await response.json()) as any;

                if(data.LedgerURLs != null){
                    this.LedgerURLs = data.LedgerURLs;
                    this.LedgerURLs.GetServiceURL = (this.ServiceLedgerURL + this.LedgerURLs.GetServiceURL).replace(/\/\//g, '/');
                    this.LedgerURLs.GetURLS = (this.ServiceLedgerURL + this.LedgerURLs.GetURLS).replace(/\/\//g, '/');
                    this.LedgerURLs.Subscribe = (this.ServiceLedgerURL + this.LedgerURLs.Subscribe).replace(/\/\//g, '/');
                    this.LedgerURLs.Unsubscribe = (this.ServiceLedgerURL + this.LedgerURLs.Unsubscribe).replace(/\/\//g, '/');
                    return true;
                }
            }else{
                throw new Error("Response not ok");
            }

            
        }catch(error){
            console.error(error);
            this.LastError = (error as string);
        }

        return false;
    }

    public async Subscribe(){
        
        try {
            let response = (await fetch(this.LedgerURLs?.Subscribe, {
                method : "POST",
                body : JSON.stringify({
                    ...Commands.Subscribe,
                    ServiceName : this.MyServiceName,
                    Protocol : this.MyProtocol,
                    MyServiceURL : this.MyServiceURL
                }),
                headers : {
                    ...Headers
                }
            }));

            if(response.ok){
                let data = (await response.json()) as any;
                if(data?.YourServiceID != null){
                    this.MyServiceID = data.YourServiceID;
                    this.active = true;
                    this.ListenProcess();
                    return true;
                }else{
                    throw new Error("Your service ID is null");
                }
            }else{
                console.log(await response.json());
                throw new Error("Response not ok");
            }
            
        } catch (error) {
            console.error(error);
            this.LastError = (error as string);
        }

        return false;
        
    }

    public ListenProcess(){
        process.on('SIGINT', async () => {
            console.log('Received SIGINT signal.');
            if(this.MyServiceID != ""){
                console.log("Unsubscribing...");
                await this.Unsubscribe();
            }
            console.log("Service will be terminated.");
            process.exit(0); // Exiting the process with status code 0
          });
          
    }

    public async Unsubscribe(){
        if(this.MyServiceID == "") return;

        try {
            let response = await fetch(this.LedgerURLs?.Unsubscribe, {
                method : "POST",
                body : JSON.stringify({
                    ...Commands.Unsubscribe,
                    MyServiceID : this.MyServiceID
                }),
                headers : {
                    ...Headers
                }
            });

            if(response.ok)
                return true;
            else
                throw new Error("Response not ok");

        } catch (error) {
            console.error(error);
            this.LastError = (error as string);
        }

        return false;
    }

    public async GetServiceURL(serviceName : string){
        if(this.MyServiceID == "") return null;
        this.LastError = "Your service ID is null";

        try{
            
            let response = await fetch(this.LedgerURLs?.GetServiceURL, {
                method : "POST",
                body : JSON.stringify({
                    ...Commands.GetURLS,
                    ServiceName : serviceName
                }),
                headers : {
                    ...Headers
                }
            });

            if(response.ok){
                let data = (await response.json()) as any;
                if(data?.ServiceURL != null){
                    return data.ServiceURL;
                }else{
                    throw new Error("Service URL is null");
                }
            }

        }catch(error){
            console.error(error);
            this.LastError = (error as string);
        }

        return null;
    }

    public async MakeQuery(ToWhichService : string, Command : string, Body : any){
        
        return fetch(this.ServiceLedgerURL, {
            method : "POST",
            headers : Headers,
            body : JSON.stringify({
                "Command" : "Query",
                "ServiceName" : ToWhichService,
                "Query" : {
                    "Command" : Command,
                    "Body" : Body
                }
            })
        });

    }

}