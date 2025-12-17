import express from 'express';
import {
  getAllFestivalsController,
  getNearbyFestivalsController,
  getFilteredFestivalController,
  getFestivalsByTypeController
} from '../controllers/festivalController.js';

const router = express.Router();

/**
 * @swagger
 * /api/festivals:
 *   get:
 *     summary: Retrieve a list of all festivals
 *     responses:
 *       200:
 *         description: A list of festivals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Festival'
 */
router.get('/', getAllFestivalsController);

/**
 * @swagger
 * /api/festivals/nearby:
 *   get:
 *     summary: Retrieve a list of nearby festivals
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         required: true
 *         description: Latitude
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *         required: true
 *         description: Longitude
 *     responses:
 *       200:
 *         description: A list of nearby festivals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Festival'
 */
router.get('/nearby', getNearbyFestivalsController);

/**
 * @swagger
 * /api/festivals/category:
 *   get:
 *     summary: Retrieve a list of festivals filtered by category
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Festival category
 *     responses:
 *       200:
 *         description: A list of festivals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Festival'
 */
router.get('/category', getFilteredFestivalController);

/**
 * @swagger
 * /api/festivals/type:
 *   get:
 *     summary: Retrieve a list of festivals by type (indoor/outdoor)
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [indoor, outdoor]
 *         required: true
 *         description: Festival type
 *     responses:
 *       200:
 *         description: A list of festivals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Festival'
 */
router.get('/type', getFestivalsByTypeController);

/**
 * @swagger
 * /api/festivals/indoor:
 *   get:
 *     summary: Retrieve a list of indoor festivals
 *     responses:
 *       200:
 *         description: A list of indoor festivals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Festival'
 */
router.get('/indoor', getFestivalsByTypeController);

/**
 * @swagger
 * /api/festivals/outdoor:
 *   get:
 *     summary: Retrieve a list of outdoor festivals
 *     responses:
 *       200:
 *         description: A list of outdoor festivals.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Festival'
 */
router.get('/outdoor', getFestivalsByTypeController);

// 반드시 default export 추가!
export default router;
