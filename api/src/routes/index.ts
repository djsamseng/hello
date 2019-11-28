import { Router } from 'express';
import MediaStreamRouter from "./MediaStreamRouter";
import VisualizerRouter from "./VisualizerRouter";

// Init router and path
const router = Router();

// Add sub-routes
router.use('/mediastream', MediaStreamRouter);
router.use("/visualizer", VisualizerRouter);

// Export the base-router
export default router;
