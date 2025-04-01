import React, { useMemo } from 'react';
import { FaChartLine } from 'react-icons/fa';
import AnalysisOptions from './AnalysisOptions';

// Utility functions for formatting responses
const extractFollowUpQuestions = (text) => {
  const followUpMatch = text.match(/Follow-Up Questions:\s*((?:\d+\.\s*.*?\n)+)/i);
  if (followUpMatch) {
    return followUpMatch[1]
      .split('\n')
      .filter(line => line.trim())
      .map((line) => line.replace(/^\d+\.\s*/, '').trim());
  }
  return [];
};

const formatResponse = (text) => {
    // Extract follow-up questions first
    const suggestedQuestions = extractFollowUpQuestions(text);
    
    // Remove any thinking sections or formatting indicators
    text = text
      .replace(/<think>.*?<\/think>/s, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
  
    if (!text) return { content: null, suggestedQuestions };
    
    // Helper function to clean section text
    const cleanSectionText = (text) => {
      return text
        .replace(/^(##?\s*|summary:|key insights:|actionable takeaways:|recommendations:|next steps:)/i, '')
        .trim();
    };
    
    // More robust section extraction
    const extractSection = (content, sectionRegex) => {
      const match = content.match(new RegExp(sectionRegex, 'i'));
      return match ? cleanSectionText(match[0]) : null;
    };
    
    // Extract insights more robustly by looking for numbered items
    const extractInsights = (content) => {
      // Look for sections that might contain insights
      const potentialSections = ['key insights', 'findings', 'observations', 'trends'];
      
      let insightContent = '';
      for (const section of potentialSections) {
        const sectionRegex = new RegExp(`(?:##?\\s*${section}|${section}:)([\\s\\S]*?)(?:##|$)`, 'i');
        const match = content.match(sectionRegex);
        if (match && match[1]) {
          insightContent += match[1];
        }
      }
      
      if (!insightContent) return [];
      
      // Extract numbered items or bullet points
      const insightItems = [];
      const itemRegex = /(?:^|\n)(?:\d+\.|\*)\s*(.*?)(?=(?:\n(?:\d+\.|\*|##))|$)/g;
      let match;
      
      while ((match = itemRegex.exec(insightContent)) !== null) {
        if (match[1] && match[1].trim()) {
          insightItems.push(match[1].trim());
        }
      }
      
      // If no structured items found, split by newlines and clean up
      if (insightItems.length === 0) {
        return insightContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line && !line.match(/^##/));
      }
      
      return insightItems;
    };
    
    // Extract summary - look for explicit summary section or take first paragraph
    const summaryRegex = /(summary:?[\s\S]*?)(?=##|key insight|finding|$)/i;
    const summaryContent = extractSection(text, summaryRegex) || 
                          text.split('\n\n')[0].replace(/^#+ /m, '');
    
    // Extract insights
    const insights = extractInsights(text);
    
    // Extract recommendations or actionable takeaways
    const actionsRegex = /(actionable takeaways:?|recommendations:?|next steps:?[\s\S]*?)(?=##|$)/i;
    const actionsContent = extractSection(text, actionsRegex);
    
    // Format the content in the consistent modern style
    const content = (
      <div className="space-y-4">
        {summaryContent && (
          <div className="bg-blue-900/10 p-3 rounded">
            <h4 className="font-semibold text-blue-300 mb-1">Summary</h4>
            <p>{summaryContent}</p>
          </div>
        )}
        
        {insights.length > 0 && (
          <div className="bg-gray-700/20 p-3 rounded">
            <h4 className="font-semibold text-yellow-300 mb-2">Key Insights</h4>
            <ul className="space-y-2">
              {insights.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {actionsContent && (
          <div className="bg-green-900/10 p-3 rounded border border-green-900/30">
            <h4 className="font-semibold text-green-300 mb-2">Actionable Takeaways</h4>
            <p>{actionsContent}</p>
          </div>
        )}
        
        {/* Additional sections (optional) */}
        {suggestedQuestions.length > 0 && (
          <div className="bg-purple-900/10 p-3 rounded">
            <h4 className="font-semibold text-purple-300 mb-2">Suggested Follow-ups</h4>
            <ul className="space-y-1">
              {suggestedQuestions.map((q, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-purple-400 rounded-full mt-2 mr-2"></span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  
    return { content, suggestedQuestions };
  };
const ChatMessage = ({ message, onQuestionClick, isLoading, onAnalysisSelect }) => {
  const formattedResponse = useMemo(() => formatResponse(message.content), [message.content]);

  return (
    <div 
      className={`p-4 rounded-lg ${message.role === 'assistant' 
        ? 'bg-gray-700 mr-auto max-w-[90%]' 
        : 'bg-blue-900 ml-auto max-w-[90%]'}`}
    >
      {message.role === 'assistant' ? (
        <>
          {formattedResponse.content}
          
          {formattedResponse.suggestedQuestions?.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-600">
              <div className="text-sm text-gray-300 mb-2">You might want to ask:</div>
              <div className="flex flex-wrap gap-2">
                {formattedResponse.suggestedQuestions.map((question, qIndex) => (
                  <button
                    key={qIndex}
                    onClick={() => onQuestionClick(question)}
                    disabled={isLoading}
                    className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 rounded-full transition-colors disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <FaChartLine className="text-blue-300" />
          <span className="font-medium">Analysis request:</span> {message.content}
        </div>
      )}
      
      {message.showOptions && (
        <div className="mt-4">
          <AnalysisOptions 
            onSelect={onAnalysisSelect}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
};

// Export the main component and utility function for potential reuse elsewhere
export { extractFollowUpQuestions };
export default ChatMessage;