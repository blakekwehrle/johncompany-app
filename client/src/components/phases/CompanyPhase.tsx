// In src/components/phases/CompanyPhase.tsx
import React, { useState } from 'react';
import { useGameStore } from '../../store';

const CompanyPhase: React.FC = () => {
  const { 
    gameState, 
    resetAllOrders, 
    setAllOrdersOpen, 
    startEventPhase,
    updateRegion,
    updateOrder,
  } = useGameStore();
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const handleReturnToEventPhase = () => {
    startEventPhase();
  };

  const selectedRegionData = selectedRegion ? gameState.regions[selectedRegion] : null;

  // Safe update functions with proper type checking
  const handleToggleCompanyControl = () => {
    if (!selectedRegion) return;
    updateRegion(selectedRegion, { 
      companyControlled: !selectedRegionData!.companyControlled 
    });
  };

  const handleDecreaseUnrest = () => {
    if (!selectedRegion || !selectedRegionData) return;
    updateRegion(selectedRegion, { 
      unrest: Math.max(0, selectedRegionData.unrest - 1) 
    });
  };

  const handleIncreaseUnrest = () => {
    if (!selectedRegion || !selectedRegionData) return;
    updateRegion(selectedRegion, { 
      unrest: selectedRegionData.unrest + 1 
    });
  };

  const handleDecreaseTowerHeight = () => {
    if (!selectedRegion || !selectedRegionData) return;
    updateRegion(selectedRegion, { 
      towerHeight: Math.max(0, selectedRegionData.towerHeight - 1) 
    });
  };

  const handleIncreaseTowerHeight = () => {
    if (!selectedRegion || !selectedRegionData) return;
    updateRegion(selectedRegion, { 
      towerHeight: selectedRegionData.towerHeight + 1 
    });
  };

  const handleToggleOrder = (orderId: string, currentOpen: boolean) => {
    updateOrder(orderId, { open: !currentOpen });
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-lg font-bold mb-3 text-green-800">Company Phase</h2>
      
      <div className="flex-1 space-y-4 overflow-y-auto">
        {/* Phase Controls */}
        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
          {/* <h3 className="font-bold text-green-700 mb-2">Phase Controls</h3> */}
          <div className="space-y-2">
            <button 
              onClick={handleReturnToEventPhase}
              className="w-full bg-blue-500 text-white py-2 rounded text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              Return to Event Phase
            </button>
            <div className="grid grid-cols-2 gap-2">
              {/* <button 
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
              </button> */}
            </div>
          </div>
        </div>

        {/* Region Selection */}
        <div className="bg-white p-3 rounded-lg border">
          <h3 className="font-bold mb-2">Select Region to Edit</h3>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {Object.values(gameState.regions).map(region => (
              <button
                key={region.id}
                onClick={() => setSelectedRegion(region.id)}
                className={`p-2 rounded text-sm text-left transition-colors ${
                  selectedRegion === region.id 
                    ? 'bg-blue-100 border border-blue-300' 
                    : 'bg-gray-50 hover:bg-gray-100 border'
                }`}
              >
                <div className="font-medium capitalize">{region.name}</div>
                <div className="text-xs text-gray-600">
                  Orders: {region.orders.filter(orderId => gameState.orders[orderId]?.open).length}/{region.orders.length}
                </div>
              </button>
            ))}
          </div>
        </div> 

        {/* Region Controls - This section only renders when selectedRegionData exists */}
        {selectedRegionData && selectedRegion && (
          <div className="bg-white p-3 rounded-lg border">
            <h3 className="font-bold mb-3 text-gray-800 capitalize">{selectedRegionData.name} Controls</h3>
            
            {/* Company Control Toggle */}
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Company Controlled:</span>
              <button
                onClick={handleToggleCompanyControl}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedRegionData.companyControlled 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {selectedRegionData.companyControlled ? 'Yes' : 'No'}
              </button>
            </div>
            
            {/* Unrest Control */}
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Unrest:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecreaseUnrest}
                  className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center disabled:bg-gray-300"
                  disabled={selectedRegionData.unrest === 0}
                >
                  -
                </button>
                <span className="font-bold text-lg w-8 text-center">{selectedRegionData.unrest}</span>
                <button
                  onClick={handleIncreaseUnrest}
                  className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Tower Height Control */}
            <div className="flex justify-between items-center mb-4 p-2 bg-gray-50 rounded">
              <span className="text-gray-700 font-medium">Tower Height:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDecreaseTowerHeight}
                  className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center disabled:bg-gray-300"
                  disabled={selectedRegionData.towerHeight === 0}
                >
                  -
                </button>
                <span className="font-bold text-lg w-8 text-center">{selectedRegionData.towerHeight}</span>
                <button
                  onClick={handleIncreaseTowerHeight}
                  className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            {/* Orders Control */}
            <div className="space-y-2">
              <h4 className="font-bold text-gray-700">Orders:</h4>
              {selectedRegionData.orders.map(orderId => {
                const order = gameState.orders[orderId];
                if (!order) return null;
                
                return (
                  <div key={orderId} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                    <div>
                      <span className="font-medium">Order {orderId}</span>
                      <span className="text-sm text-gray-500 ml-2">(£{order.price})</span>
                    </div>
                    <button
                      onClick={() => handleToggleOrder(orderId, order.open)}
                      className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                        order.open 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {order.open ? 'OPEN' : 'CLOSED'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Status */}
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