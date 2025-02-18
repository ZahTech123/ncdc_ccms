import React, { useState } from 'react';

function SendEmail() {
  const [emailData, setEmailData] = useState({
    recipient: '',
    subject: '',
    body: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create an object to send as the POST request body
    const data = {
      recipient: emailData.recipient,
      subject: emailData.subject,
      body: emailData.body
    };

    try {
      const response = await fetch('https://script.google.com/macros/s/AKfycbwJmgcIoeipmlpY3o60Jn3mTLvX7H8GHKQP9yP42ZA4YgiRFV-3wFG57EUiMOOipveVNQ/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log(result); // Log the result to the console
      alert(result); // Alert success message
    } catch (error) {
      console.error("Error occurred:", error);
      alert("There was an error with the request. Please try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Send Email</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="recipient" className="block text-sm font-medium text-gray-700">Recipient Email</label>
          <input
            type="email"
            id="recipient"
            name="recipient"
            value={emailData.recipient}
            onChange={handleChange}
            placeholder="Recipient Email"
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={emailData.subject}
            onChange={handleChange}
            placeholder="Email Subject"
            required
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">Email Body</label>
          <textarea
            id="body"
            name="body"
            value={emailData.body}
            onChange={handleChange}
            placeholder="Email Body"
            required
            rows="4"
            className="mt-1 p-3 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-4 py-3 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Send Email
        </button>
      </form>
    </div>
  );
}

export default SendEmail;
