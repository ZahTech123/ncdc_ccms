import React, { useEffect } from 'react';

const HelpAndSupport = () => {
  useEffect(() => {
    // Prevent duplicate script injection
    if (document.getElementById("botpress-webchat")) return;

    const script = document.createElement("script");
    script.id = "botpress-webchat";
    script.src = "https://cdn.botpress.cloud/webchat/v2/inject.js";
    script.async = true;
    script.onload = () => {
      window.botpressWebChat.init({
        composerPlaceholder: "Ask me anything...",
        botId: "your-bot-id",
        hostUrl: "https://cdn.botpress.cloud/webchat/v2",
        messagingUrl: "https://messaging.botpress.cloud",
        clientId: "your-client-id",
        lazySocket: true,
        themeName: "prism",
        stylesheet: "https://cdn.botpress.cloud/webchat/v2/themes/prism/prism.css",
      });
    };

    document.body.appendChild(script);
  }, []);

  return (
    <div className="text-gray-300 mt-8 p-4">
      {/* Header */}
      <header className="bg-yellow-500 text-white py-6 text-center pr-4 pl-4">
        <h1 className="text-3xl font-semibold">How Can We Help?</h1>
        <p className="mt-2 text-gray-200">
          Find advice and answers from our support team fast or get in touch
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search for answers..."
            className="px-4 py-2 w-1/2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-white-900"
          />
        </div>
      </header>

      {/* Topics */}
      <section className="max-w-4xl mx-auto mt-12">
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

      {/* Botpress Chatbot Container */}
      <div id="botpress-webchat-container" className="mt-12"></div>

      {/* Contact */}
      <section className="text-center mt-12">
        <h2 className="text-lg font-semibold">Didn't find an answer to your question?</h2>
        <p className="mt-2">
          Get in touch with us for details on additional services, custom work pricing, or technical support.
        </p>
        <button className="mt-4 bg-yellow-500 hover:bg-yellow-400 text-white px-6 py-2 rounded-lg shadow-md">
          CONTACT US
        </button>
      </section>

      {/* Footer */}
      <footer className="text-center mt-12 py-6">
        <p>
          <a href="/help">Help</a>
          <a href="/faq">FAQ</a>
          <a href="/contact">Contact</a>
        </p>
        <p className="mt-4 text-gray-500">&copy; {new Date().getFullYear()} QRF Limited. All rights reserved.</p>
        <p className="text-gray-500">Empowering businesses with seamless complaint resolution.</p>
      </footer>
    </div>
  );
};

export default HelpAndSupport;
