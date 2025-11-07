import React, { useState, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FIELD_OF_STUDY_OPTIONS, ACADEMIC_LEVEL_OPTIONS, SYSTEM_INSTRUCTION, USER_PROMPT_TEMPLATE } from '../constants';
import { AcademicLevel } from '../types';
import Dropdown from './Dropdown';
import RadioButtonGroup from './RadioButtonGroup';

const TopicGenerator: React.FC = () => {
  const [keywords, setKeywords] = useState<string>('');
  const [fieldOfStudy, setFieldOfStudy] = useState<string>('');
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('ارشد');
  const [generatedTopics, setGeneratedTopics] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keywords.trim() || !fieldOfStudy) {
      setError('لطفاً کلمات کلیدی و رشته تحصیلی را وارد کنید.');
      return;
    }

    // Fix: Initialize GoogleGenAI without 'base' property as it's not supported,
    // and adhere to the guideline of always using { apiKey: process.env.API_KEY }.
    // The avalaiProxyUrl is not directly consumable by the GoogleGenAI constructor via a 'base' property.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError('کلید API (API_KEY) در متغیرهای محیطی تعریف نشده است. لطفاً آن را با نام API_KEY در فایل .env خود تنظیم کنید.');
      return;
    }
    const ai = new GoogleGenAI({ apiKey });

    setLoading(true);
    setError(null);
    setGeneratedTopics('');

    try {
      const userPrompt = USER_PROMPT_TEMPLATE
        .replace('{fieldOfStudy}', fieldOfStudy)
        .replace('{academicLevel}', academicLevel)
        .replace('{keywords}', keywords);

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
          maxOutputTokens: 800,
          thinkingConfig: { thinkingBudget: 200 },
        },
      });

      setGeneratedTopics(response.text);
    } catch (err) {
      console.error(err);
      setError(`خطا در تولید موضوعات: ${err instanceof Error ? err.message : 'خطای ناشناخته'}`);
    } finally {
      setLoading(false);
    }
  }, [keywords, fieldOfStudy, academicLevel]);

  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-10 w-full max-w-lg lg:max-w-3xl flex flex-col md:flex-row gap-8 transition-all duration-300 ease-in-out">
      {/* Input Section */}
      <div className="flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6">
          تولیدکننده موضوعات تحقیقاتی
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="w-full">
            <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
              کلمات کلیدی (مثال: یادگیری عمیق، پردازش تصویر)
            </label>
            <textarea
              id="keywords"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              rows={4}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="لطفاً کلمات کلیدی خود را وارد کنید..."
            ></textarea>
          </div>

          <Dropdown
            id="fieldOfStudy"
            label="رشته تحصیلی"
            options={FIELD_OF_STUDY_OPTIONS}
            value={fieldOfStudy}
            onChange={setFieldOfStudy}
            disabled={loading}
          />

          <RadioButtonGroup
            label="مقطع تحصیلی"
            name="academicLevel"
            options={ACADEMIC_LEVEL_OPTIONS}
            value={academicLevel}
            onChange={(value) => setAcademicLevel(value as AcademicLevel)}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white transition-all duration-200 ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'تولید موضوعات'
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm text-center">
              {error}
            </div>
          )}
        </form>
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-inner">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">موضوعات پیشنهادی</h2>
        {loading && (
          <div className="text-center text-gray-600 mt-8">
            <p>در حال تولید موضوعات...</p>
            <p className="text-sm mt-2">این فرآیند ممکن است چند ثانیه طول بکشد.</p>
          </div>
        )}
        {!loading && !generatedTopics && !error && (
          <div className="text-center text-gray-500 mt-8 p-4 border border-dashed border-gray-300 rounded-md">
            <p>موضوعات تولید شده در اینجا نمایش داده خواهند شد.</p>
            <p className="text-sm mt-2">برای شروع، فرم را پر کرده و دکمه "تولید موضوعات" را فشار دهید.</p>
          </div>
        )}
        {!loading && generatedTopics && (
          <div
            className="prose prose-blue max-w-none text-gray-800 leading-relaxed overflow-auto max-h-[500px] custom-scrollbar p-2"
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {generatedTopics}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicGenerator;