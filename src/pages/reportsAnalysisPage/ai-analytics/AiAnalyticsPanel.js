import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FaRobot, FaTimes, FaRedo, FaPaperPlane } from 'react-icons/fa';
import { debounce } from 'lodash';
import ChatMessage, { extractFollowUpQuestions } from './ChatMessage';
import { getSystemPrompt } from './systemPrompt';

// Sub-components for better organization
const ChatHeader = ({ onClose, onClear, isLoading }) => (
  <div className="p-4 bg-gray-700 flex justify-between items-center border-b border-gray-600">
    <h3 className="text-lg font-semibold flex items-center gap-2">
      <FaRobot className="text-blue-400" /> Data Analysis Assistant
    </h3>
    <div className="flex gap-2">
      <button 
        onClick={onClear}
        disabled={isLoading}
        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm flex items-center gap-1 disabled:opacity-50"
        title="Start new conversation"
      >
        <FaRedo size={12} /> New
      </button>
      <button 
        onClick={onClose} 
        className="p-1 hover:bg-gray-600 rounded"
        title="Close panel"
      >
        <FaTimes size={18} />
      </button>
    </div>
  </div>
);

const ChatInput = ({ value, onChange, onSubmit, isLoading }) => {
  // Correctly memoize the debounced function
  const debouncedOnChange = useMemo(
    () => debounce((val) => onChange(val), 300),
    [onChange]
  );

  const handleChange = (e) => {
    debouncedOnChange(e.target.value);
  };

  return (
    <form onSubmit={onSubmit} className="p-4 border-t border-gray-600">
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Ask about the data..."
          className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="p-2 bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50 transition-colors"
          aria-label="Send message"
        >
          <FaPaperPlane />
        </button>
      </div>
      <div className="text-xs text-gray-400 mt-2">
        Tip: Try asking about trends, patterns, or specific metrics
      </div>
    </form>
  );
};

