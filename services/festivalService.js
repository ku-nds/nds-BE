import axios from 'axios';
import sequelize from '../config/db.js';
import FestivalEvent from '../models/FestivalEvent.js';
import { Op } from 'sequelize';

/**
 * 전체 축제 조회
 */
export const getAllFestivals = async ({ limit, offset }) => {
  return await FestivalEvent.findAndCountAll({
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
    limit,
    offset,
  });
};

/**
 * 특정 ID의 축제 정보 조회
 * @param {number} id - 축제 ID
 */
export const getFestivalById = async (id) => {
  return await FestivalEvent.findByPk(id, {
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
  });
};

/**
 * PostGIS 기반 반경 3km 이내 축제 조회
 */
export const getNearbyFestivals = async (lat, lng, { limit, offset }) => {
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
    ORDER BY distance ASC
    LIMIT :limit OFFSET :offset;
  `;

  const countQuery = `
    SELECT COUNT(1) AS total
    FROM festival_events
    WHERE location IS NOT NULL
      AND ST_DistanceSphere(location, ST_MakePoint(:lng, :lat)) <= 3000
      AND (place NOT ILIKE '%hall%' AND place NOT ILIKE '%층%');
  `;

  const [rows] = await sequelize.query(query, {
    replacements: { lat, lng, limit, offset },
  });
  const [countRows] = await sequelize.query(countQuery, {
    replacements: { lat, lng },
  });

  return { rows, count: Number(countRows?.[0]?.total || 0) };
};

/**
 * 카테고리별 축제 조회
 * - category 파라미터가 있으면 필터링
 * - 없으면 전체 목록 반환
 */
export const getFestivalsByCategory = async (category, { limit, offset }) => {
    const whereCondition = {};
  
    // category 파라미터가 있을 때만 조건 추가
    if (category) {
      whereCondition.category = { [Op.iLike]: `%${category}%` }; // 대소문자 무시 부분 일치 검색
    }
  
    const festivals = await FestivalEvent.findAndCountAll({
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
      limit,
      offset,
    });
  
    return festivals; // { rows, count }
  };

/**
 * 장소 유형(is_indoor)으로 축제 조회
 * - type === 'indoor'  => is_indoor = true
 * - type === 'outdoor' => is_indoor = false
 *
 * 이 함수는 DB 컬럼이 boolean이 아닌 text로 되어 있을 경우를 대비해
 * 먼저 boolean 비교를 시도하고 실패하면 문자열 비교('true'/'false', 't'/'f')로 폴백합니다.
 */
export const getFestivalsByType = async (type, { limit, offset }) => {
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
    const festivals = await FestivalEvent.findAndCountAll({
      attributes,
      where: { is_indoor: wantIndoor },
      order: [['start_date', 'ASC']],
      limit,
      offset,
    });
    return festivals; // { rows, count }
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

    const festivals = await FestivalEvent.findAndCountAll({
      attributes,
      where: whereCondition,
      order: [['start_date', 'ASC']],
      limit,
      offset,
    });

    return festivals; // { rows, count }
  } catch (err) {
    // 여기까지 실패하면 좀 더 직접적인 쿼리(캐스팅)로 시도하거나 에러를 던진다.
    console.error('문자열 폴백도 실패했습니다:', err);
    throw err; // 컨트롤러에서 500 처리
  }
};


// --- 최단 경로 계산 ---

/**
 * 두 지점 간의 직선 거리(Haversine 공식) 계산
 * @param {{ latitude: number, longitude: number }} point1
 * @param {{ latitude: number, longitude: number }} point2
 * @returns {number} Distance in kilometers
 */
function haversineDistance(point1, point2) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (point2.latitude - point1.latitude) * (Math.PI / 180);
    const dLon = (point2.longitude - point1.longitude) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(point1.latitude * (Math.PI / 180)) *
        Math.cos(point2.latitude * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * 배열의 모든 순열을 생성하는 함수
 * @param {Array} arr The input array
 * @returns {Array<Array>} An array of all permutations
 */
function getPermutations(arr) {
    if (arr.length === 1) {
        return [arr];
    }
    const permutations = [];
    for (let i = 0; i < arr.length; i++) {
        const current = arr[i];
        const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
        const remainingPerms = getPermutations(remaining);
        for (let j = 0; j < remainingPerms.length; j++) {
            permutations.push([current].concat(remainingPerms[j]));
        }
    }
    return permutations;
}

/**
 * 여러 축제 장소 간의 최단 경로 계산
 * @param {number[]} festival_ids
 */
export async function getShortestPath(festival_ids) {
    // 1. ID로 축제 정보(특히 좌표) 조회
    const festivals = await FestivalEvent.findAll({
        where: {
            id: { [Op.in]: festival_ids }
        },
        attributes: ['id', 'event_name', 'place', 'latitude', 'longitude']
    });

    if (festivals.length !== festival_ids.length) {
        const foundIds = festivals.map(f => f.id);
        const missingIds = festival_ids.filter(id => !foundIds.includes(id));
        throw new Error(`다음 ID에 해당하는 축제를 찾을 수 없습니다: ${missingIds.join(', ')}`);
    }

    // 2. 거리 매트릭스 생성 (실제로는 API 호출 대신 haversineDistance 사용)
    const distanceMatrix = {};
    for (const f1 of festivals) {
        distanceMatrix[f1.id] = {};
        for (const f2 of festivals) {
            if (f1.id === f2.id) {
                distanceMatrix[f1.id][f2.id] = 0;
            } else {
                distanceMatrix[f1.id][f2.id] = haversineDistance(f1, f2);
            }
        }
    }

    // 3. 모든 경로 순열을 탐색하여 최단 경로 찾기
    const festivalPermutations = getPermutations(festivals);
    let bestPath = [];
    let minDistance = Infinity;

    for (const path of festivalPermutations) {
        let currentDistance = 0;
        for (let i = 0; i < path.length - 1; i++) {
            currentDistance += distanceMatrix[path[i].id][path[i + 1].id];
        }
        if (currentDistance < minDistance) {
            minDistance = currentDistance;
            bestPath = path;
        }
    }

    return {
        optimal_path: bestPath,
        total_distance_km: minDistance
    };
}

/**
 * 특정 위도/경도 주변의 편의시설(지하철역, 맛집, 주차장) 정보를 카카오 API를 통해 조회합니다.
 * @param {number} latitude - 중심점의 위도
 * @param {number} longitude - 중심점의 경도
 * @param {number} radius - 검색 반경 (미터 단위, 기본값 1000m)
 * @returns {object} 주변 편의시설 목록 (subway, restaurant, parking)
 */
export const getNearbyAmenities = async (latitude, longitude, radius = 1000) => {
  const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY;
  if (!KAKAO_API_KEY) {
    throw new Error('KAKAO_REST_API_KEY is not set in environment variables.');
  }

  const KAKAO_API_BASE_URL = 'https://dapi.kakao.com/v2/local/search/category.json';

  // 카테고리 그룹 코드
  const categories = {
    subway: 'SW8', // 지하철역
    restaurant: 'FD6', // 음식점
    parking: 'PK6', // 주차장
  };

  const amenityPromises = Object.entries(categories).map(async ([type, categoryCode]) => {
    try {
      const response = await axios.get(KAKAO_API_BASE_URL, {
        headers: {
          Authorization: `KakaoAK ${KAKAO_API_KEY}`,
        },
        params: {
          category_group_code: categoryCode,
          x: longitude, // 카카오는 x가 경도, y가 위도
          y: latitude,
          radius: radius,
          size: 10, // 각 카테고리별 최대 10개 결과
        },
      });
      return { type, items: response.data.documents };
    } catch (error) {
      console.error(`Error fetching ${type} from Kakao API:`, error.message);
      return { type, items: [] }; // 에러 발생 시 빈 배열 반환
    }
  });

  const results = await Promise.all(amenityPromises);

  // 결과를 { subway: [...], restaurant: [...], parking: [...] } 형태로 변환
  return results.reduce((acc, current) => {
    acc[current.type] = current.items;
    return acc;
  }, {});
};