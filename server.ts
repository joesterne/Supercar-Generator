import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for generating car images
  app.post('/api/generate-car', async (req, res) => {
    try {
      const { engine, bodyKit, color, style, environment } = req.body;
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `A highly detailed, photorealistic 3D render of a supercar with a ${bodyKit} body kit, painted in ${color}. The car has a ${style} aesthetic. The setting is ${environment}. Professional automotive photography, 8k resolution, dramatic lighting, showcasing aerodynamic features.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: prompt,
        config: {
          imageConfig: {
            aspectRatio: '16:9',
            imageSize: '1K',
          },
        },
      });

      let base64Image = null;
      if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            base64Image = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (base64Image) {
        res.json({ success: true, image: base64Image });
      } else {
        res.status(500).json({ success: false, error: 'Failed to generate image parts.' });
      }

    } catch (error: any) {
      console.error('Error generating car image:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
