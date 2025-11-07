import OpenAI from "openai";
import { SYSTEM_INSTRUCTION, USER_PROMPT_TEMPLATE } from "../constants";
import { AcademicLevel } from "../types";

// API_KEY is set via Vite's 'define' in vite.config.ts, so it should be a string literal here.
// If VITE_API_KEY is not set in .env or Vercel, it will be 'undefined'.
const API_KEY_FROM_ENV = process.env.API_KEY as string | undefined;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!API_KEY_FROM_ENV || API_KEY_FROM_ENV === 'undefined') {
    throw new Error(
      "API_KEY (VITE_API_KEY in .env or Vercel environment variables) is not configured or is invalid. Please set it in your environment variables."
    );
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: API_KEY_FROM_ENV,
      baseURL: "https://api.avalai.ir/v1", // Hardcoded as per user's snippet
      dangerouslyAllowBrowser: true, // IMPORTANT: Allows the SDK to run in a browser environment.
                                     // This is safe here because we are using an API_KEY that refers to the AvalAI proxy,
                                     // which itself handles authentication with OpenAI, rather than a direct OpenAI API key.
    });
  }
  return openaiClient;
}

export async function generateTopicSuggestions(
  keywords: string,
  fieldOfStudy: string,
  academicLevel: AcademicLevel,
): Promise<string> {
  const userPromptContent = USER_PROMPT_TEMPLATE
    .replace('{fieldOfStudy}', fieldOfStudy)
    .replace('{academicLevel}', academicLevel)
    .replace('{keywords}', keywords);

  try {
    const client = getOpenAIClient();
    const chatCompletion = await client.chat.completions.create({
      model: "gpt-3.5-turbo", // A common and efficient model for AvalAI proxy
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        { role: "user", content: userPromptContent },
      ],
      temperature: 0.7,
      max_tokens: 800, // Limit output length
    });

    const responseText = chatCompletion.choices[0].message?.content;
    if (!responseText) {
      throw new Error("پاسخی از مدل دریافت نشد.");
    }
    return responseText;
  } catch (error: any) {
    console.error("OpenAI API Error (AvalAI Proxy):", error);
    let errorMessage = 'خطای ناشناخته در ارتباط با هوش مصنوعی.';

    // Attempt to extract a more specific error message from different error structures
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Specific error message for API key issues
    if (errorMessage.includes('Invalid API key') || errorMessage.includes('API key not valid')) {
      throw new Error(
        `خطا در ارتباط با هوش مصنوعی: کلید API معتبر نیست یا تعریف نشده است. لطفاً API_KEY خود را در فایل .env (در توسعه محلی) و متغیرهای محیطی Vercel (در دیپلوی) بررسی کنید و مطمئن شوید که یک کلید API فعال برای AvalAI است.`
      );
    }
    throw new Error(`خطا در ارتباط با هوش مصنوعی (AvalAI): ${errorMessage}`);
  }
}