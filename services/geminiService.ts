import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION, USER_PROMPT_TEMPLATE } from "../constants";
import { AcademicLevel } from "../types";

// Access environment variables via process.env as defined in vite.config.ts
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This error will likely be caught by the UI component for a friendlier message.
  // But for direct service usage, it's good to have.
  throw new Error(
    "API_KEY (باید در .env به صورت VITE_API_KEY تعریف شود) در متغیرهای محیطی در دسترس نیست. لطفاً فایل .env خود را بررسی و سرور را ریستارت کنید."
  );
}

// Initialize GoogleGenAI client once as the API_KEY is static at build time.
const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('Invalid API key')) {
      throw new Error(
        `خطا در ارتباط با هوش مصنوعی: کلید API معتبر نیست یا تعریف نشده است. لطفاً API_KEY خود را در فایل .env بررسی کنید و مطمئن شوید که یک کلید API فعال Gemini/Google GenAI است.`
      );
    }
    throw new Error(`خطا در ارتباط با هوش مصنوعی: ${errorMessage}`);
  }
}
