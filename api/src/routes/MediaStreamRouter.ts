import { logger } from '@shared';
import { Request, Response, Router, Express } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { paramMissingError } from '@shared';
import { ParamsDictionary } from 'express-serve-static-core';
import MediaStreamManager from "../inputOutput/MediaStreamManager";
import Multer from "multer";
import multer from 'multer';

// Init shared
const router = Router();
const streamManager = new MediaStreamManager();

const upload = multer();

router.post('/addstream', upload.single("audio"), (req:Request, res:Response) => {
    console.log(new Int8Array(req.file.buffer)); // req.file.buffer is a buffer
    res.status(OK);
});

// /******************************************************************************
//  *                      Get All Users - "GET /api/users/all"
//  ******************************************************************************/
//
// router.get('/all', async (req: Request, res: Response) => {
//     try {
//         const users = await userDao.getAll();
//         return res.status(OK).json({users});
//     } catch (err) {
//         logger.error(err.message, err);
//         return res.status(BAD_REQUEST).json({
//             error: err.message,
//         });
//     }
// });
//
// /******************************************************************************
//  *                       Add One - "POST /api/users/add"
//  ******************************************************************************/
//
// router.post('/add', async (req: Request, res: Response) => {
//     try {
//         const { user } = req.body;
//         if (!user) {
//             return res.status(BAD_REQUEST).json({
//                 error: paramMissingError,
//             });
//         }
//         await userDao.add(user);
//         return res.status(CREATED).end();
//     } catch (err) {
//         logger.error(err.message, err);
//         return res.status(BAD_REQUEST).json({
//             error: err.message,
//         });
//     }
// });
//
// /******************************************************************************
//  *                       Update - "PUT /api/users/update"
//  ******************************************************************************/
//
// router.put('/update', async (req: Request, res: Response) => {
//     try {
//         const { user } = req.body;
//         if (!user) {
//             return res.status(BAD_REQUEST).json({
//                 error: paramMissingError,
//             });
//         }
//         user.id = Number(user.id);
//         await userDao.update(user);
//         return res.status(OK).end();
//     } catch (err) {
//         logger.error(err.message, err);
//         return res.status(BAD_REQUEST).json({
//             error: err.message,
//         });
//     }
// });
//
// /******************************************************************************
//  *                    Delete - "DELETE /api/users/delete/:id"
//  ******************************************************************************/
//
// router.delete('/delete/:id', async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params as ParamsDictionary;
//         await userDao.delete(Number(id));
//         return res.status(OK).end();
//     } catch (err) {
//         logger.error(err.message, err);
//         return res.status(BAD_REQUEST).json({
//             error: err.message,
//         });
//     }
// });
//

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
