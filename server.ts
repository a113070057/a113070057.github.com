import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

let aiClient: GoogleGenAI | null = null;

// Lazy initialization of Gemini SDK as required to prevent crash on missing key
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn('GEMINI_API_KEY environment variable is missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key || 'MOCK_KEY',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint: Provide AI puzzle hint using server-side Gemini call
  app.post('/api/gemini-hint', async (req, res) => {
    try {
      const { grid, solution, suggestedRow, suggestedCol, suggestedValue, difficulty } = req.body;
      
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        return res.json({
          success: false,
          error: 'Missing GEMINI_API_KEY',
          hint: `提示：第 ${suggestedRow + 1} 行、第 ${suggestedCol + 1} 列，答案是 ${suggestedValue}。利用唯餘法（Naked Single）可以發現此格為當前九宮格內唯一的可能答案！`
        });
      }

      const ai = getGeminiClient();

      const prompt = `
        你是一個專業的「數獨大師 (Sudoku Coach)」教學助手。
        目前玩家正在進行 ${difficulty} 難度的數獨挑戰。
        當前 9x9 棋盤格子陣列狀態如下（0 代表空格）：
        ${JSON.stringify(grid)}

        完整正確的解密解答陣列為：
        ${JSON.stringify(solution)}

        現在請你針對第 ${suggestedRow + 1} 行 (1-indexed)、第 ${suggestedCol + 1} 列 (1-indexed) 這個空格，
        說明為什麼這個格子的正確數字應該填入 ${suggestedValue}。
        請用繁體中文回覆。說明需要親切、邏輯清晰、具備啟發性：
        1. 點出精準的行列坐標（例如：第 ${suggestedRow + 1} 行，第 ${suggestedCol + 1} 列）。
        2. 指出該填入的正確數字（ ${suggestedValue} ）。
        3. 運用經典數獨術語（如：宮排除、唯餘法、行列排除、區塊對位等）解釋為什麼只能填入此數，排除其他哪些數字。
        4. 字數控制在 150 字以內，語氣正面多加鼓勵。
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const hintText = response.text ? response.text.trim() : '';

      return res.json({
        success: true,
        hint: hintText || `智力提示：觀察第 ${suggestedRow + 1} 行、第 ${suggestedCol + 1} 列，經交叉對位後在該宮九宮格與同行中，填入 ${suggestedValue} 是唯一必然的解答。`
      });

    } catch (err: any) {
      console.error('Gemini call error:', err);
      return res.json({
        success: false,
        error: err.message,
        hint: `提示：請觀察第 ${req.body.suggestedRow + 1} 行、第 ${req.body.suggestedCol + 1} 列，對位可得數字 ${req.body.suggestedValue}。這是宮格、列與行中唯一的填法。`
      });
    }
  });

  // Serve static assets in production, configure Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sudoku Master Server initialized on http://localhost:${PORT}`);
  });
}

startServer();
