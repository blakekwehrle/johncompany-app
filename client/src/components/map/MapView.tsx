import React, { useState, useRef, useCallback } from 'react';
import { useGameStore } from '../../store';
import { REGION_IDS } from '../../data/initialState';

// Import your map images
import baseMapImage from '../../assets/images/map/india_base.png';
import punjabRegion from '../../assets/images/map/regions/punjab.png';
import delhiRegion from '../../assets/images/map/regions/delhi.png';
import bengalRegion from '../../assets/images/map/regions/bengal.png';
import bombayRegion from '../../assets/images/map/regions/bombay.png';
import marathaRegion from '../../assets/images/map/regions/maratha.png';
import hyderabadRegion from '../../assets/images/map/regions/hyderabad.png';
import mysoreRegion from '../../assets/images/map/regions/mysore.png';
import madrasRegion from '../../assets/images/map/regions/madras.png';

interface MapViewProps {
  selectedRegion: string | null;
  onRegionSelect: (regionId: string | null) => void;
  currentPhase: string;
}

const MapView: React.FC<MapViewProps> = ({ selectedRegion, onRegionSelect, currentPhase }) => {
  const { gameState, updateRegion } = useGameStore();
  const [isZoomed, setIsZoomed] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Map region IDs to their images
  const regionImages: Record<string, string> = {
    [REGION_IDS.PUNJAB]: punjabRegion,
    [REGION_IDS.DELHI]: delhiRegion,
    [REGION_IDS.BENGAL]: bengalRegion,
    [REGION_IDS.BOMBAY]: bombayRegion,
    [REGION_IDS.MARATHA]: marathaRegion,
    [REGION_IDS.HYDERABAD]: hyderabadRegion,
    [REGION_IDS.MYSORE]: mysoreRegion,
    [REGION_IDS.MADRAS]: madrasRegion,
  };

  // Detailed region images (with connection lines)
  const detailedRegionImages: Record<string, string> = {
    // You can use the same images for now, or import separate detailed versions
    [REGION_IDS.PUNJAB]: punjabRegion,
    [REGION_IDS.DELHI]: delhiRegion,
    [REGION_IDS.BENGAL]: bengalRegion,
    [REGION_IDS.BOMBAY]: bombayRegion,
    [REGION_IDS.MARATHA]: marathaRegion,
    [REGION_IDS.HYDERABAD]: hyderabadRegion,
    [REGION_IDS.MYSORE]: mysoreRegion,
    [REGION_IDS.MADRAS]: madrasRegion,
  };

  const handleRegionClick = (regionId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (currentPhase === 'company') {
      // In company phase, toggle company control
      const region = gameState.regions[regionId];
      updateRegion(regionId, { companyControlled: !region.companyControlled });
    } else {
      // In other phases, select for detailed view
      onRegionSelect(regionId);
      setIsZoomed(true);
    }
  };

  const handleBackClick = () => {
    setIsZoomed(false);
    onRegionSelect(null);
  };

  const handleMapClick = (event: React.MouseEvent) => {
    // If clicking on the map background (not a region), deselect
    if (event.target === event.currentTarget) {
      onRegionSelect(null);
    }
  };

  // Render detailed region view
  if (isZoomed && selectedRegion) {
    const region = gameState.regions[selectedRegion];
    return (
      <div className="h-full flex flex-col p-4 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleBackClick}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            ← Back to Map
          </button>
          <h2 className="text-2xl font-bold text-gray-800">{region.name}</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            region.companyControlled 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {region.companyControlled ? 'Company Controlled' : 'Local Control'}
          </div>
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6">
          {/* Detailed Region Image */}
          <div className="flex-1 bg-white rounded-lg border-2 border-amber-200 p-4 flex items-center justify-center">
            <img 
              src={detailedRegionImages[selectedRegion]} 
              alt={`Detailed map of ${region.name}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Region Controls */}
          <div className="w-full lg:w-80 space-y-4">
            {/* Status Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Region Status</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Company Control:</span>
                  <button
                    onClick={() => updateRegion(selectedRegion, { 
                      companyControlled: !region.companyControlled 
                    })}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      region.companyControlled 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {region.companyControlled ? 'Yes' : 'No'}
                  </button>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Unrest:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRegion(selectedRegion, { 
                        unrest: Math.max(0, region.unrest - 1) 
                      })}
                      className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      disabled={region.unrest === 0}
                    >
                      -
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{region.unrest}</span>
                    <button
                      onClick={() => updateRegion(selectedRegion, { 
                        unrest: region.unrest + 1 
                      })}
                      className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tower Height:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRegion(selectedRegion, { 
                        towerHeight: Math.max(0, region.towerHeight - 1) 
                      })}
                      className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      disabled={region.towerHeight === 0}
                    >
                      -
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{region.towerHeight}</span>
                    <button
                      onClick={() => updateRegion(selectedRegion, { 
                        towerHeight: region.towerHeight + 1 
                      })}
                      className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Orders Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Orders</h3>
              
              <div className="space-y-2">
                {region.orders.map(orderId => {
                  const order = gameState.orders[orderId];
                  if (!order) return null;
                  
                  return (
                    <div key={orderId} className="flex justify-between items-center p-2 bg-gray-50 rounded border">
                      <div>
                        <span className="font-medium">Order {orderId}</span>
                        <span className="text-sm text-gray-500 ml-2">(£{order.price})</span>
                      </div>
                      <button
                        onClick={() => {
                          // Toggle order open/closed
                          const updatedOrders = {
                            ...gameState.orders,
                            [orderId]: {
                              ...order,
                              open: !order.open
                            }
                          };
                          // We'll need to add an updateOrders function to the store
                          // For now, we'll just log
                          console.log(`Toggling order ${orderId} to ${!order.open}`);
                        }}
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
          </div>
        </div>
      </div>
    );
  }

  // Render overview map
  return (
    <div 
      ref={mapContainerRef}
      className="h-full relative bg-gray-100 rounded-lg overflow-hidden cursor-pointer "
      onClick={handleMapClick}
    >
      {/* Base Map */}
      <img 
        src={baseMapImage} 
        alt="India Map"
        className="w-full h-full object-contain"
      />
      
      {/* Clickable Region Overlays */}
      {Object.values(gameState.regions).map(region => (
        <img
          key={region.id}
          src={regionImages[region.id]}
          alt={region.name}
          className={`absolute top-0 left-0 w-full h-full object-contain transition-all duration-200 ${
            selectedRegion === region.id 
              ? 'opacity-70 ring-4 ring-blue-400' 
              : 'opacity-40 hover:opacity-60'
          } ${
            region.companyControlled 
              ? 'filter hue-rotate-60' // Green tint for company control
              : 'filter hue-rotate-300' // Red tint for local control
          }`}
          onClick={(e) => handleRegionClick(region.id, e)}
          style={{ 
            pointerEvents: 'auto',
            cursor: 'pointer'
          }}
        />
      ))}
      
      {/* Region Labels and Status Overlay */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {Object.values(gameState.regions).map(region => (
          <div
            key={region.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${
              region.companyControlled 
                ? 'bg-green-500 text-white' 
                : 'bg-red-500 text-white'
            } px-2 py-1 rounded-lg text-sm font-bold shadow-lg transition-all`}
            style={{
              // You'll need to position these based on your map coordinates
              // This is a placeholder - you'll want to adjust these for each region
              left: getRegionLabelPosition(region.id).x,
              top: getRegionLabelPosition(region.id).y,
            }}
          >
            {region.name}
            {region.unrest > 0 && (
              <span className="ml-1 bg-red-700 px-1 rounded">{region.unrest}</span>
            )}
          </div>
        ))}
      </div>
      
      {/* Map Controls */}
      {/* <div className="absolute bottom-4 right-4 flex gap-2">
        <div className="bg-white bg-opacity-90 rounded-lg p-3 shadow-lg">
          <h4 className="font-bold text-sm mb-2">Map Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Company Controlled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Local Control</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded">⚡</div>
              <span>Unrest</span>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

// Helper function to position region labels - you'll need to customize these coordinates
// based on your actual map layout
const getRegionLabelPosition = (regionId: string): { x: string; y: string } => {
  const positions: Record<string, { x: string; y: string }> = {
    [REGION_IDS.PUNJAB]: { x: '20%', y: '15%' },
    [REGION_IDS.DELHI]: { x: '30%', y: '25%' },
    [REGION_IDS.BENGAL]: { x: '60%', y: '35%' },
    [REGION_IDS.BOMBAY]: { x: '25%', y: '60%' },
    [REGION_IDS.MARATHA]: { x: '40%', y: '55%' },
    [REGION_IDS.HYDERABAD]: { x: '50%', y: '65%' },
    [REGION_IDS.MYSORE]: { x: '45%', y: '75%' },
    [REGION_IDS.MADRAS]: { x: '60%', y: '80%' },
  };
  
  return positions[regionId] || { x: '50%', y: '50%' };
};

export default MapView;