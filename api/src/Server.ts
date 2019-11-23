// Init express
import express from 'express';
const app = express();
import ExpressWS from "express-ws";
const expressWS = ExpressWS(app);

import {Request, Response} from "express";
import logger from 'morgan';
import cors from "cors";
import Multer from "multer";
import BaseRouter from './routes';

app.use(cors());

// Add middleware/settings/routes to express.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', BaseRouter);

app.get('*', (req: Request, res:Response) => {
    res.send("Web server API endpoint");
});

// Export express instance
export default app;
