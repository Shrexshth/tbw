import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/extract-invoice', upload.single('invoice'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const prompt = `
Extract the following fields from this invoice image. 
Return ONLY valid JSON matching this exact structure, with no markdown formatting, backticks, or extra text.
Do not wrap it in \`\`\`json.
If a field cannot be found, use null for strings or 0 for numbers.
Estimate your confidence for each field as a number between 0.0 and 1.0 in the field_confidence object based on image clarity and ambiguity.

{
  "vendor_name": "string",
  "vendor_gstin": "string",
  "invoice_number": "string",
  "invoice_date": "string",
  "taxable_value": 0,
  "cgst": 0,
  "sgst": 0,
  "igst": 0,
  "total_amount": 0,
  "field_confidence": {
    "vendor_name": 0.95,
    "vendor_gstin": 0.95,
    "invoice_number": 0.95,
    "taxable_value": 0.95,
    "cgst": 0.95,
    "sgst": 0.95,
    "igst": 0.95
  }
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype,
        },
      },
    ]);

    const text = result.response.text().trim();
    // In case the model returns markdown code block despite instructions
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
    
    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', cleanedText);
      return res.status(500).json({ error: 'Failed to parse extraction result' });
    }

    res.json(parsed);
  } catch (error) {
    console.error('Extraction error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during extraction' });
  }
});

const PORT = process.env.PORT || 3001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`API Server running on port ${PORT}`);
  });
}

export default app;
