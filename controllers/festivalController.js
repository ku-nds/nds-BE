import { getAllFestivals, getNearbyFestivals } from '../services/festivalService.js';

/**
 * ✅ 전체 축제 조회
 */
export const getAllFestivalsController = async (req, res) => {
  try {
    const festivals = await getAllFestivals();
    res.status(200).json({
      count: festivals.length,
      data: festivals,
    });
  } catch (error) {
    console.error('❌ getAllFestivalsController Error:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

/**
 * ✅ 반경 3km 이내 축제 조회 (PostGIS 활용)
 * 예시 요청: /api/festivals/nearby?lat=37.5665&lng=126.9780
 */
export const getNearbyFestivalsController = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat, lng 쿼리 파라미터가 필요합니다.' });
    }

    const festivals = await getNearbyFestivals(lat, lng);

    res.status(200).json({
      count: festivals.length,
      data: festivals,
    });
  } catch (error) {
    console.error('❌ getNearbyFestivalsController Error:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};
