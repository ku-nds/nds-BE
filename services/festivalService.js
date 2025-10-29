import sequelize from '../config/db.js';
import FestivalEvent from '../models/FestivalEvent.js';
import { Op } from 'sequelize';

/**
 * 전체 축제 조회
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
 * PostGIS 기반 반경 3km 이내 축제 조회
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
      AND ST_DistanceSphere(location, ST_MakePoint(:lng, :lat)) <= 50
      AND (place NOT ILIKE '%hall%' AND place NOT ILIKE '%층%')
    ORDER BY distance ASC;
  `;

  const [rows] = await sequelize.query(query, {
    replacements: { lat, lng },
  });

  return rows;
};

/**
 * 카테고리별 축제 조회
 * - category 파라미터가 있으면 필터링
 * - 없으면 전체 목록 반환
 */
export const getFestivalsByCategory = async (category) => {
    const whereCondition = {};
  
    // category 파라미터가 있을 때만 조건 추가
    if (category) {
      whereCondition.category = { [Op.iLike]: `%${category}%` }; // 대소문자 무시 부분 일치 검색
    }
  
    const festivals = await FestivalEvent.findAll({
      attributes: [
        'id',
        'event_name',
        'category',
        'district',
        'place',
        'organizer',
        'start_date',
        'end_date',
        'is_free',
        'homepage',
        'main_image',
      ],
      where: whereCondition,
      order: [['start_date', 'ASC']],
    });
  
    return festivals;
  };

/**
 * 장소 유형(is_indoor)으로 축제 조회
 * - type === 'indoor'  => is_indoor = true
 * - type === 'outdoor' => is_indoor = false
 *
 * 이 함수는 DB 컬럼이 boolean이 아닌 text로 되어 있을 경우를 대비해
 * 먼저 boolean 비교를 시도하고 실패하면 문자열 비교('true'/'false', 't'/'f')로 폴백합니다.
 */
export const getFestivalsByType = async (type) => {
  if (!type) return [];

  const wantIndoor = type === 'indoor';

  // 공통 조회 옵션
  const attributes = [
    'id',
    'event_name',
    'category',
    'district',
    'place',
    'organizer',
    'start_date',
    'end_date',
    'is_free',
    'homepage',
    'main_image',
    'is_indoor',
    'latitude',
    'longitude',
  ];

  // 우선적으로 boolean 비교 시도 (정상적으로 boolean 컬럼이면 이게 통과)
  try {
    const festivals = await FestivalEvent.findAll({
      attributes,
      where: { is_indoor: wantIndoor },
      order: [['start_date', 'ASC']],
    });
    return festivals;
  } catch (err) {
    // boolean vs text 오류 등으로 실패하면 아래에서 폴백
    console.warn('boolean 비교 실패 — 문자열 폴백 시도:', err.message || err);
  }

  // 폴백: 문자열로 비교 ('true'/'false' 및 't'/'f' 케이스 처리)
  try {
    // DB에 저장된 문자열 값이 어떤 형태인지 환경에 따라 다르므로
    // 가능한 후보들을 OR 조건으로 한다.
    const strTrueCandidates = ['true', 't', '1', 'y', 'yes'];
    const strFalseCandidates = ['false', 'f', '0', 'n', 'no'];

    const whereCondition = wantIndoor
      ? {
          [Op.or]: strTrueCandidates.map(v => ({ is_indoor: v })),
        }
      : {
          [Op.or]: strFalseCandidates.map(v => ({ is_indoor: v })),
        };

    const festivals = await FestivalEvent.findAll({
      attributes,
      where: whereCondition,
      order: [['start_date', 'ASC']],
    });

    return festivals;
  } catch (err) {
    // 여기까지 실패하면 좀 더 직접적인 쿼리(캐스팅)로 시도하거나 에러를 던진다.
    console.error('문자열 폴백도 실패했습니다:', err);
    throw err; // 컨트롤러에서 500 처리
  }
};