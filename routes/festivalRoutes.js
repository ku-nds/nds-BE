import express from 'express';
import {
  getAllFestivalsController,
  getNearbyFestivalsController,
  getFilteredFestivalController,
  getFestivalsByTypeController,
  getShortestPathController,
  getFestivalAmenitiesController
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

/**
 * @swagger
 * /api/festivals/route:
 *   post:
 *     summary: Calculate the shortest path between multiple festivals
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               festival_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: An array of festival IDs to visit.
 *             example:
 *               festival_ids: [1, 2, 3]
 *     responses:
 *       200:
 *         description: The optimal route and total distance.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 optimal_path:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Festival'
 *                 total_distance_km:
 *                   type: number
 *       400:
 *         description: Invalid input, e.g., not enough festival IDs.
 */
router.post('/route', getShortestPathController);

/**
 * @swagger
 * /api/festivals/{id}/amenities:
 *   get:
 *     summary: Retrieve nearby amenities (subway, restaurant, parking) for a specific festival
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the festival
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *           minimum: 500
 *           maximum: 5000
 *           default: 1000
 *         required: false
 *         description: Search radius in meters (500m to 5000m)
 *     responses:
 *       200:
 *         description: An object containing lists of nearby subways, restaurants, and parking lots.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 festivalId:
 *                   type: integer
 *                 festivalName:
 *                   type: string
 *                 amenities:
 *                   type: object
 *                   properties:
 *                     subway:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           place_name: { type: string }
 *                           distance: { type: string }
 *                           x: { type: string }
 *                           y: { type: string }
 *                     restaurant:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           place_name: { type: string }
 *                           distance: { type: string }
 *                           x: { type: string }
 *                           y: { type: string }
 *                     parking:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           place_name: { type: string }
 *                           distance: { type: string }
 *                           x: { type: string }
 *                           y: { type: string }
 *       400:
 *         description: Bad request, e.g., missing festival location info.
 *       404:
 *         description: Festival not found.
 *       500:
 *         description: Server error or Kakao API key not configured.
 */
router.get('/:id/amenities', getFestivalAmenitiesController);

// 반드시 default export 추가!
export default router;
