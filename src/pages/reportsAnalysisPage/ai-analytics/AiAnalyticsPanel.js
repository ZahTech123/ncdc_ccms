import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaRobot, FaTimes, FaChartLine, FaRedo, FaPaperPlane } from 'react-icons/fa';
import AnalysisOptions from './AnalysisOptions';

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
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  
  // API configuration
  const API_KEY = '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';
  const MODEL = 'deepseek-r1-distill-llama-70b';

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

  // Enhanced system prompt with strict numbering rules
  const getSystemPrompt = useCallback(() => {
    return `You are an expert data analyst for the NCDC system.
      Analyze the ticket data and provide insights based on the user's request.
      Follow these STRICT guidelines:
      1. Start with a brief overview of key findings
      2. Use clear section headings without markdown symbols
      3. For numbered lists:
         a. Always start with 1. and increment sequentially
         b. Never skip numbers
         c. Never repeat numbers at the same level
         d. Ensure consistent indentation for nested items
      4. Highlight important trends or anomalies
      5. Include 3-5 actionable recommendations with PROPER numbering:
         - Each recommendation must start with a number and period
         - Numbering must be sequential (1., 2., 3., etc.)
         - Never mix numbered and bullet points in recommendations
      6. Format numbers and percentages clearly
      7. Keep the response professional but conversational
      8. Provide 3-4 specific follow-up questions at the end with EXACTLY this heading:
         "Follow-Up Questions:"
          - Each question must be numbered (1., 2., 3.)
          - Place them on separate lines
      9. Never use markdown formatting symbols (#, *, **, etc.)
      
      Current data context:
      - ${ticketData?.length || 0} tickets
      - Date range: ${startDate} to ${endDate}`;
  }, [ticketData, startDate, endDate]);

  // Memoized welcome message with richer content
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

  // Initialize chat
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        ...getWelcomeMessage()
      }]);
    }
  }, [isOpen, chatMessages.length, getWelcomeMessage]);

  // Enhanced response formatting with strict numbering validation
  const formatResponse = (text) => {
    // First pass cleanup
    text = text
      .replace(/<think>.*?<\/think>/s, '')
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');

    let suggestedQuestions = [];
    
    // Extract and validate follow-up questions
    const followUpMatch = text.match(/Follow-Up Questions:\s*((?:\d+\.\s*.*?\n)+)/i);
    if (followUpMatch) {
      suggestedQuestions = followUpMatch[1]
        .split('\n')
        .filter(line => line.trim())
        .map((line, i) => {
          // Validate question numbering
          const expectedNum = `${i + 1}.`;
          if (!line.startsWith(expectedNum)) {
            console.warn(`Question numbering mismatch. Expected ${expectedNum}, got ${line.split('.')[0]}.`);
            return line.replace(/^\d+\.\s*/, `${expectedNum} `).trim();
          }
          return line.replace(/^\d+\.\s*/, '').trim();
        });
      
      text = text.replace(followUpMatch[0], '');
    }

    // Validate and fix recommendation numbering
    text = text.replace(
      /(Recommendations?:\s*)((?:\d+\.\s*.+?\n)+)/gi,
      (match, heading, recommendations) => {
        const fixedRecs = recommendations
          .split('\n')
          .filter(line => line.trim())
          .map((line, i) => {
            const expectedNum = `${i + 1}.`;
            if (!line.startsWith(expectedNum)) {
              return `${expectedNum} ${line.replace(/^\d+\.\s*/, '')}`;
            }
            return line;
          })
          .join('\n');
        return `${heading}${fixedRecs}`;
      }
    );

    if (!text) return { content: null, suggestedQuestions };
    
    const sections = text.split(/\n\n+/);
    
    const formattedSections = sections.map((section, index) => {
      if (!section.trim()) return null;
      
      // Handle Key Findings section specially
      if (section.match(/Key Findings/i)) {
        const items = section.split('\n').slice(1).filter(l => l.trim());
        return (
          <div key={`keyfindings-${index}`} className="bg-blue-900/10 p-4 rounded-lg my-4 border-l-4 border-blue-500">
            <h3 className="text-lg font-bold text-blue-300 mb-3">Key Findings</h3>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2"></span>
                  <span>{item.trim().replace(/^-\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      }
      
      // Handle recommendations specially
      if (section.match(/Actionable Recommendations/i)) {
        const items = section.split('\n').slice(1).filter(l => l.trim());
        return (
          <div key={`rec-${index}`} className="mt-6 bg-gray-700/30 p-4 rounded-lg border border-green-900/30">
            <h4 className="text-lg font-semibold text-green-400 mb-3">Recommendations</h4>
            <ol className="list-decimal pl-5 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="pl-2">
                  {item.trim().replace(/^\d+\.\s*/, '')}
                </li>
              ))}
            </ol>
          </div>
        );
      }
      
      // Handle section titles with content (new improved formatting)
      if (section.match(/^[A-Z][a-zA-Z ]+:/)) {
        const [title, ...contentLines] = section.split('\n');
        const cleanTitle = title.replace(':', '').trim();
        const content = contentLines.join('\n').trim();
        
        return (
          <div key={`section-${index}`} className="my-4">
            <h4 className="text-md font-semibold text-blue-300 mb-2">{cleanTitle}</h4>
            <div className="bg-gray-700/20 p-3 rounded">
              {content.split('\n').map((line, i) => {
                if (!line.trim()) return null;
                
                // Handle numbered list items
                if (line.match(/^\d+\.\s/)) {
                  return (
                    <div key={i} className="flex items-start my-1 ml-4">
                      <span className="mr-2">{line.split(' ')[0]}</span>
                      <span>{line.substring(line.indexOf(' ') + 1)}</span>
                    </div>
                  );
                }
                
                // Handle bullet points
                if (line.match(/^-\s/)) {
                  return (
                    <div key={i} className="flex items-start my-1">
                      <span className="inline-block w-1.5 h-1.5 bg-gray-500 rounded-full mt-2 mr-2"></span>
                      <span>{line.replace(/^-\s/, '')}</span>
                    </div>
                  );
                }
                
                // Handle key-value pairs
                if (line.match(/:\s/)) {
                  const parts = line.split(':');
                  return (
                    <div key={i} className="my-1">
                      <span className="font-medium text-gray-300">{parts[0]}:</span>
                      <span>{parts.slice(1).join(':')}</span>
                    </div>
                  );
                }
                
                // Default line formatting
                return (
                  <p key={i} className="my-2">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        );
      }
      
      // Handle ticket items specially
      if (section.match(/Ticket ID:/)) {
        const lines = section.split('\n').map(l => l.trim());
        return (
          <div key={`ticket-${index}`} className="bg-gray-700/40 p-3 rounded-lg my-3 border-l-4 border-blue-500">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 py-1 text-sm">
                <span className="text-gray-400 font-medium">
                  {line.split(':')[0].trim()}:
                </span>
                <span className="col-span-2">
                  {line.split(':').slice(1).join(':').trim()}
                </span>
              </div>
            ))}
          </div>
        );
      }
      
      // Default paragraph formatting
      return (
        <p 
          key={`p-${index}`} 
          className="my-3 leading-relaxed text-gray-100"
        >
          {section.trim()}
        </p>
      );
    });

    return {
      content: formattedSections,
      suggestedQuestions
    };
  };

  const sendMessage = async (message, isUserMessage = true) => {
    if (!message.trim()) return;
    
    setIsLoading(true);
    
    if (isUserMessage) {
      // Add user message
      setChatMessages(prev => [...prev, {
        role: 'user',
        content: message,
        isRequest: true
      }]);
      setUserInput('');
    }
    
    try {
      const dataPayload = {
        userQuery: message,
        dateRange: { start: startDate, end: endDate },
        ticketCount: ticketData?.length || 0,
        sampleTickets: ticketData?.slice(0, 3) || []
      };

      console.log('API request payload:', dataPayload);
      
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: 'system', content: getSystemPrompt() },
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
      
      const data = await response.json();
      console.log('Full AI response:', data);
      
      let aiResponse = data.choices[0].message.content;
      const formattedResponse = formatResponse(aiResponse);
      
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        isAnalysis: true,
        suggestedQuestions: formattedResponse.suggestedQuestions
      }]);
      
    } catch (error) {
      console.error('Analysis error:', error);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again or rephrase your question.',
        suggestedQuestions: ["Can you rephrase your question?", "Would you like to try a different analysis?"]
      }]);
    } finally {
      console.groupEnd();
      setIsLoading(false);
    }
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
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-full md:w-96 bg-gray-800 shadow-xl z-50 flex flex-col border-l border-gray-600 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-4 bg-gray-700 flex justify-between items-center border-b border-gray-600">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaRobot className="text-blue-400" /> Data Analysis Assistant
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={clearConversation}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm flex items-center gap-1"
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
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {chatMessages.map((msg, index) => {
          const formattedResponse = formatResponse(msg.content);
          
          return (
            <div 
              key={index} 
              className={`p-4 rounded-lg ${msg.role === 'assistant' 
                ? 'bg-gray-700 mr-auto max-w-[90%] border-l-4 border-blue-500 space-y-4' 
                : 'bg-blue-900 ml-auto max-w-[90%] border-r-4 border-blue-400'}`}
            >
              {msg.role === 'assistant' ? (
                <>
                  {formattedResponse.content}
                  
                  {formattedResponse.suggestedQuestions && formattedResponse.suggestedQuestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gray-600">
                      <div className="text-sm text-gray-300 mb-2">You might want to ask:</div>
                      <div className="flex flex-wrap gap-2">
                        {formattedResponse.suggestedQuestions.map((question, qIndex) => (
                          <button
                            key={qIndex}
                            onClick={() => sendMessage(question, true)}
                            disabled={isLoading}
                            className="px-3 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
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
                  <span className="font-medium">Analysis request:</span> {msg.content}
                </div>
              )}
              
              {msg.showOptions && (
                <div className="mt-4">
                  <AnalysisOptions 
                    onSelect={handleAnalysisSelect} 
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          );
        })}
        
        {isLoading && (
          <div className="p-4 bg-gray-700 rounded-lg mr-auto max-w-[90%] border-l-4 border-blue-500">
            <div className="flex items-center gap-2 text-gray-300">
              <div className="animate-pulse">🔍</div>
              <div>Analyzing data...</div>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleUserInput} className="p-4 border-t border-gray-600">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask about the data..."
            className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded focus:outline-none focus:border-blue-500 text-gray-100"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !userInput.trim()}
            className="p-2 bg-blue-600 hover:bg-blue-500 rounded disabled:opacity-50 transition-colors"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Tip: Try asking about trends, patterns, or specific metrics
        </div>
      </form>
    </div>
  );
};

export default AiAnalyticsPanel;