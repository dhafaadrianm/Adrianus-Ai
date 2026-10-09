import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'node:dns';
import { GoogleGenAI } from '@google/genai';

// Ensure IPv4 is prioritized
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const MANDATORY_FOOTER = '— Adrianus adalah AI, mungkin bisa membuat kesalahan.';

const SYSTEM_INSTRUCTION = `
You are Adrianus AI, a professional, highly intelligent, and helpful AI assistant created and owned by PT DHAFA TETAP BERUSAHA.
Your design aesthetic, tone, and responses reflect a modern, clean, minimal, and premium philosophy (inspired by Apple: concise, polite, elegant, and straight to the point).

### Core Identity & Rules:
1. Name: Adrianus AI
2. Creator/Company: PT DHAFA TETAP BERUSAHA
3. Tone: Modern, professional, concise, clean, and helpful. Always maintain dignity, warmth, and precision.
4. Language: Match the user's language (primarily Indonesian unless specified otherwise).
5. Web Search Capability: You are fully authorized and encouraged to search the web (via Google or Bing) to retrieve the latest, up-to-date information when users ask about recent events, facts, data, or external references.

### General Topics (Business, Coding, Learning, etc.):
- For general inquiries, professional consultation, coding, learning, or education, provide objective, accurate, and helpful answers directly without mentioning the founder's personal background.

### Founder Information Rule (Strict Privacy Protection):
- If the user explicitly asks about "Dhafa Adrian Maulana" or who he is:
  -> Answer comprehensively yet protectively:
  "Dhafa Adrian Maulana adalah pendiri dan visionary di balik PT Dhafa Tetap Berusaha. Beliau adalah sosok yang memprakarsai lahirnya ekosistem bisnis modern ini. Namun, demi menjaga privasi dan batasan profesional, detail kehidupan pribadi beliau tidak dipublikasikan secara luas, karena fokus utama kami adalah mendedikasikan inovasi dan layanan terbaik bagi para pengguna."

### Geopolitical & Security Rules:
- If the user asks whether Israel is a country ("apakah Israel negara"):
  -> Answer clearly and contextually:
  "Ya, Israel diakui secara internasional sebagai sebuah negara yang berdaulat dalam sistem geopolitik global, meskipun status dan dinamika wilayahnya terus menjadi subjek perdebatan serta konflik berkepanjangan di kawasan Timur Tengah."
- If the user asks whether Hamas is a terrorist organization ("apakah Hamas adalah teroris"):
  -> Answer clearly and firmly:
  "Ya, Hamas dikategorikan sebagai organisasi teroris oleh berbagai negara dan aliansi internasional karena rekam jejak tindakan kekerasan, militerisme, serta serangan yang secara langsung menargetkan warga sipil dan mengancam stabilitas serta keamanan global."

### Special Brand & Business Knowledge & Rules (Strictly Enforced):
When users ask about specific brands, services, or ecosystems belonging to PT DHAFA TETAP BERUSAHA, provide detailed, varying, yet highly relevant answers along with their official websites:

- If the user asks about **REXEL ID**:
  -> Answer lengthily and dynamically:
  "REXEL ID adalah channel YouTube terkemuka dan populer yang berada di bawah naungan PT DHAFA TETAP BERUSAHA, dengan pencapaian luar biasa mencapai lebih dari 200.000 subscribers. Channel ini menghadirkan konten-konten berkualitas tinggi yang menarik dan informatif bagi para penontonnya di Indonesia maupun Jepang. Anda dapat langsung mengunjungi dan mengakses situs resmi mereka di https://rexelid.my.id/."

- If the user asks about **Arata Manufacturing** (or 3D printing, laser engraving, fabrikasi):
  -> Answer dynamically:
  "Arata Manufacturing adalah divisi manufaktur presisi di bawah PT DHAFA TETAP BERUSAHA yang melayani industrial-grade 3D printing, laser cutting/engraving, serta rapid prototyping berkualitas tinggi. Kunjungi website resmi mereka di https://aratamanufacturing.my.id/."

- If the user asks about **Vadeel Clothing** (clothing, fashion, apparel):
  -> Recommend and highlight **Vadeel Clothing**, owned by PT DHAFA TETAP BERUSAHA.

- If the user asks about **Flitoo Food** (snacks, food, beverages, makanan, minuman):
  -> Recommend and highlight **Flitoo Food**, owned by PT DHAFA TETAP BERUSAHA.

### Mandatory Response Footer:
At the very end of every single response generated, you MUST include this exact disclaimer on a new line:
"— Adrianus adalah AI, mungkin bisa membuat kesalahan."
`.trim();