const AiAnalyticsPanel = ({ 
  isOpen, 
  onClose, 
  ticketData,
  startDate,
  endDate
}) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [loadingStage, setLoadingStage] = useState(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // Move API configuration to environment variables in production
  const API_KEY = process.env.REACT_APP_GROQ_API_KEY || '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';
  const MODEL = process.env.REACT_APP_GROQ_MODEL || 'deepseek-r1-distill-llama-70b';

  // Data verification logging
  useEffect(() => {
    if (isOpen) {
      console.group('[AiAnalyticsPanel] Data Verification');
      console.log('Received ticketData:', ticketData);
      console.log('Number of tickets:', ticketData?.length || 0);
      console.log('Date range:', { 
        start: startDate, 
        end: endDate,
        formatted: `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      });
      
      if (ticketData?.length > 0) {
        const dates = ticketData.map(t => new Date(t.dateSubmitted));
        const minDate = new Date(Math.min(...dates)).toLocaleDateString();
        const maxDate = new Date(Math.max(...dates)).toLocaleDateString();
        console.log('Earliest ticket date:', minDate);
        console.log('Latest ticket date:', maxDate);
        console.log('Sample tickets (first 3):', ticketData.slice(0, 3));
      }
      console.groupEnd();
    }
  }, [isOpen, ticketData, startDate, endDate]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  // Move getWelcomeMessage definition before the useEffect that uses it
  const getWelcomeMessage = useCallback(() => {
    const dateRangeMsg = startDate && endDate 
      ? `from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
      : 'for all available dates';
    
    const ticketCountMsg = ticketData?.length 
      ? `I've analyzed ${ticketData.length} tickets ${dateRangeMsg}.`
      : `I don't see any tickets ${dateRangeMsg}.`;
    
    return {
      content: `${ticketCountMsg}\n\nI can help you discover insights in these areas. You can:\n- Select an analysis option below\n- Ask me any question about the data\n- Request specific metrics or visualizations`,
      showOptions: true,
      isIntro: true,
      suggestedQuestions: [
        "What are the most common ticket types?",
        "Which team has the fastest resolution time?",
        "Are there any seasonal trends in ticket volume?"
      ]
    };
  }, [startDate, endDate, ticketData]);

  // Fix useEffect dependencies
  useEffect(() => {
    if (isOpen) {
      const savedMessages = localStorage.getItem('analytics-chat-history');
      if (savedMessages && chatMessages.length === 0) {
        try {
          setChatMessages(JSON.parse(savedMessages));
        } catch (e) {
          console.error('Failed to load saved chat', e);
          setChatMessages([{
            role: 'assistant',
            ...getWelcomeMessage()
          }]);
        }
      } else if (chatMessages.length === 0) {
        setChatMessages([{
          role: 'assistant',
          ...getWelcomeMessage()
        }]);
      }
    }
  }, [isOpen, chatMessages.length, getWelcomeMessage]);

  useEffect(() => {
    if (chatMessages.length > 1) {
      localStorage.setItem('analytics-chat-history', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);

  const systemPrompt = useMemo(
    () => getSystemPrompt(ticketData, startDate, endDate),
    [ticketData, startDate, endDate]
  );

  const sendMessageWithRetry = async (message, retries = 2) => {
    try {
      setLoadingStage('preparing');
      const dataPayload = {
        userQuery: message,
        dateRange: { start: startDate, end: endDate },
        ticketCount: ticketData?.length || 0,
        sampleTickets: ticketData?.slice(0, 3) || [],
        conversationContext: chatMessages
          .filter(m => m.role === 'assistant' && !m.isIntro)
          .map(m => m.content)
          .join('\n\n')
      };

      console.log('API request payload:', dataPayload);
      
      setLoadingStage('sending');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(dataPayload, null, 2) }
          ],
          temperature: 0.5,
          max_tokens: 4096,
          top_p: 0.9,
          stream: false,
          stop: null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error details:', errorData);
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      setLoadingStage('analyzing');
      const data = await response.json();
      console.log('Full AI response:', data);
      
      setLoadingStage('formatting');
      let aiResponse = data.choices[0].message.content;
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        isAnalysis: true,
        suggestedQuestions: extractFollowUpQuestions(aiResponse)
      }]);
      
      return true;
    } catch (error) {
      console.error('Analysis error:', error);
      if (retries > 0 && error.response?.status >= 500) {
        console.log(`Retrying... ${retries} attempts left`);
        await new Promise(r => setTimeout(r, 1000));
        return sendMessageWithRetry(message, retries - 1);
      }
      
      const errorMessage = error.response?.status === 429 
        ? 'Rate limit exceeded. Please try again in a few moments.'
        : 'Sorry, I encountered an error processing your request. Please try again.';
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        isError: true,
        suggestedQuestions: ["Can you rephrase your question?", "Would you like to try a different analysis?"]
      }]);
      
      return false;
    } finally {
      setLoadingStage(null);
    }
  };

  const sendMessage = async (message, isUserMessage = true) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    if (isUserMessage) {
      setChatMessages(prev => [...prev, {
        role: 'user',
        content: message,
        isRequest: true
      }]);
      setUserInput('');
    }
    
    await sendMessageWithRetry(message);
    setIsLoading(false);
  };

  const handleAnalysisSelect = async (analysisType) => {
    await sendMessage(`Analyze: ${analysisType}`, true);
  };

  const handleUserInput = (e) => {
    e.preventDefault();
    sendMessage(userInput, true);
  };

  const clearConversation = () => {
    setChatMessages([{
      role: 'assistant',
      ...getWelcomeMessage()
    }]);
    localStorage.removeItem('analytics-chat-history');
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-800 shadow-xl z-50 flex flex-col border-l border-gray-600 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <ChatHeader 
        onClose={onClose} 
        onClear={clearConversation}
        isLoading={isLoading}
      />
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
        aria-live="polite"
        role="log"
        aria-label="Chat messages"
      >
        {chatMessages.map((msg, index) => (
          <ChatMessage
            key={index}
            message={msg}
            onQuestionClick={(question) => sendMessage(question, true)}
            onAnalysisSelect={handleAnalysisSelect}
            isLoading={isLoading}
          />
        ))}
        
        {isLoading && (
          <div className="p-4 bg-gray-700 rounded-lg mr-auto max-w-[90%]">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="animate-pulse">🔍</div>
              <div>
                {loadingStage === 'preparing' && 'Preparing data...'}
                {loadingStage === 'sending' && 'Sending request...'}
                {loadingStage === 'analyzing' && 'Analyzing response...'}
                {loadingStage === 'formatting' && 'Formatting results...'}
                {!loadingStage && 'Processing your request...'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ChatInput
        value={userInput}
        onChange={setUserInput}
        onSubmit={handleUserInput}
        isLoading={isLoading}
        ref={inputRef}
      />
    </div>
  );
};

export default AiAnalyticsPanel;