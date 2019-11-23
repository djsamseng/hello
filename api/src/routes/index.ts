import { Router } from 'express';
import MediaStreamRouter from "./MediaStreamRouter";

// Init router and path
const router = Router();

// Add sub-routes
router.use('/mediastream', MediaStreamRouter);

// Export the base-router
export default router;
