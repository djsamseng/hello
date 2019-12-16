import { Router } from 'express';
import MediaStreamRouter from "./MediaStreamRouter";
import VisualizerRouter from "./VisualizerRouter";
import WebNavigationRouter from "./WebNavigationRouter";

// Init router and path
const router = Router();

// Add sub-routes
router.use('/mediastream', MediaStreamRouter);
router.use("/visualizer", VisualizerRouter);
router.use("/webnavigation", WebNavigationRouter);

// Export the base-router
export default router;
