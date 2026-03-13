import React from 'react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { Heart } from 'lucide-react';

interface StatsPanelProps {
  affection: number;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ affection }) => {
  const data = [
    {
      name: 'Affection',
      value: affection,
      fill: affection > 80 ? '#ec4899' : affection > 50 ? '#f472b6' : '#94a3b8',
    },
  ];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-pink-100 w-full max-w-[180px]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">Love Meter</h3>
        <Heart className={`w-5 h-5 transition-colors duration-300 ${affection > 60 ? 'fill-pink-500 text-pink-500 animate-pulse' : 'text-slate-400'}`} />
      </div>
      
      <div className="h-32 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            innerRadius="70%" 
            outerRadius="100%" 
            barSize={10} 
            data={data} 
            startAngle={180} 
            endAngle={0}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
            <RadialBar
              background
              dataKey="value"
              cornerRadius={5}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
            <span className="text-3xl font-black text-slate-800">{affection}%</span>
            <span className="text-xs text-slate-500">{affection > 80 ? 'In Love' : affection > 50 ? 'Crushing' : 'Friends'}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
