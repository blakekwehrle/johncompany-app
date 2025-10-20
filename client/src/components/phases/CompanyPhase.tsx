import React from 'react';
import { useGameStore } from '../../store';

const CompanyPhase: React.FC = () => {
  const { gameState, updateRegion, updateOrder } = useGameStore();

  return (
    <div className="h-full">
      <h2 className="text-lg font-bold mb-3 text-green-800">Company Operations</h2>
      
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-700 mb-2">Quick Actions (unfinished)</h3>
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-white p-2 rounded border text-sm hover:bg-green-100 transition-colors">
              Open All Orders
            </button>
            <button className="bg-white p-2 rounded border text-sm hover:bg-green-100 transition-colors">
              Reset Unrest
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-bold mb-2">Region Status</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {Object.values(gameState.regions).map(region => (
              <div key={region.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium capitalize">{region.name}</span>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    region.companyControlled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {region.companyControlled ? 'Company' : 'Local'}
                  </span>
                  {region.unrest > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                      Unrest: {region.unrest}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600 text-center">
          <p>💡 Click on regions in the map to toggle control and view details</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyPhase;
