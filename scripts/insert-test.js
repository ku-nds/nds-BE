import dotenv from 'dotenv';
import sequelize from '../config/db.js';

dotenv.config();

(async () => {
  try {
    // DB 연결
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');

    // 1️⃣ 데이터 삽입
    const insertQuery = `
      INSERT INTO test_table (name)
      VALUES ('Node.js 테스트 입력 - ${new Date().toISOString()}')
      RETURNING *;
    `;
    const [insertedRows] = await sequelize.query(insertQuery);
    console.log('📦 삽입된 데이터:', insertedRows[0]);

    // 2️⃣ 데이터 조회
    const [rows] = await sequelize.query(`
      SELECT * FROM test_table
      ORDER BY id DESC
      LIMIT 5;
    `);

    console.log('📜 최근 5개 데이터:');
    rows.forEach(r => {
      console.log(`- [${r.id}] ${r.name} (${r.created_at})`);
    });

  } catch (err) {
    console.error('❌ 오류 발생:', err);
  } finally {
    await sequelize.close();
    console.log('🔒 DB 연결 종료');
  }
})();