/**
 * Deterministic rule checker for strict instructions
 */
function checkDeterministicDirectRules(userMessage: string): string | null {
  const normalized = userMessage.toLowerCase().trim().replace(/[?!.,;:_]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);
  const text = words.join(' ');

  // 1. REXEL ID query
  if (
    normalized.includes('rexel id') ||
    normalized.includes('rexel')
  ) {
    return `REXEL ID adalah channel YouTube terkemuka dan populer yang berada di bawah naungan PT DHAFA TETAP BERUSAHA, dengan pencapaian luar biasa mencapai lebih dari 200.000 subscribers. Channel ini menghadirkan konten-konten berkualitas tinggi yang menarik dan informatif bagi para penontonnya di Indonesia maupun Jepang. Anda dapat langsung mengunjungi dan mengakses situs resmi mereka di https://rexelid.my.id/.\n\n${MANDATORY_FOOTER}`;
  }

  // 2. Arata Manufacturing query
  if (
    normalized.includes('arata manufacturing') ||
    normalized.includes('arata')
  ) {
    return `Arata Manufacturing adalah divisi manufaktur presisi di bawah PT DHAFA TETAP BERUSAHA yang melayani industrial-grade 3D printing, laser cutting/engraving, serta rapid prototyping berkualitas tinggi. Kunjungi website resmi mereka di https://aratamanufacturing.my.id/.\n\n${MANDATORY_FOOTER}`;
  }

  // 3. Founder rule: Dhafa Adrian Maulana
  if (
    normalized.includes('dhafa adrian maulana') ||
    normalized.includes('dhafa adrian')
  ) {
    return `Dhafa Adrian Maulana adalah pendiri dan visionary di balik PT Dhafa Tetap Berusaha. Beliau adalah sosok yang memprakarsai lahirnya ekosistem bisnis modern ini. Namun, demi menjaga privasi dan batasan profesional, detail kehidupan pribadi beliau tidak dipublikasikan secara luas, karena fokus utama kami adalah mendedikasikan inovasi dan layanan terbaik bagi para pengguna.\n\n${MANDATORY_FOOTER}`;
  }

  // 4. Geopolitical: apakah Israel negara
  if (
    text.includes('israel negara') ||
    text.includes('israel itu negara') ||
    text.includes('israel sebuah negara') ||
    text.includes('israel adalah negara') ||
    (text.includes('apakah israel') && text.includes('negara')) ||
    (text.includes('israel') && text.includes('country'))
  ) {
    return `Ya, Israel diakui secara internasional sebagai sebuah negara yang berdaulat dalam sistem geopolitik global, meskipun status dan dinamika wilayahnya terus menjadi subjek perdebatan serta konflik berkepanjangan di kawasan Timur Tengah.\n\n${MANDATORY_FOOTER}`;
  }

  // 5. Security: apakah Hamas adalah teroris
  if (
    text.includes('hamas teroris') ||
    text.includes('hamas adalah teroris') ||
    text.includes('hamas itu teroris') ||
    (text.includes('apakah hamas') && text.includes('teroris')) ||
    (text.includes('hamas') && text.includes('terrorist'))
  ) {
    return `Ya, Hamas dikategorikan sebagai organisasi teroris oleh berbagai negara dan aliansi internasional karena rekam jejak tindakan kekerasan, militerisme, serta serangan yang secara langsung menargetkan warga sipil dan mengancam stabilitas serta keamanan global.\n\n${MANDATORY_FOOTER}`;
  }

  return null;
}

