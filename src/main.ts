import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRouter from "./routes";
import errorHandler from "./middleware";
import config from './config'

const app = express();
const PORT = parseInt(process.env.PORT || "8080");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req: Request, res: Response, next: NextFunction) => {

    res.status(200).json({
        error: false,
        data: {
            app: 'dream-devs-assesment',
            version: '1.0'
        },
        message: 'app is healthy',
        status: 200
    })

})

app.use(`${config.API_ROUTE}`, apiRouter);

app.use(errorHandler);

app.listen(PORT, async () => {
    // await conn;
    console.log(`Listening on ${PORT}`);
});
