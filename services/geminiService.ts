import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, USER_PROMPT_TEMPLATE } from "../constants";
import { AcademicLevel } from "../types";

// API_KEY is set via Vite's 'define' in vite.config.ts, so it should be a string literal here.
// If VITE_API_KEY is not set in .env or Vercel, it will be 'undefined'.
const API_KEY_FROM_ENV = process.env.API_KEY as string | undefined;

// We'll defer the initialization of GoogleGenAI until getGenAIInstance is called,
// or at least handle the absence of API_KEY more gracefully at the point of use.
// This prevents a module-level error if API_KEY_FROM_ENV is undefined.

let aiInstance: GoogleGenAI | null = null;

function getGenAIInstance(): GoogleGenAI {
  if (!API_KEY_FROM_ENV || API_KEY_FROM_ENV === 'undefined') {
    throw new Error(
      "API_KEY (VITE_API_KEY in .env or Vercel environment variables) is not configured or is invalid. Please set it in your environment variables."
    );
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: API_KEY_FROM_ENV });
  }
  return aiInstance;
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
    const ai = getGenAIInstance(); // Get or initialize the instance here
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro", // Selected for Complex Text Tasks as per guidelines
      contents: [{ parts: [{ text: userPromptContent }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 800, // Limit output length
        thinkingConfig: { thinkingBudget: 256 }, // A reasonable thinking budget for complex tasks
      },
    });

    return response.text; // Direct access to the generated text
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = 'خطای ناشناخته در ارتباط با هوش مصنوعی.';

    // Attempt to extract a more specific error message
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response && error.response.error) {
      errorMessage = error.response.error.message || errorMessage;
    }

    // Specific error message for API key issues
    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key') || errorMessage.includes('API key is not specified')) {
      throw new Error(
        `خطا در ارتباط با هوش مصنوعی: کلید API معتبر نیست یا تعریف نشده است. لطفاً API_KEY خود را در فایل .env (در توسعه محلی) و متغیرهای محیطی Vercel (در دیپلوی) بررسی کنید و مطمئن شوید که یک کلید API فعال Gemini/Google GenAI است.`
      );
    }
    throw new Error(`خطا در ارتباط با هوش مصنوعی: ${errorMessage}`);
  }
}
