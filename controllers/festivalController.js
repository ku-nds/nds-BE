import { getAllFestivals, getNearbyFestivals, getFestivalsByType } from '../services/festivalService.js';

/**
 * 전체 축제 조회
 */
export const getAllFestivalsController = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await getAllFestivals({ limit, offset });
    res.status(200).json({
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ getAllFestivalsController Error:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

/**
 * 반경 3km 이내 축제 조회 (PostGIS 활용)
 * 예시 요청: /api/festivals/nearby?lat=37.5665&lng=126.9780
 */
export const getNearbyFestivalsController = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat, lng 쿼리 파라미터가 필요합니다.' });
    }

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await getNearbyFestivals(lat, lng, { limit, offset });

    res.status(200).json({
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ getNearbyFestivalsController Error:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

import { getFestivalsByCategory } from '../services/festivalService.js';

/**
 * 카테고리별 축제 조회
 * 예시 요청: /api/festivals?category=공연
 */
export const getFilteredFestivalController = async (req, res) => {
  try {
    const { category } = req.query;
    console.log('🎯 category query param:', category); // ✅ 확인용

    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const { rows, count } = await getFestivalsByCategory(category, { limit, offset });

    res.status(200).json({
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ getFilteredFestivalController Error:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};

/**
 * 장소 유형(실내/실외)으로 축제 조회
 * - 쿼리: /api/festivals/type?type=indoor  또는 /api/festivals/type?type=outdoor
 * - 별칭: /api/festivals/indoor, /api/festivals/outdoor 로도 접근 가능
 */


export const getFestivalsByTypeController = async (req, res) => {
  try {
    // type은 'indoor' 또는 'outdoor' 기대
    // 라우터에 따라 req.params.type 으로 받을 수도 있게 유연 처리
    const typeQuery = req.query.type || req.params.type;

    if (!typeQuery) {
      return res.status(400).json({ error: 'type 쿼리 파라미터가 필요합니다. (indoor|outdoor)' });
    }

    const type = typeQuery.toLowerCase();
    if (type !== 'indoor' && type !== 'outdoor') {
      return res.status(400).json({ error: '유효하지 않은 type 값입니다. indoor 또는 outdoor 를 사용하세요.' });
    }

    // 서비스에 'indoor' | 'outdoor' 전달
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
    const offset = (page - 1) * limit;

    const result = await getFestivalsByType(type, { limit, offset });
    // getFestivalsByType은 findAndCountAll을 반환함
    const rows = result.rows || result; // 안전 폴백
    const total = result.count ?? rows.length;

    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('❌ getFestivalsByTypeController Error:', error);
    res.status(500).json({ error: '서버 에러 발생' });
  }
};
