import React, { useState, useEffect } from 'react';

const HelpAndSupport = () => {
  const [showTopics, setShowTopics] = useState(true);
  const [userInput, setUserInput] = useState('');
  // API key is hardcoded and not visible/editable by users
  const apiKey = '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';
  const [response, setResponse] = useState('Welcome to the NCDC Complaint and Case Management System support. How can I help you today?');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isKnowledgeBaseLoaded, setIsKnowledgeBaseLoaded] = useState(false);
  
  // The document ID from your shared Google Doc
  const KNOWLEDGE_BASE_DOC_ID = '1xpZQc4_E4cmDx2yK0gY2HXFh_7XxMt5WHGaXkv8v8Cw';
  
  // Store knowledge base content in state but never expose to UI
  const [knowledgeBaseContent, setKnowledgeBaseContent] = useState('');
  
  // Load knowledge base on component mount
  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  // Function to fetch the Google Doc content
  const fetchKnowledgeBase = async () => {
    setIsLoading(true);
    try {
      // This is a proxy approach since client-side JS can't directly access Google Docs
      // In a production environment, you would use a backend service for this
      const response = await fetch(`https://docs.google.com/document/d/${KNOWLEDGE_BASE_DOC_ID}/export?format=txt`);
      
      if (!response.ok) {
        throw new Error('Failed to load knowledge base document');
      }
      
      const content = await response.text();
      setKnowledgeBaseContent(content);
      setIsKnowledgeBaseLoaded(true);
      setIsLoading(false);
      // Keep the welcome message rather than changing it
    } catch (error) {
      setIsLoading(false);
      setIsError(true);
      console.error(`Error loading knowledge base: ${error.message}`);
      // Don't show the error in the chat interface
    }
  };

  // Function to format text with better structure
  const formatResponse = (text) => {
    // Remove formatting that we don't want (emojis, ## headers, etc.)
    let cleanedText = text
      // eslint-disable-next-line no-control-regex
      .replace(/🌌|[^\x00-\x7F]/g, '') // Remove emojis and non-ASCII characters
      .replace(/##\s*/g, '')          // Remove ## header markers
      .replace(/\*\*/g, '');          // Remove bold formatting (** symbols)
    
    // Check if the response contains numbered sections
    if (cleanedText.match(/\d+\.\s/)) {
      // First, split by potential section markers like numbers with periods (1., 2., etc.)
      const sections = cleanedText.split(/(?=\d+\.\s)/);
      
      return (
        <div className="formatted-response">
          {sections.map((section, index) => {
            // For the intro paragraph (usually doesn't start with a number)
            if (index === 0 && !section.match(/^\d+\.\s/)) {
              return <p key={`intro`} className="my-3">{section.trim()}</p>;
            }
            
            // For numbered sections, create a proper heading and content
            const sectionMatch = section.match(/^(\d+\.\s)(.*?)(?=\s-|\n|$)/);
            
            if (sectionMatch) {
              const [, number, title] = sectionMatch;
              const content = section.substring(sectionMatch[0].length).trim();
              
              // Split content into bullet points if they exist
              const bulletPoints = content.split(/(?=\s-\s|\s•\s)/);
              
              return (
                <div key={`section-${index}`} className="mb-4">
                  <h3 className="text-lg font-semibold mt-4 mb-2">{number}{title}</h3>
                  {bulletPoints.map((point, i) => {
                    // Clean up bullet points from either • or - formats
                    const cleanPoint = point.replace(/^\s[-•]\s/, '').trim();
                    if (cleanPoint) {
                      return <p key={`bullet-${i}`} className="pl-4 my-1">• {cleanPoint}</p>;
                    }
                    return null;
                  })}
                </div>
              );
            }
            
            // Fallback for any other content
            return <p key={`p-${index}`} className="my-2">{section.trim()}</p>;
          })}
          
          {/* Handle any final sections like "Next Steps" that might not have number markers */}
          {cleanedText.includes("Next Steps:") && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Next Steps:</h3>
              {cleanedText
                .split("Next Steps:")[1]
                .split(/(?=\s[-•]\s)/)
                .map((step, i) => {
                  const cleanStep = step.replace(/^\s[-•]\s/, '').trim();
                  if (cleanStep) {
                    return <p key={`next-${i}`} className="pl-4 my-1">• {cleanStep}</p>;
                  }
                  return null;
                })}
            </div>
          )}
        </div>
      );
    } else {
      // If there are no numbered sections, just render paragraphs
      const paragraphs = cleanedText.split(/\n+/);
      return (
        <div className="formatted-response">
          {paragraphs.map((paragraph, index) => (
            <p key={`p-${index}`} className="my-2">{paragraph.trim()}</p>
          ))}
        </div>
      );
    }
  };

  // Function to send message to OpenRouter API with context from knowledge base
  const sendMessage = async () => {
    const input = userInput.trim();
    
    if (!input) {
      return; // Don't send empty messages
    }
    
    // Clear input field
    setUserInput('');
    
    // Show loading message
    setResponse('Loading...');
    setIsLoading(true);
    setIsError(false);
    
    try {
      // Use the knowledge base content as context
      const systemPrompt = isKnowledgeBaseLoaded 
        ? `You are a helpful assistant. Use ONLY the following information to answer the user's question. If the information doesn't contain the answer, say you don't know but only based on the provided context. Don't make up information.\n\nCONTEXT:\n${knowledgeBaseContent}`
        : "You are a helpful assistant. The knowledge base isn't loaded yet. Please ask the user to reload the page or check the document permissions.";
      
      const response = await fetch(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://www.webstylepress.com',
            'X-Title': 'WebStylePress',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'deepseek/deepseek-r1:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: input }
            ]
          })
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      // Extract response content from API response
      const markdownText = data?.choices?.[0]?.message?.content || 'No response received.';
      
      // Display the response
      setResponse(markdownText);
      setIsLoading(false);
      
    } catch (error) {
      setResponse(`Error: ${error.message}`);
      setIsLoading(false);
      setIsError(true);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const toggleTopics = () => {
    setShowTopics(!showTopics);
  };

  // Function to reload knowledge base - still works in the background
  // but no longer exposed in the UI
  useEffect(() => {
    // Set up automatic reload every 30 minutes
    const reloadInterval = setInterval(() => {
      fetchKnowledgeBase();
    }, 30 * 60 * 1000); // 30 minutes in milliseconds
    
    return () => clearInterval(reloadInterval);
  }, []);

  return (
    <div className="text-gray-300 mt-8 p-4">
      <header className="bg-yellow-500 text-white py-6 text-center pr-4 pl-4 rounded-t-lg">
        <h1 className="text-3xl font-semibold">How Can We Help?</h1>
        <p className="mt-2 text-gray-200">Find advice and answers from our NCDC Complaint and Case Management System</p>
      </header>

      <div className="max-w-4xl mx-auto mt-6">
        {/* Welcome content MOVED HERE - above the chat interface */}
        <section className="mb-8">
          <h2 className="text-center text-xl font-semibold mb-6">Welcome to NCDC CCMS Support</h2>
          <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-600">
            <h3 className="font-semibold text-lg text-white mb-2">About the System</h3>
            <p className="text-gray-400 mt-2">
              The NCDC Complaint and Case Management System (CCMS) is designed to streamline 
              the handling, escalation, and resolution of municipal service complaints in Port Moresby. 
              This support chat can help you understand how to use the system effectively.
            </p>
            <div className="mt-4 p-3 bg-gray-700 rounded">
              <h4 className="font-medium text-white">How to use this chat</h4>
              <p className="text-gray-400 mt-1">
                Simply type your question in the chat box above and press send. Our system will 
                provide you with relevant information about the CCMS system based on our knowledge base.
              </p>
            </div>
          </div>
        </section>

        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden mb-8">
          <div id="chat-container" className="w-full">
            {/* Advanced Settings section completely removed from UI */}
            
            {/* Chat Display with improved formatting */}
            <div className="p-6 min-h-[200px] max-h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="text-gray-400 italic">Loading...</div>
              ) : isError ? (
                <div className="text-red-400">{response}</div>
              ) : (
                formatResponse(response)
              )}
            </div>
            
            {/* Input Area */}
            <div className="p-4 bg-gray-700 border-t border-gray-600">
              <div className="flex gap-2">
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question here..."
                  className="flex-1 p-3 text-gray-800 bg-gray-200 rounded"
                  rows="2"
                />
                <button 
                  onClick={sendMessage}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toggle button for showing/hiding topics */}
        <div className="text-center mb-6">
          <button 
            onClick={toggleTopics}
            className="bg-yellow-500 hover:bg-yellow-400 text-white px-4 py-2 rounded-lg"
          >
            {showTopics ? "Hide Resources" : "Show Resources"}
          </button>
        </div>

        {/* Sample Questions Section - kept below */}
        {showTopics && (
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Sample Questions</h2>
            <ul className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4 border border-gray-600">
              {[
                "What is the primary purpose of the system?",
                "How do I submit a new complaint?",
                "What are the different status levels for complaints?",
                "How does the escalation process work?",
                "What reporting capabilities are available?"
              ].map((question, index) => (
                <li 
                  key={index} 
                  className="flex justify-between items-center hover:text-white cursor-pointer"
                  onClick={() => {
                    setUserInput(question);
                  }}
                >
                  <span>{question}</span>
                  <span>→</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <footer className="text-center mt-12 py-6">
        <p className="space-x-4">
          <a href="/help" className="text-yellow-500 hover:text-yellow-400">Help</a>
          <a href="/faq" className="text-yellow-500 hover:text-yellow-400">FAQ</a>
          <a href="/contact" className="text-yellow-500 hover:text-yellow-400">Contact</a>
        </p>
        <p className="mt-4 text-gray-500">&copy; {new Date().getFullYear()} QRF Limited. All rights reserved.</p>
        <p className="text-gray-500">Empowering businesses with seamless complaint resolution.</p>
      </footer>
    </div>
  );
};

export default HelpAndSupport;