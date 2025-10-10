import type { Storm, StormDieSide, StormDirection } from '../types/game';
import sd2e from '../assets/images/dice/sd2e.png';
import sd2w from '../assets/images/dice/sd2w.png';
import sd3s from '../assets/images/dice/sd3s.png';
import sd4 from '../assets/images/dice/sd4.png';
import sd1 from '../assets/images/dice/sd1.png';
import diceAnimation from '../assets/images/dice/sdanimation.gif';

export const stormDie: Storm = {
  dieSides: [
    { value: 2, direction: 'east', image: sd2e },
    { value: 2, direction: 'west', image: sd2w },
    { value: 3, direction: 'south', image: sd3s },
    { value: 4, direction: 'none', image: sd4 },
    { value: 4, direction: 'none', image: sd4 },
    { value: 1, direction: 'none', image: sd1 }
  ],
  isRolling: false
};

export { diceAnimation };

export const rollStormDie = (): StormDieSide => {
  const randomIndex = Math.floor(Math.random() * stormDie.dieSides.length);
  return stormDie.dieSides[randomIndex];
};

export const getRegionsByStormDirection = (direction: StormDirection): string[] => {
  switch (direction) {
    case 'east':
      return ['bengal'];
    case 'west':
      return ['bombay'];
    case 'south':
      return ['madras'];
    case 'none':
      return []; 
    default:
      return [];
  }
};