import sequelize from '../config/db.js';

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 연결 성공');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log('✅ test_table 생성 완료');
  } catch (e) {
    console.error('❌ 오류 발생:', e);
  } finally {
    await sequelize.close();
  }
})();
