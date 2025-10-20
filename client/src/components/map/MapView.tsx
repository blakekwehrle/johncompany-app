import React, { useState } from 'react';
import { useGameStore } from '../../store';
import { REGION_IDS } from '../../data/initialState';

interface MapViewProps {
  selectedRegion: string | null;
  onRegionSelect: (regionId: string | null) => void;
  currentPhase: string;
}

const MapView: React.FC<MapViewProps> = ({ selectedRegion, onRegionSelect, currentPhase }) => {
  const { gameState, updateRegion } = useGameStore();
  const [isZoomed, setIsZoomed] = useState(false);

  // This would be replaced with your actual map image and region coordinates
  const handleRegionClick = (regionId: string) => {
    if (currentPhase === 'company') {
      // In company phase, toggle company control
      const region = gameState.regions[regionId];
      updateRegion(regionId, { companyControlled: !region.companyControlled });
    } else {
      // In other phases, just select for viewing
      onRegionSelect(regionId);
      setIsZoomed(true);
    }
  };

  const handleBackClick = () => {
    setIsZoomed(false);
    onRegionSelect(null);
  };

  if (isZoomed && selectedRegion) {
    const region = gameState.regions[selectedRegion];
    return (
      <div className="h-full flex flex-col p-4">
        <button 
          onClick={handleBackClick}
          className="mb-4 px-4 py-2 bg-amber-500 text-white rounded-lg self-start"
        >
          ← Back to Map
        </button>
        
        <div className="flex-1 bg-gray-100 rounded-lg p-4 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4">{region.name}</h2>
          
          {/* This would show your detailed region image with connection lines */}
          <div className="w-64 h-64 bg-blue-100 rounded-lg border-2 border-blue-300 mb-4 flex items-center justify-center">
            <span className="text-blue-600">Detailed {region.name} Map</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-white p-3 rounded-lg border">
              <h3 className="font-bold">Status</h3>
              <p>Company: {region.companyControlled ? 'Yes' : 'No'}</p>
              <p>Unrest: {region.unrest}</p>
              <p>Tower: {region.towerHeight}</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg border">
              <h3 className="font-bold">Orders</h3>
              {region.orders.map(orderId => {
                const order = gameState.orders[orderId];
                return (
                  <div key={orderId} className={`text-sm ${order.open ? 'text-green-600' : 'text-red-600'}`}>
                    Order {orderId}: {order.open ? 'OPEN' : 'CLOSED'}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-4">
      <h2 className="text-lg font-bold mb-4">India Map</h2>
      
      {/* Simplified map grid - replace with your actual map image/regions */}
      <div className="grid grid-cols-3 gap-2 h-4/5">
        {Object.values(gameState.regions).map(region => (
          <div
            key={region.id}
            onClick={() => handleRegionClick(region.id)}
            className={`border-2 rounded-lg p-2 cursor-pointer transition-all ${
              region.companyControlled 
                ? 'bg-green-100 border-green-500' 
                : 'bg-red-100 border-red-300'
            } ${
              selectedRegion === region.id ? 'ring-4 ring-blue-400' : ''
            }`}
          >
            <h3 className="font-bold text-sm">{region.name}</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Unrest:</span>
                <span className={region.unrest > 0 ? 'text-red-600 font-bold' : ''}>
                  {region.unrest}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tower:</span>
                <span>{region.towerHeight}</span>
              </div>
              <div className="flex justify-between">
                <span>Orders:</span>
                <span>
                  {region.orders.filter(orderId => gameState.orders[orderId]?.open).length}/
                  {region.orders.length}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;