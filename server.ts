import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Gemini client if API key is present
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// API Health / Config status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'PlantIQ Manufacturing Intelligence',
    plant: 'Plant A — Sanand, Gujarat',
    aiService: {
      provider: aiClient ? 'Google Gemini (@google/genai)' : 'Embedded Industrial Expert Engine',
      model: aiClient ? 'gemini-3.8-flash' : 'Deterministic Automotive Rule Engine',
      hasApiKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
      migrationReady: 'TCS GenAI API adapter interface enabled'
    },
    databaseStatus: 'Supabase-Ready Schema v2.4 (Active in-memory transactional cache)'
  });
});

// AI Copilot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, plantContext, retrievedDocs } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format retrieved passages into prompt context
    let docsContext = '';
    if (Array.isArray(retrievedDocs) && retrievedDocs.length > 0) {
      docsContext = retrievedDocs
        .map(
          (doc: any, i: number) =>
            `[Source ${i + 1}]: "${doc.docTitle}" | ${doc.section} (Page ${doc.page}):\n"${doc.content}"`
        )
        .join('\n\n');
    }

    // System instruction grounded in PlantIQ domain
    const systemPrompt = `You are PlantIQ Copilot, an elite Tier-1 automotive manufacturing intelligence and operations assistant for ECU assembly operations at Plant A — Sanand.
The plant produces electronic control units (ECU-GEN5-PRO, ECU-POWERTRAIN-V2, ADAS-CTRL-UNIT, BCM-EV-400) for OEMs (Maruti Suzuki, Tata Motors, Mahindra, Hyundai) and sources electronic components from Tier-2 suppliers.

Plant Operations Context:
- Active Critical Shortages: SEN-2048 (Proximity sensor for SMT M-ASSY-03, 18-day port delay), MCU-110 (Infineon TriCore, 182-day lead time), FLT-05 (Hydraulic filter for CNC M-CNC-04).
- High Risk Machines: M-ASSY-03 has spindle vibration at 4.8 mm/s (threshold: 4.5 mm/s limit exceeded) and proximity sensor jitter; M-CNC-04 has 26% hydraulic oil level (threshold: 30% min).
- Real Calculation Rules:
  * Gross Demand = Sum(OEM ECU Demand * BOM Qty Per ECU)
  * Available Stock = On-Hand Stock - Reserved Stock
  * Net Replenishment = max(0, Gross Demand + Safety Stock - Available Stock - Incoming POs)

Retrieved Engineering & SOP Passages:
${docsContext || 'No direct documents matched; rely strictly on verified plant state.'}

Formatting Guidelines:
- Give professional, concise, structured engineering answers with markdown headings, bullet points, and data tables where helpful.
- ALWAYS cite document titles or sections when using procedural knowledge (e.g., [Ref: SOP-MNT-402 §3.1], [Ref: BOM-ECU-GEN5]).
- If no procedural manual covers an issue, state that clearly instead of hallucinating steps.
- Suggest concrete actions categorized into Procurement, Maintenance, or Risk mitigation.`;

    if (aiClient) {
      // Use official @google/genai SDK with gemini-3.8-flash
      const prompt = `${systemPrompt}\n\nUser Question: ${message}`;
      
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      const text = response.text || 'Unable to generate response from model.';
      
      return res.json({
        response: text,
        sources: Array.isArray(retrievedDocs)
          ? retrievedDocs.map((d: any) => ({
              docTitle: d.docTitle,
              section: d.section,
              page: d.page,
              score: d.relevanceScore
            }))
          : [],
        actions: [
          {
            type: 'PROCUREMENT',
            title: 'Verify Material Requirements',
            description: 'Inspect net replenishment calculations in Inventory & Forecasts.'
          },
          {
            type: 'MAINTENANCE',
            title: 'Check Equipment Telemetry',
            description: 'Monitor vibration and temperature curves on Machines & Spares.'
          }
        ]
      });
    }

    // If no client available, trigger structured domain fallback response
    return res.status(200).json({
      fallback: true,
      message: 'Processed via client domain expert service'
    });
  } catch (err: any) {
    console.error('AI chat endpoint error:', err);
    return res.status(500).json({
      error: 'AI Copilot service error',
      details: err?.message || 'Internal error'
    });
  }
});

// Setup Vite middleware in dev or serve static in prod
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      // If dist doesn't exist yet, run vite middleware as fallback
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa'
      });
      app.use(vite.middlewares);
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlantIQ manufacturing server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
