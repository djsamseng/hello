import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import ChromeNavigator from "../webnavigation/ChromeNavigator";

// Init shared
const router = Router();

const chromeNavigator = new ChromeNavigator();

router.post("/test", (req, res) => {
    console.log("GOT REQUEST:", req.body);
    chromeNavigator.pup();
    res.send(JSON.stringify({result: "Success"}));
});

export default router;
