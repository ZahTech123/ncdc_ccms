import React, { useEffect, useState } from 'react';

const HelpAndSupport = () => {
  const [showTopics, setShowTopics] = useState(true);

  useEffect(() => {
    // Function to clean up any existing chatbot
    const cleanup = () => {
      // Remove specific Botpress scripts by src
      const scriptSources = [
        'https://cdn.botpress.cloud/webchat/v2.2/inject.js',
        'https://files.bpcontent.cloud/2025/02/19/09/20250219091622-E0RFDPS0.js'
      ];
      
      document.querySelectorAll('script').forEach(script => {
        if (scriptSources.includes(script.src)) {
          script.remove();
        }
      });
      
      // Remove existing scripts by ID
      ['botpress-webchat', 'botpress-custom-script'].forEach(id => {
        const scriptElement = document.getElementById(id);
        if (scriptElement) {
          scriptElement.remove();
        }
      });
      
      // Remove any Botpress elements
      const bpElements = document.querySelectorAll('[id^="bp-"]');
      bpElements.forEach(element => element.remove());
      
      // Remove any iframes
      document.querySelectorAll('iframe').forEach(iframe => {
        if (iframe.src && iframe.src.includes('botpress') && !iframe.id.includes('fullpage-chat')) {
          iframe.remove();
        }
      });
      
      // Close webchat if exists
      if (window.botpressWebChat && window.botpressWebChat.close) {
        window.botpressWebChat.close();
      }
      
      delete window.botpressWebChat;
    };

    // Clean up first
    cleanup();

    // Create chat container
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    
    // Function to load the full-page chat interface
    const loadChat = async () => {
      try {
        // Create an iframe to contain the chat
        const chatFrame = document.createElement('iframe');
        chatFrame.id = 'fullpage-chat';
        chatFrame.src = 'https://cdn.botpress.cloud/webchat/v2.3/shareable.html?configUrl=https://files.bpcontent.cloud/2025/02/19/09/20250219091622-7OOWPKY5.json&_gl=1*19ccqii*_gcl_au*NTY1ODUxMzYuMTczOTg0MjQyNg..*_ga*MTE0OTkyMDE3Mi4xNzM5ODQyNDI3*_ga_HKHSWES9V9*MTc0MTMyMDIyOS43LjEuMTc0MTMyMTQ3OS42MC4wLjgzMzI0MDgxOA..';
        chatFrame.style.width = '100%';
        chatFrame.style.height = '500px';
        chatFrame.style.border = 'none';
        chatFrame.style.borderRadius = '8px';
        
        // Clear the container and add the iframe
        chatContainer.innerHTML = '';
        chatContainer.appendChild(chatFrame);
        
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };

    // Load the chat
    loadChat();

    // Clean up on unmount
    return cleanup;
  }, []);

  // Toggle visibility of topics and articles when chat is active
  const toggleTopics = () => {
    setShowTopics(!showTopics);
  };

  return (
    <div className="text-gray-300 mt-8 p-4">
      {/* Header */}
      <header className="bg-yellow-500 text-white py-6 text-center pr-4 pl-4 rounded-t-lg">
        <h1 className="text-3xl font-semibold">How Can We Help?</h1>
        <p className="mt-2 text-gray-200">Find advice and answers from our support team</p>
      </header>

      {/* Main Container - contains chat and other content */}
      <div className="max-w-4xl mx-auto mt-6">
        {/* Chat Interface */}
        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden mb-8">
          <div id="chat-container" className="w-full h-500">
            <div className="flex justify-center items-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
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

        {/* Collapsible Topics and Articles */}
        {showTopics && (
          <>
            {/* Topics */}
            <section className="mt-6">
              <h2 className="text-center text-xl font-semibold mb-6">Browse All Topics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Getting Started", desc: "Learn how to get your account set up, create users, and start submitting complaints." },
                  { title: "Complaint Management", desc: "Managing your complaints, tracking progress, and understanding escalation protocols." },
                  { title: "Troubleshooting", desc: "Find solutions to common technical issues related to the complaint system." }
                ].map((topic, index) => (
                  <div key={index} className="bg-gray-800 p-6 rounded-lg shadow-md text-center border border-gray-600">
                    <h3 className="font-semibold text-lg text-white">{topic.title}</h3>
                    <p className="text-gray-400 mt-2">{topic.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Featured Articles */}
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-4">Featured Articles</h2>
              <ul className="bg-gray-800 p-6 rounded-lg shadow-md space-y-4 border border-gray-600">
                {[
                  "How to Submit a Complaint",
                  "Understanding the Escalation Process",
                  "How to Track Your Complaint Status",
                  "Generating Weekly and Monthly Reports",
                  "Managing Complaint Categories and Priorities"
                ].map((article, index) => (
                  <li key={index} className="flex justify-between items-center hover:text-white cursor-pointer">
                    <span>{article}</span>
                    <span>→</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>

      {/* Footer */}
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