// src/components/TicketTracker.js
import React, { useState } from 'react';

const TicketTracker = () => {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState('');

  const addTicket = () => {
    if (newTicket.trim() !== '') {
      setTickets([...tickets, { id: Date.now(), text: newTicket, status: 'Open' }]);
      setNewTicket('');
    }
  };

  const closeTicket = (id) => {
    setTickets(tickets.map(ticket => 
      ticket.id === id ? { ...ticket, status: 'Closed' } : ticket
    ));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ticket Tracker</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newTicket}
          onChange={(e) => setNewTicket(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Enter new ticket"
        />
        <button onClick={addTicket} className="bg-blue-500 text-white p-2">
          Add Ticket
        </button>
      </div>
      <div>
        {tickets.map(ticket => (
          <div key={ticket.id} className="border p-4 mb-2">
            <div className="flex justify-between">
              <span>{ticket.text}</span>
              <span className={`font-bold ${ticket.status === 'Open' ? 'text-green-500' : 'text-red-500'}`}>
                {ticket.status}
              </span>
            </div>
            <button onClick={() => closeTicket(ticket.id)} className="bg-red-500 text-white p-1 mt-2">
              Close Ticket
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TicketTracker;