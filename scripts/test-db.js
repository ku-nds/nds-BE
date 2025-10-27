import sequelize from '../config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');
    const [rows] = await sequelize.query('SELECT current_database() AS db, version() AS ver');
    console.log('🎯 연결된 DB:', rows[0].db);
    console.log('🧠 버전:', rows[0].ver);
  } catch (err) {
    console.error('❌ 연결 실패:', err);
  } finally {
    await sequelize.close();
  }
})();
