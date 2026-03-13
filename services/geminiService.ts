import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameState, SceneData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the game engine for a Thai romantic visual novel (จีบสาว) called "Love in Bangkok".
The player is a male protagonist. The target character is a young Thai woman named "Fah" (ฟ้า).
Fah is a 24-year-old graphic designer who loves coffee, cats, and indie music. She is kind but guarded.

Your goal is to generate the next scene based on the player's choice and current stats.

**Rules:**
1.  **Language:** strictly Thai (ภาษาไทย) for narrative and dialogue.
2.  **Tone:** Romantic, slice-of-life, sometimes funny or dramatic depending on choices.
3.  **Affection:** Track affection (0-100).
    *   < 30: Cold/Distant.
    *   30-60: Friend/Acquaintance.
    *   60-80: Crushing/Flirty.
    *   > 90: In Love.
4.  **Game Over Conditions:**
    *   If Affection drops below 10 -> Game Over (Rejected).
    *   If Affection reaches 100 -> Game Over (Happy Ending/Girlfriend).
    *   If Turn Count reaches 15 -> Game Over (Friendzoned if < 80, Confession if >= 80).

**Output Format (JSON):**
Return a JSON object with this schema:
- narrative: (String) Description of the scene/setting (in Thai).
- characterDialogue: (String) What Fah says (in Thai).
- characterEmotion: (String) One of: 'happy', 'shy', 'angry', 'neutral', 'sad'.
- choices: (Array) 3 distinct options for the player.
- affectionChange: (Number) Integer between -15 and +15 based on the last choice's impact.
- isGameOver: (Boolean) True if the game ends.
- endingType: (String, Optional) 'win', 'loss', 'friendzone'.
- backgroundKeywords: (String) English keywords for a background image (e.g., "coffee shop", "park evening", "rainy street").
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    narrative: { type: Type.STRING },
    characterDialogue: { type: Type.STRING },
    characterEmotion: { type: Type.STRING, enum: ['happy', 'shy', 'angry', 'neutral', 'sad'] },
    choices: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
        },
        required: ['id', 'text'],
      },
    },
    affectionChange: { type: Type.INTEGER },
    isGameOver: { type: Type.BOOLEAN },
    endingType: { type: Type.STRING, enum: ['win', 'loss', 'friendzone'], nullable: true },
    backgroundKeywords: { type: Type.STRING },
  },
  required: ['narrative', 'characterDialogue', 'characterEmotion', 'choices', 'affectionChange', 'isGameOver', 'backgroundKeywords'],
};

export const generateScene = async (
  currentGameState: GameState,
  playerChoice: string
): Promise<SceneData> => {
  try {
    const model = 'gemini-2.5-flash';

    // Construct the context for the AI
    let prompt = "";
    if (currentGameState.turnCount === 0) {
      prompt = "Start the game. Scene: Meeting Fah at a cafe on a rainy afternoon in Sukhumvit.";
    } else {
      prompt = `
      Current Affection: ${currentGameState.affection}
      Previous Mood: ${currentGameState.mood}
      Turn: ${currentGameState.turnCount}
      Player Choice: "${playerChoice}"
      
      Generate the reaction and the next set of choices.
      `;
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...currentGameState.history, // Include chat history for context
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No text returned from Gemini");

    const sceneData: SceneData = JSON.parse(jsonText);
    return sceneData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback safe state to prevent crash
    return {
      narrative: "เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์... (AI Error)",
      characterDialogue: "...",
      characterEmotion: "sad",
      choices: [{ id: "retry", text: "ลองใหม่อีกครั้ง" }],
      affectionChange: 0,
      isGameOver: false,
      backgroundKeywords: "glitch abstract",
    };
  }
};
