import React from 'react';
import { FaRobot } from 'react-icons/fa';

const AiAnalyticsButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 rounded-md text-sm text-black font-medium"
    >
      <FaRobot /> Analyze Data
    </button>
  );
};

export default AiAnalyticsButton;