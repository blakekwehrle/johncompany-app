// components/phases/CompanyPhase.tsx
import React from 'react';
import { useGameStore } from '../../store';

const CompanyPhase: React.FC = () => {
  const { gameState, resetAllOrders, setAllOrdersOpen } = useGameStore();

  return (
    <div className="h-full">
      <h2 className="text-lg font-bold mb-3 text-green-800">Company Operations</h2>
      
      <div className="space-y-4">
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-700 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={setAllOrdersOpen}
              className="bg-white p-2 rounded border text-sm hover:bg-green-100 transition-colors"
            >
              Open All Orders
            </button>
            <button 
              onClick={resetAllOrders}
              className="bg-white p-2 rounded border text-sm hover:bg-green-100 transition-colors"
            >
              Reset Orders
            </button>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-bold mb-2">Instructions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Tap any region on the map</strong> to view details and manage orders</p>
            <p>Toggle Company Control in the region detail view</p>
            <p>Open/Close individual orders to control trade routes</p>
            <p>Adjust unrest levels as needed</p>
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-bold mb-2">Current Status</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="font-bold text-blue-700">
                {Object.values(gameState.regions).filter(r => r.companyControlled).length}
              </div>
              <div className="text-blue-600">Company Regions</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-700">
                {Object.values(gameState.orders).filter(o => o.open).length}
              </div>
              <div className="text-green-600">Open Orders</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPhase;