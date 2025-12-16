import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

if (!API_KEY) {
    console.warn('Missing NEXT_PUBLIC_GEMINI_API_KEY. AI features will not work.');
}

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Get a Gemini model instance.
 * @param modelName - e.g., 'gemini-1.5-flash'
 */
export function getModel(modelName: string = 'gemini-2.0-flash'): GenerativeModel {
    return genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.8,
        },
    });
}
