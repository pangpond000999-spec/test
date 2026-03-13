import React, { useState, useEffect, useRef } from 'react';
import { generateScene } from './services/geminiService';
import { GameState, INITIAL_GAME_STATE, SceneData } from './types';
import CharacterSprite from './components/CharacterSprite';
import TypewriterText from './components/TypewriterText';
import StatsPanel from './components/StatsPanel';
import { Play, RotateCcw, MessageCircle, Star } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_GAME_STATE);
  const [currentScene, setCurrentScene] = useState<SceneData | null>(null);
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  
  // To auto-scroll chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  const startGame = async () => {
    setStarted(true);
    setLoading(true);
    setGameState(INITIAL_GAME_STATE);
    
    // Generate opening scene
    const initialScene = await generateScene(INITIAL_GAME_STATE, "START_GAME");
    setCurrentScene(initialScene);
    setLoading(false);
  };

  const handleChoice = async (choiceId: string, choiceText: string) => {
    if (gameState.isGameOver || loading) return;

    // Optimistic UI updates could go here, but with Gemini we wait for the result
    setLoading(true);

    // Update history temporarily for the API call
    const updatedHistory = [
      ...gameState.history,
      { role: 'user' as const, parts: [{ text: `Player chose: ${choiceText}` }] },
      { role: 'model' as const, parts: [{ text: JSON.stringify(currentScene) }] } // Simplistic history tracking
    ];

    const nextState = {
      ...gameState,
      history: updatedHistory
    };

    const newScene = await generateScene(nextState, choiceText);

    // Calculate new affection (clamped 0-100)
    let newAffection = gameState.affection + newScene.affectionChange;
    newAffection = Math.max(0, Math.min(100, newAffection));

    setGameState({
      ...nextState,
      affection: newAffection,
      mood: newScene.characterEmotion,
      turnCount: gameState.turnCount + 1,
      isGameOver: newScene.isGameOver,
      endingType: newScene.endingType,
    });

    setCurrentScene(newScene);
    setLoading(false);
  };

  // Background Image Logic
  const getBackgroundImage = () => {
    if (!currentScene) return 'https://picsum.photos/seed/start/1920/1080?blur=2';
    // Use keywords to seed the random image, keeping it somewhat consistent per scene
    const seed = currentScene.backgroundKeywords.replace(/\s/g, '');
    return `https://picsum.photos/seed/${seed}/1920/1080?blur=2`;
  };

  if (!started) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-400 to-indigo-600 p-4">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl max-w-lg text-center border-4 border-white/50">
          <div className="mb-6 flex justify-center">
            <div className="bg-pink-100 p-4 rounded-full">
              <Star className="w-12 h-12 text-pink-500" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-800 mb-2 tracking-tight">
            Love in <span className="text-pink-600">Bangkok</span>
          </h1>
          <p className="text-slate-600 text-lg mb-8 font-light">
            รักนี้ที่กรุงเทพฯ — An AI-Powered Dating Sim
          </p>
          <div className="space-y-4">
            <button
              onClick={startGame}
              className="w-full group relative overflow-hidden bg-slate-900 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                <Play size={20} fill="currentColor" /> เริ่มเกม (Start Game)
              </span>
            </button>
            <p className="text-xs text-slate-400 mt-4">Powered by Gemini 2.5 Flash</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden font-sans bg-slate-900">
      
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.6
        }}
      />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 h-screen flex flex-col md:flex-row max-w-7xl mx-auto p-4 md:p-8 gap-4">
        
        {/* Left Col: Stats & Narrative */}
        <div className="flex-1 flex flex-col gap-4">
          <header className="flex justify-between items-start">
             <StatsPanel affection={gameState.affection} />
             <div className="bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-mono border border-white/10">
               Turn: {gameState.turnCount}
             </div>
          </header>

          {/* Narrative Box */}
          <div className="mt-auto bg-black/60 backdrop-blur-md p-6 rounded-2xl border-l-4 border-pink-500 shadow-lg animate-fade-in-up">
            <h2 className="text-pink-300 text-xs font-bold uppercase tracking-widest mb-2">Narrative</h2>
            <p className="text-white text-lg md:text-xl leading-relaxed font-light min-h-[4rem]">
              {loading ? (
                <span className="animate-pulse">กำลังประมวลผลเรื่องราว...</span>
              ) : (
                currentScene?.narrative
              )}
            </p>
          </div>
        </div>

        {/* Center: Character */}
        <div className="flex-none w-full md:w-1/3 h-[40vh] md:h-auto flex items-end justify-center pointer-events-none">
           <CharacterSprite emotion={currentScene?.characterEmotion || 'neutral'} />
        </div>

        {/* Right Col: Dialogue & Choices */}
        <div className="flex-1 flex flex-col justify-end gap-4 pb-4">
          
          {/* Dialogue Box */}
          <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-2xl border border-white/50 relative">
             {/* Character Name Tag */}
             <div className="absolute -top-5 left-8 bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg transform -rotate-2">
                ฟ้า (Fah)
             </div>
             
             <div className="mt-2 text-slate-800 text-xl font-medium min-h-[3rem]">
               {loading ? (
                 <div className="flex gap-1 items-center h-full">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                 </div>
               ) : (
                  currentScene && <TypewriterText text={currentScene.characterDialogue} key={currentScene.narrative} />
               )}
             </div>
          </div>

          {/* Choice Menu */}
          <div className="space-y-3">
             {gameState.isGameOver ? (
               <div className="bg-slate-800/90 backdrop-blur text-white p-6 rounded-2xl text-center border-2 border-pink-500/50">
                  <h3 className="text-2xl font-bold mb-2">
                    {gameState.endingType === 'win' ? 'Happy Ending! ❤️' : 
                     gameState.endingType === 'friendzone' ? 'Friendzoned 🤝' : 'Game Over 💔'}
                  </h3>
                  <button 
                    onClick={startGame}
                    className="mt-4 flex items-center justify-center gap-2 mx-auto bg-white text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-pink-50 transition-colors"
                  >
                    <RotateCcw size={18} /> Play Again
                  </button>
               </div>
             ) : (
               currentScene?.choices.map((choice, idx) => (
                 <button
                   key={idx}
                   disabled={loading}
                   onClick={() => handleChoice(choice.id, choice.text)}
                   className="w-full text-left bg-white/80 hover:bg-white backdrop-blur-sm p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:scale-[1.02] hover:border-pink-300 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   <div className="flex items-center gap-3">
                     <div className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                       {idx + 1}
                     </div>
                     <span className="text-slate-800 font-medium group-hover:text-indigo-900">{choice.text}</span>
                   </div>
                 </button>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