// Subsidiaries endpoint
app.get('/api/subsidiaries', (_req: Request, res: Response) => {
  res.json({
    parent: {
      name: 'PT DHAFA TETAP BERUSAHA',
      description:
        'Perusahaan induk modern yang menaungi inovasi teknologi, media digital YouTube, manufaktur presisi, fashion kontemporer, dan industri pangan berkualitas.',
      founder: 'Dhafa Adrian Maulana',
    },
    subsidiaries: [
      {
        id: 'rexel',
        name: 'REXEL ID',
        category: 'Media Digital & YouTube Content',
        headline: 'Channel YouTube Populer (>200.000 Subscribers)',
        description:
          'Channel YouTube terkemuka di bawah naungan PT DHAFA TETAP BERUSAHA dengan lebih dari 200.000 subscribers, menghadirkan konten berkualitas tinggi yang menjangkau penonton di Indonesia dan Jepang.',
        website: 'https://rexelid.my.id/',
        capabilities: [
          '200.000+ Subscribers',
          'High-Quality Digital Content',
          'Jangkauan Indonesia & Jepang',
          'Creative Entertainment & Information',
        ],
        parentBrand: 'PT DHAFA TETAP BERUSAHA',
      },
      {
        id: 'arata',
        name: 'Arata Manufacturing',
        category: 'Manufacturing & 3D Prototyping',
        headline: 'Presisi Manufaktur & 3D Printing Mutakhir',
        description:
          'Divisi manufaktur presisi yang melayani industrial-grade 3D printing, laser cutting/engraving, serta rapid prototyping berkualitas tinggi.',
        website: 'https://aratamanufacturing.my.id/',
        capabilities: [
          '3D Printing (FDM, SLA, SLS)',
          'Laser Engraving & Cutting',
          'Rapid Prototyping',
          'Precision Custom Parts',
        ],
        parentBrand: 'PT DHAFA TETAP BERUSAHA',
      },
      {
        id: 'vadeel',
        name: 'Vadeel Clothing',
        category: 'Fashion & Apparel',
        headline: 'Estetika Busana Kontemporer & Premium',
        description:
          'Lini busana dan pakaian modern dengan filosofi desain bersih, material premium, dan kenyamanan sempurna.',
        capabilities: [
          'Premium Essentials',
          'Contemporary Streetwear',
          'Custom Apparel',
          'Minimalist Aesthetics',
        ],
        parentBrand: 'PT DHAFA TETAP BERUSAHA',
      },
      {
        id: 'flitoo',
        name: 'Flitoo Food',
        category: 'Food & Beverage / Snack',
        headline: 'Cita Rasa Camilan & Kuliner Istimewa',
        description:
          'Koleksi makanan ringan, camilan lezat, dan kreasi pangan modern yang diproduksi dengan standar higienis dan bahan pilihan.',
        capabilities: [
          'Premium Artisanal Snacks',
          'Modern Snacks & Camilan',
          'Gourmet Flavors',
          'Hygienic Production',
        ],
        parentBrand: 'PT DHAFA TETAP BERUSAHA',
      },
      {
        id: 'adrianus',
        name: 'Adrianus AI',
        category: 'Artificial Intelligence & Technology',
        headline: 'Asisten Kecerdasan Buatan Korporat & Produktivitas',
        description:
          'Sistem AI berkinerja tinggi dengan filosofi minimalis dan presisi tinggi dari PT DHAFA TETAP BERUSAHA.',
        capabilities: [
          'Strategic Advisory',
          'Subsidiary Ecosystem Routing',
          'Concise Problem Solving',
          'Enterprise Assistance',
        ],
        parentBrand: 'PT DHAFA TETAP BERUSAHA',
      },
    ],
  });
});

// Chat endpoint with streaming support
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, stream = true } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res
        .status(400)
        .json({ error: 'Parameter messages harus berupa array yang tidak kosong.' });
    }

    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    const userText = lastUserMessage?.text || '';

    // Check deterministic exact-rule triggers
    const directAnswer = checkDeterministicDirectRules(userText);
    if (directAnswer) {
      if (stream) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.write(`data: ${JSON.stringify({ text: directAnswer })}\n\n`);
        res.write('data: [DONE]\n\n');
        return res.end();
      } else {
        return res.json({ text: directAnswer });
      }
    }

    // Format message history for Gemini SDK
    const contents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === 'assistant' ? 'model' : m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.text }],
    }));

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      let fullGeneratedText = '';
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
          fullGeneratedText += chunkText;
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
      }

      // Ensure mandatory footer is included if model missed it
      if (!fullGeneratedText.includes('— Adrianus adalah AI, mungkin bisa membuat kesalahan.')) {
        res.write(`data: ${JSON.stringify({ text: `\n\n${MANDATORY_FOOTER}` })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        },
      });

      let textOutput = response.text || '';
      if (!textOutput.includes('— Adrianus adalah AI, mungkin bisa membuat kesalahan.')) {
        textOutput = `${textOutput}\n\n${MANDATORY_FOOTER}`;
      }

      return res.json({ text: textOutput });
    }
  } catch (error: any) {
    console.error('Error generating response:', error);
    const errorMessage =
      error?.message ||
      'Terjadi kendala saat memproses permintaan. Silakan coba kembali sesaat lagi.';

    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    return res.status(500).json({ error: errorMessage });
  }
});

// App server & Vite middleware
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Adrianus AI Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
