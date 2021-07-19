import { MainController } from "controllers/main.controller";
import userRouter from "./routes/user.router";

class RouterConfig {
    private static readonly API_PATH: string = "/api/v1";

    public static routes(router: any, io?:any): any {
        router.get("/", MainController.index);
        router.get("/videos", MainController.videos);
        router.get("/stream", MainController.stream);
        router.get("/:resource", MainController.resource);
        //router.get("/socket.io", MainController.stream);
        router.get("/test", MainController.encode(io));


        router.use(`${this.API_PATH}/user`, userRouter); 
    }
}

export default RouterConfig;
