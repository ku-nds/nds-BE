import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const FestivalEvent = sequelize.define('FestivalEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // 주요 정보
  event_name: { type: DataTypes.STRING(200), allowNull: false },
  category: { type: DataTypes.STRING(100) },
  district: { type: DataTypes.STRING(100) },
  place: { type: DataTypes.STRING(200) },
  organizer: { type: DataTypes.STRING(200) },

  // 날짜 / 시간
  start_date: { type: DataTypes.DATE },
  end_date: { type: DataTypes.DATE },
  datetime_info: { type: DataTypes.STRING(200) },
  event_time: { type: DataTypes.STRING(100) },

  // 설명 관련
  description: { type: DataTypes.TEXT },
  program_intro: { type: DataTypes.TEXT },
  performers: { type: DataTypes.TEXT },

  // 링크 / 이미지
  homepage: { type: DataTypes.TEXT },
  main_image: { type: DataTypes.TEXT },
  culture_portal_url: { type: DataTypes.TEXT },

  // 기타 정보
  target_audience: { type: DataTypes.STRING(200) },
  contact: { type: DataTypes.STRING(100) },
  theme_category: { type: DataTypes.STRING(100) },
  apply_date: { type: DataTypes.STRING(50) },
  citizen_org: { type: DataTypes.STRING(100) },
  is_free: { type: DataTypes.STRING(50) },

  // 위치 관련
  latitude: { type: DataTypes.DOUBLE },
  longitude: { type: DataTypes.DOUBLE },

  // ✅ PostGIS용 좌표 필드
  location: { type: DataTypes.GEOMETRY('POINT', 4326), allowNull: true },

  // 메타데이터
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'festival_events',
  timestamps: false,
});

export default FestivalEvent;
