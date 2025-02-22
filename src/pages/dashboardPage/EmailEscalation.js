// src/utils/EmailEscalation.js
import emailjs from "emailjs-com";
import { db } from "../../firebaseConfig"; // Firestore instance
import { doc, setDoc } from "firebase/firestore";

// Initialize EmailJS with your Public Key
emailjs.init("SimW6urql2il_yFhB"); // Replace with your Public Key

class EmailEscalation {
  static async escalateTicket(ticket, setTickets, setNewTickets) {
    try {
      // Send email
      await emailjs.send("service_jlnl89i", "template_gohitig", {
        to_email: "sarwomjohn@gmail.com",
        recipient_name: "Recipient Name",
        ticket_id: ticket.id,
        issue_type: ticket.issueType,
        status: ticket.status,
        date_submitted: ticket.dateSubmitted,
        location: ticket.suburb,
        assigned_to: ticket.team,
        priority: ticket.priority,
        resolution_progress: "Initial Status",
        escalation_info: "N/A",
        completion_date: "N/A",
        resident_feedback: "N/A",
        electorate: ticket.electorate,
        coordinates: `${ticket.latitude}, ${ticket.longitude}`,
        description: ticket.description,
        contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg",
      });
      console.log("Email sent successfully");
    } catch (error) {
      console.error("Failed to send email:", error);
    }

    // Update ticket data
    const updatedData = {
      currentHandler: "Supervisor",
      description: `${ticket.description}\nOperator | ${new Date().toLocaleString()} | Overdue | Ticket overdue - Forwarded to Supervisor`,
      status: "Overdue",
    };

    const ticketRef = doc(db, "complaints", ticket.id);
    await setDoc(ticketRef, updatedData, { merge: true });

    // Update local state
    setTickets((prevTickets) =>
      prevTickets.map((t) =>
        t.id === ticket.id ? { ...t, ...updatedData } : t
      )
    );

    // Add a notification to newTickets
    setNewTickets((prevNotifications) => [
      ...prevNotifications,
      {
        id: ticket.id,
        currentHandler: updatedData.currentHandler,
        status: updatedData.status,
        description: `Ticket Escalated to ${updatedData.currentHandler}`,
        dateSubmitted: new Date().toISOString(),
        suburb: ticket.suburb,
      },
    ]);
  }
}

export default EmailEscalation;