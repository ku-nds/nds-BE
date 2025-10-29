import fs from 'fs';
import sequelize from '../config/db.js';

const outputFile = './festival_events_export.sql';

(async () => {
  try {
    console.log('📦 festival_events 테이블 데이터 조회 중...');

    // 1️⃣ 스키마(컬럼명) 조회
    const [columnsResult] = await sequelize.query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'festival_events'
      ORDER BY ordinal_position;
    `);

    const columns = columnsResult.map(c => c.column_name);
    console.log('🧱 컬럼 목록:', columns);

    // 2️⃣ 전체 데이터 조회
    const [rows] = await sequelize.query(`SELECT * FROM festival_events;`);

    // 3️⃣ CREATE TABLE 쿼리 생성 (기본 타입 단순화)
    let createTableSQL = `
CREATE TABLE festival_events (
  ${columns.map(c => `"${c}" TEXT`).join(',\n  ')}
);
`;

    // 4️⃣ INSERT 쿼리 생성
    let insertSQL = '';
    for (const row of rows) {
      const values = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (typeof val === 'number') return val;
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      insertSQL += `INSERT INTO festival_events (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
    }

    // 5️⃣ 파일로 저장
    const fullSQL = `${createTableSQL}\n${insertSQL}`;
    fs.writeFileSync(outputFile, fullSQL, 'utf8');

    console.log(`✅ SQL export 완료: ${outputFile}`);
  } catch (error) {
    console.error('❌ SQL export 중 오류:', error);
  } finally {
    await sequelize.close();
  }
})();
