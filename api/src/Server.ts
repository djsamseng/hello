import express from 'express';
import {Request, Response} from "express";
import logger from 'morgan';
import cors from "cors";
import Multer from "multer";
import BaseRouter from './routes';

const API_URL = "http:localhost:3000";


// Init express
const app = express();
const options = {
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token"],
    credentials: true,
    methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
    origin: API_URL,
    preflightContinue: false,
};
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
