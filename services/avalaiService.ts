import { ChatCompletionPayload, AvalAIResponse } from '../types';

export async function generateTopics(
  systemInstruction: string,
  userMessage: string,
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error('API_KEY در متغیرهای محیطی تعریف نشده است. لطفاً آن را تنظیم کنید.');
  }

  const payload: ChatCompletionPayload = {
    model: 'gemini-2.5-flash',
    messages: [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 800, // Increased max_tokens for potentially longer responses with 5 topics
  };

  try {
    const response = await fetch('https://api.avalai.ir/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`خطا در API: ${response.status} - ${errorData.message}`);
    }

    const data: AvalAIResponse = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('محتوایی از API AvalAI دریافت نشد.');
    }

    return content;
  } catch (error) {
    console.error('خطا در تولید موضوعات:', error);
    throw error;
  }
}