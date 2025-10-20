import React from 'react';
import { useGameStore } from '../../store';

const AnalysisPhase: React.FC = () => {
  const { gameState } = useGameStore();

  const getRebellionRisk = (region: any) => {
    if (region.companyControlled && region.unrest > 0) return 'High';
    if (region.unrest > 1) return 'Medium';
    return 'Low';
  };

  return (
    <div className="h-full">
      <h2 className="text-lg font-bold mb-3 text-purple-800">Regional Analysis</h2>
      
      <div className="space-y-3">
        {Object.values(gameState.regions).map(region => (
          <div key={region.id} className="bg-white p-3 rounded-lg border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold capitalize">{region.name}</h3>
              <span className={`px-2 py-1 rounded text-xs ${
                getRebellionRisk(region) === 'High' ? 'bg-red-100 text-red-800' :
                getRebellionRisk(region) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                Risk: {getRebellionRisk(region)}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Open Orders:</span>
                <span className="ml-1 font-medium">
                  {region.orders.filter(orderId => gameState.orders[orderId]?.open).length}/
                  {region.orders.length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Unrest:</span>
                <span className="ml-1 font-medium">{region.unrest}</span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <h4 className="font-bold text-purple-700 mb-1">Analysis Legend</h4>
          <div className="text-sm text-purple-600 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>High Risk: Company control with unrest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded"></div>
              <span>Medium Risk: Significant unrest</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Low Risk: Stable conditions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPhase;