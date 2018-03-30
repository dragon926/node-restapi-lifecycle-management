import * as express from "express";
import { HandlerDispatcher, RestApiConfiguration } from "./lifecycle";
import * as bodyparser from "body-parser";
import { Request, Response } from "express-serve-static-core";
import { getContext } from "./common/functions";
import { AppConfig } from "./app-config";
import { SyntaxErrorException } from "./exceptions";

class App {
    public express: express.Express;
    public handlerDispatcher: HandlerDispatcher;

    constructor() {
        this.express = express();
        this.express.use(bodyparser.json());
        let restApiConfiguration = new RestApiConfiguration();
        new AppConfig(restApiConfiguration).register();

        this.express.use((err: any, req: Request, res: Response, next: any): void|SyntaxErrorException => {
            if (err) {
                if (err instanceof SyntaxError) {
                    // console.log("syntax err");
                    return new SyntaxErrorException(getContext(req, res));
                }
                console.log(err);
                return;
            }
            next();
        });
        this.mountRoutes();
    }

    private mountRoutes(): void {
        const router = express.Router();
        router.all("*", (request, response) => {
            HandlerDispatcher.processHandler(request, response);
        });

        this.express.use("/", router);
    }
}

export default new App().express;