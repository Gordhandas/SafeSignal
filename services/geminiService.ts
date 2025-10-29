import { GoogleGenAI } from "@google/genai";
import { Location } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateSafetyMessage = async (userName: string, location: Location | null): Promise<string> => {
  try {
    const locationInfo = location 
        ? `My last known location was around latitude ${location.lat.toFixed(4)} and longitude ${location.lng.toFixed(4)}.`
        : "My location is currently not available.";

    const prompt = `
      My name is ${userName}. I was just offline, but I'm back online now and safe. 
      Generate a short, friendly, and reassuring message for my family. 
      Keep it under 40 words.
      Include the fact that I'm okay. 
      Mention my last location information: "${locationInfo}".
      Do not use markdown or special formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    // Provide a fallback message in case of API failure
    return `Hi family, just letting you know I'm back online and safe. My connection was down for a bit. My last known location was ${location ? `lat: ${location.lat.toFixed(2)}, lng: ${location.lng.toFixed(2)}` : 'not recorded'}.`;
  }
};
