import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Lazy initialization to avoid build-time errors
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
    if (!genAI) {
        const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
        if (!API_KEY) {
            throw new Error('Missing GEMINI_API_KEY. AI features require a valid API key.');
        }
        genAI = new GoogleGenerativeAI(API_KEY);
    }
    return genAI;
}

/**
 * Get a Gemini model instance.
 * @param modelName - e.g., 'gemini-1.5-flash'
 */
export function getModel(modelName: string = 'gemini-2.0-flash-exp'): GenerativeModel {
    return getGenAI().getGenerativeModel({
        model: modelName,
        generationConfig: {
            maxOutputTokens: 2048,
            temperature: 0.7,
            topP: 0.8,
        },
    });
}
