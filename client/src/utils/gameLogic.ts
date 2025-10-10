import type { GameState, Order, Storm } from '../types/game';

export const closeNorthernmostOrder = (state: GameState, regionId: string): GameState => {
  const region = state.regions[regionId];
  
  if (!region) {
    console.error(`Region ${regionId} not found!`);
    return state;
  }

  const openOrders: Order[] = [];
  
  region.orders.forEach(orderId => {
    const order = state.orders[orderId];
    if (order && order.open) {
      openOrders.push(order);
    }
  });

  if (openOrders.length === 0) {
    console.log(`No open orders in region ${regionId}`);
    return state;
  }

  const northernmostOrder = openOrders.reduce((northernmost, current) => {
    return current.northPriority < northernmost.northPriority ? current : northernmost;
  });

  console.log(`Closing northernmost order in ${regionId}: Order ${northernmostOrder.id} (northPriority: ${northernmostOrder.northPriority})`);

  const updatedOrders = {
    ...state.orders,
    [northernmostOrder.id]: {
      ...northernmostOrder,
      open: false
    }
  };

  return {
    ...state,
    orders: updatedOrders
  };
};

export const areAllOrdersClosed = (state: GameState, regionId: string): boolean => {
  const region = state.regions[regionId];
  if (!region) return true;

  return region.orders.every(orderId => {
    const order = state.orders[orderId];
    return order && !order.open;
  });
};

const getConnectedOrders = (state: GameState, regionId: string): Set<string> => {
  const connectedOrders = new Set<string>();
  const region = state.regions[regionId];
  
  if (!region) return connectedOrders;

  region.orders.forEach(orderId => {
    const order = state.orders[orderId];
    if (order) {
      order.neighbors.forEach(neighborOrderId => {
        const neighborOrder = state.orders[neighborOrderId];
        if (neighborOrder && neighborOrder.region !== regionId) {
          connectedOrders.add(neighborOrderId);
        }
      });
    }
  });

  return connectedOrders;
};

export const cascadeCloseOrders = (
  state: GameState, 
  startingRegionId: string,
  alreadyCascadedRegions: Set<string> = new Set()
): GameState => {
  console.log(`=== CASCADE FROM ${startingRegionId} ===`);
  
  alreadyCascadedRegions.add(startingRegionId);
  let newState = { ...state };
  
  const connectedOrders = getConnectedOrders(newState, startingRegionId);
  
  console.log(`Connected orders from ${startingRegionId}: ${Array.from(connectedOrders)}`);

  connectedOrders.forEach(connectedOrderId => {
    const connectedOrder = newState.orders[connectedOrderId];
    if (!connectedOrder) return;

    const connectedRegionId = connectedOrder.region;
    
    if (connectedOrder.open) {
      console.log(`Closing connected open order: ${connectedOrderId} in ${connectedRegionId}`);
      newState = {
        ...newState,
        orders: {
          ...newState.orders,
          [connectedOrderId]: {
            ...connectedOrder,
            open: false
          }
        }
      };
    } else {
      console.log(`Connected order ${connectedOrderId} already closed, closing northernmost in ${connectedRegionId}`);
    
      if (!alreadyCascadedRegions.has(connectedRegionId)) {
        newState = closeNorthernmostOrder(newState, connectedRegionId);
        
        if (areAllOrdersClosed(newState, connectedRegionId)) {
          console.log(`All orders now closed in ${connectedRegionId}, triggering cascade`);
          newState = cascadeCloseOrders(newState, connectedRegionId, alreadyCascadedRegions);
        }
      } else {
        console.log(`Region ${connectedRegionId} has already cascaded during this event, skipping`);
      }
    }
  });

  return newState;
};

export const startCascade = (state: GameState, regionId: string): GameState => {
  return cascadeCloseOrders(state, regionId);
};
