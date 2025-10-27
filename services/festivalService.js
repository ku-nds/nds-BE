import sequelize from '../config/db.js';
import FestivalEvent from '../models/FestivalEvent.js';

/**
 * ✅ 전체 축제 조회
 */
export const getAllFestivals = async () => {
  return await FestivalEvent.findAll({
    attributes: [
      'id',
      'event_name',
      'category',
      'district',
      'place',
      'organizer',
      'theme_category',
      'start_date',
      'end_date',
      'datetime_info',
      'event_time',
      'latitude',
      'longitude',
      'is_free',
      'homepage',
      'main_image',
    ],
    order: [['start_date', 'ASC']],
  });
};

/**
 * ✅ PostGIS 기반 반경 3km 이내 축제 조회
 */
export const getNearbyFestivals = async (lat, lng) => {
  const query = `
    SELECT
      id,
      event_name,
      category,
      place,
      district,
      organizer,
      start_date,
      end_date,
      is_free,
      homepage,
      main_image,
      ST_DistanceSphere(location, ST_MakePoint(:lng, :lat)) AS distance
    FROM festival_events
    WHERE location IS NOT NULL
      AND ST_DistanceSphere(location, ST_MakePoint(:lng, :lat)) <= 3000
      AND (place NOT ILIKE '%hall%' AND place NOT ILIKE '%층%')
    ORDER BY distance ASC;
  `;

  const [rows] = await sequelize.query(query, {
    replacements: { lat, lng },
  });

  return rows;
};
