import React, { useState, useEffect, useRef } from 'react';

const HelpAndSupport = () => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome to the NCDC Complaint and Case Management System support. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isKnowledgeBaseLoaded, setIsKnowledgeBaseLoaded] = useState(false);
  const messagesContainerRef = useRef(null);
  
  // Groq API configuration
  const API_KEY = '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';
  const MODEL = 'llama-3.3-70b-versatile';
  
  // Knowledge Base configuration
  const KNOWLEDGE_BASE_DOC_ID = '1xpZQc4_E4cmDx2yK0gY2HXFh_7XxMt5WHGaXkv8v8Cw';
  const [knowledgeBaseContent, setKnowledgeBaseContent] = useState('');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Load knowledge base on component mount
  useEffect(() => {
    const fetchKnowledgeBase = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://docs.google.com/document/d/${KNOWLEDGE_BASE_DOC_ID}/export?format=txt`);
        if (!response.ok) throw new Error('Failed to load knowledge base');
        const content = await response.text();
        setKnowledgeBaseContent(content);
        setIsKnowledgeBaseLoaded(true);
      } catch (error) {
        console.error('Error loading knowledge base:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchKnowledgeBase();
    
    // Refresh knowledge base every 30 minutes
    const interval = setInterval(fetchKnowledgeBase, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatResponse = (text) => {
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      if (!paragraph.trim()) return null;
      
      // Handle bold text (**bold**)
      if (paragraph.includes('**')) {
        const parts = paragraph.split('**');
        return (
          <p key={`p-bold-${index}`} className="my-3">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={`strong-${i}`} className="font-semibold">{part}</strong>
              ) : (
                <span key={`span-${i}`}>{part}</span>
              )
            )}
          </p>
        );
      }
      
      // Handle bullet points (* or -)
      if (paragraph.match(/^[*\-•]\s/) || paragraph.match(/\n[*\-•]\s/)) {
        const items = paragraph.split(/\n(?=[*\-•]\s)/);
        return (
          <ul key={`ul-${index}`} className="list-disc pl-6 my-2 space-y-1">
            {items.map((item, i) => {
              const content = item.replace(/^[*\-•]\s/, '').trim();
              return (
                <li key={`li-${i}`} className="my-1.5">
                  {content.split('\n').map((line, lineIndex) => (
                    <p key={`line-${lineIndex}`} className={lineIndex > 0 ? 'mt-1' : ''}>
                      {line.trim()}
                    </p>
                  ))}
                </li>
              );
            })}
          </ul>
        );
      }
      
      // Handle numbered lists
      if (paragraph.match(/^\d+\.\s/)) {
        const items = paragraph.split(/\n(?=\d+\.\s)/);
        return (
          <ol key={`ol-${index}`} className="list-decimal pl-6 my-2 space-y-1">
            {items.map((item, i) => {
              const content = item.replace(/^\d+\.\s/, '').trim();
              return (
                <li key={`li-${i}`} className="my-1.5">
                  {content.split('\n').map((line, lineIndex) => (
                    <p key={`line-${lineIndex}`} className={lineIndex > 0 ? 'mt-1' : ''}>
                      {line.trim()}
                    </p>
                  ))}
                </li>
              );
            })}
          </ol>
        );
      }
      
      // Regular paragraph
      return <p key={`p-${index}`} className="my-3">{paragraph}</p>;
    });
  };

  const sendMessage = async () => {
    const input = userInput.trim();
    if (!input) return;
    
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Create system prompt with knowledge base
      const systemPrompt = isKnowledgeBaseLoaded
        ? `You are an expert on the NCDC Complaint and Case Management System. 
           Strictly use ONLY the following information to answer questions in a direct, professional manner. 
           Do not begin responses with "According to the NCDC documentation" - instead, 
           provide the information directly as if you are the system itself.
           If the answer isn't in this context, say "This information is not available in the system documentation."
           
           NCDC DOCUMENTATION:
           ${knowledgeBaseContent}`
        : "The NCDC knowledge base is still loading. Please try again shortly.";
      
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
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      
      if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
      
      const data = await response.json();
      let aiResponse = data.choices[0].message.content;
      
      // Remove any remaining "According to..." phrases that might slip through
      aiResponse = aiResponse.replace(/^According to (the )?NCDC documentation(,)?\s*/i, '');
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      { role: 'assistant', content: 'Welcome to the NCDC Complaint and Case Management System support. How can I help you today?' }
    ]);
  };

  return (
    <div className="text-gray-300 mt-8 p-4">
      <header className="bg-yellow-500 text-white py-6 text-center pr-4 pl-4 rounded-t-lg">
        <h1 className="text-3xl font-semibold">How Can We Help?</h1>
        <p className="mt-2 text-gray-200">NCDC Complaint and Case Management System Support</p>
      </header>

      <div className="max-w-4xl mx-auto mt-6">
        {/* Welcome content */}
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

        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden mb-8">
          <div className="w-full">
            <div 
              ref={messagesContainerRef}
              className="p-6 min-h-[200px] max-h-[500px] overflow-y-auto"
            >
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`mb-4 p-4 rounded-lg ${message.role === 'user' 
                    ? 'bg-blue-900 ml-auto max-w-[80%]' 
                    : 'bg-gray-700 mr-auto max-w-[80%]'}`}
                >
                  {message.role === 'assistant' ? formatResponse(message.content) : message.content}
                </div>
              ))}
              {isLoading && <div className="text-gray-400 italic">Processing...</div>}
            </div>
            
            <div className="p-4 bg-gray-700 border-t border-gray-600">
              <div className="flex gap-2">
                <textarea 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question..."
                  className="flex-1 p-3 text-gray-800 bg-gray-200 rounded"
                  rows="2"
                  disabled={!isKnowledgeBaseLoaded}
                />
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={sendMessage}
                    disabled={isLoading || !isKnowledgeBaseLoaded}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-white rounded disabled:opacity-50"
                  >
                    Send
                  </button>
                  <button 
                    onClick={clearConversation}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded"
                  >
                    Clear
                  </button>
                </div>
              </div>
              {!isKnowledgeBaseLoaded && (
                <p className="text-yellow-400 text-sm mt-2">
                  System is loading documentation. Please wait before sending questions.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sample Questions section (now always visible) */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Sample Questions</h2>
          <ul className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4 border border-gray-600">
            {[
              "How do I submit a new complaint?",
              "What are the complaint status levels?",
              "How to escalate a case?",
              "What reports are available?",
              "How to update a case status?"
            ].map((question, index) => (
              <li 
                key={index} 
                className="flex justify-between items-center hover:text-white cursor-pointer"
                onClick={() => setUserInput(question)}
              >
                <span>{question}</span>
                <span>→</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <footer className="text-center mt-12 py-6">
        <p className="space-x-4">
          <a href="/help" className="text-yellow-500 hover:text-yellow-400">Help</a>
          <a href="/faq" className="text-yellow-500 hover:text-yellow-400">FAQ</a>
          <a href="/contact" className="text-yellow-500 hover:text-yellow-400">Contact</a>
        </p>
        <p className="mt-4 text-gray-500">&copy; {new Date().getFullYear()} NCDC. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HelpAndSupport;