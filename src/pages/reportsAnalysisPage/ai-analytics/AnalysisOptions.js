import React from 'react';
import { FaChartBar, FaClock, FaMapMarkedAlt, FaTags, FaStopwatch, FaChartLine, FaEnvelope, FaUsers, FaMagic } from 'react-icons/fa';

const analysisOptions = {
  'Ticket Status and Resolution Insights': { 
    icon: <FaChartBar className="text-yellow-500" />, 
    prompt: 'Analyze status distribution and resolution rates' 
  },
  'Operational Performance Metrics': { 
    icon: <FaClock className="text-yellow-500" />, 
    prompt: 'Review team handling times and performance' 
  },
  'Geographical and Demographic Analysis': { 
    icon: <FaMapMarkedAlt className="text-yellow-500" />, 
    prompt: 'Examine location-based patterns' 
  },
  'Issue Type and Priority Analysis': { 
    icon: <FaTags className="text-yellow-500" />, 
    prompt: 'Breakdown by issue type and priority' 
  },
  'Time-Based Analysis': { 
    icon: <FaStopwatch className="text-yellow-500" />, 
    prompt: 'Identify temporal trends' 
  },
  'Escalation and Workflow Insights': { 
    icon: <FaChartLine className="text-yellow-500" />, 
    prompt: 'Analyze escalation patterns' 
  },
  'Notification and Read Status Analysis': { 
    icon: <FaEnvelope className="text-yellow-500" />, 
    prompt: 'Review communication effectiveness' 
  },
  'Compliance and Team Performance': { 
    icon: <FaUsers className="text-yellow-500" />, 
    prompt: 'Assess team compliance metrics' 
  },
  'Predictive Insights': { 
    icon: <FaMagic className="text-yellow-500" />, 
    prompt: 'Get predictive analytics' 
  }
};

const AnalysisOptions = ({ onSelect, disabled, compact = false }) => {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(analysisOptions)
          .filter(([_, opt]) => opt.quickAction)
          .map(([type, opt]) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              disabled={disabled}
              className="p-2 text-xs bg-gray-600 hover:bg-gray-500 rounded"
            >
              {type.split(' ')[0]}...
            </button>
          ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2 mt-3">
      {Object.entries(analysisOptions).map(([type, opt]) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          disabled={disabled}
          className={`p-2 text-left rounded border ${disabled ? 'bg-gray-600' : 'bg-gray-700 hover:bg-gray-600'} border-gray-600 flex items-center`}
        >
          <span className="mr-2">{opt.icon}</span>
          {type}
        </button>
      ))}
    </div>
  );
};

export default AnalysisOptions;