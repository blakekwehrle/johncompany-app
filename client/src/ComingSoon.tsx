import React, { useState, useEffect } from 'react';

const ComingSoon: React.FC = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Set your launch date here (YYYY, MM-1, DD)
  const launchDate = new Date(2025, 10, 21); // December 15, 2025

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = launchDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(timer);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center" style={{ fontFamily: 'Baskerville, "Baskerville Old Face", "Hoefler Text", Garamond, "Times New Roman", serif' }}>
      <div className="bg-white border-2 border-deep-red rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <div className="mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-deep-red mb-2">John Company: Second Edition</h1>
            <div className="h-1 bg-deep-red w-24 mx-auto"></div>
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Events in India</h2>
          <p className="text-gray-600 mt-2">Player Aid Companion App</p>
        </div>

        {/* Coming Soon Message */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Coming Soon</h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            A dedicated companion app to enhance your experience with the acclaimed board game. 
            Track events, manage company operations, and streamline gameplay with this official digital assistant.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-deep-red text-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold">{countdown.days}</div>
            <div className="text-white opacity-90">Days</div>
          </div>
          <div className="bg-gray-800 text-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold">{countdown.hours}</div>
            <div className="text-white opacity-90">Hours</div>
          </div>
          <div className="bg-deep-red text-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold">{countdown.minutes}</div>
            <div className="text-white opacity-90">Minutes</div>
          </div>
          <div className="bg-gray-800 text-white rounded-lg p-4 shadow">
            <div className="text-3xl font-bold">{countdown.seconds}</div>
            <div className="text-white opacity-90">Seconds</div>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-8 text-left border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold text-deep-red mb-4 text-center">App Features</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-deep-red mr-2">▪</span>
              <span>Event tracking and resolution</span>
            </li>
            <li className="flex items-start">
              <span className="text-deep-red mr-2">▪</span>
              <span>Company financial management</span>
            </li>
            <li className="flex items-start">
              <span className="text-deep-red mr-2">▪</span>
              <span>Office and shipment tracking</span>
            </li>
            <li className="flex items-start">
              <span className="text-deep-red mr-2">▪</span>
              <span>Rule references and clarifications</span>
            </li>
            <li className="flex items-start">
              <span className="text-deep-red mr-2">▪</span>
              <span>Player turn guidance</span>
            </li>
            <li className="flex items-start">
              <span className="text-deep-red mr-2">▪</span>
              <span>Historical context and flavor text</span>
            </li>
          </ul>
        </div>

        {/* Notify Form */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Get notified when we launch</h3>
          <form className="flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-2 rounded border focus:outline-none focus:ring-1 focus:ring-deep-red flex-grow max-w-md"
            />
            <button
              type="submit"
              className="bg-deep-red hover:bg-red-900 text-white font-semibold px-6 py-2 rounded transition-colors"
            >
              Notify Me
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 border-t border-gray-200 pt-6">
          <p>An official companion app for the board game by Wehrlegig Games</p>
        </div>
      </div>

      <style>{`
        .bg-deep-red {
          background-color: #8B0000;
        }
        .border-deep-red {
          border-color: #8B0000;
        }
        .text-deep-red {
          color: #8B0000;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;