// API route for handling AI chat requests
// In a real production setup, this would be a backend endpoint

import { generateAIResponse } from '@/lib/gemini';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userMessage, studentProfile } = req.body;

    if (!userMessage || !studentProfile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const aiResponse = await generateAIResponse(userMessage, studentProfile);

    return res.status(200).json({ response: aiResponse });
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
