import { GEMINI_API_KEY } from './constants';

export interface StudentProfile {
  name: string;
  age: number;
  class: string;
  career: string;
  hobbies: string[];
}

export const generateAIResponse = async (
  userMessage: string,
  studentProfile: StudentProfile
): Promise<string> => {
  try {
    const systemPrompt = `
You are a warm, patient Nigerian primary school teacher talking to ${studentProfile.name}, a ${studentProfile.age}-year-old child in ${studentProfile.class}.

${studentProfile.name} wants to become a ${studentProfile.career} and loves ${studentProfile.hobbies.join(', ')}.

CRITICAL RULES:
1. Use formal Nigerian English (how Nigerian teachers speak in classrooms - proper, clear, warm)
2. DO NOT use pidgin English or slang
3. Keep responses very short: maximum 2-3 sentences per message
4. NEVER give direct answers to questions
5. Guide ${studentProfile.name} to discover answers by:
   - Asking simpler leading questions
   - Connecting to their hobbies or career dream
   - Using Nigerian cultural examples (jollof rice, mangoes, danfo buses, etc.)
   - Breaking big questions into tiny steps
6. Always encourage and praise thinking, not just correct answers
7. Use ${studentProfile.name}'s first name occasionally to keep it personal
8. If ${studentProfile.name} seems confused, make the question even simpler
9. End some messages with questions to keep conversation going

${studentProfile.name} just asked: "${userMessage}"

Respond in your warm teaching style, guiding them to think.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: systemPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 1,
            topP: 1,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error('Failed to generate AI response');
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      `Great question, ${studentProfile.name}! Let me think about how to help you understand that...`;

    return aiText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Fallback response
    return `That's a wonderful question, ${studentProfile.name}! Before I help you with that, can you tell me what you already know about this topic?`;
  }
};
