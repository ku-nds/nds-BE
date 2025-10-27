// server.js
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '서울시 축제 추천 API 서버',
    version: '1.0.0',
  });
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버 실행: http://localhost:${PORT}`);
  console.log(`📁 환경: ${process.env.NODE_ENV || 'development'}`);
});
