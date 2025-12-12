import React, { useState } from 'react';

const AlphaDisclaimer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-5">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
              PRE-ALPHA
            </span>
            <span className="text-sm font-medium text-gray-700">Under Construction!</span>
          </div>
          <p className="text-sm text-gray-600">
            This website under active development and internal testing. Implementation is ongoing.
          </p>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md text-sm transition-colors"
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AlphaDisclaimer;