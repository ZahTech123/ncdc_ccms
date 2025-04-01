// useEmailNotifications.js
import { useEffect } from "react";
import emailjs from "emailjs-com";
import { db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

emailjs.init("SimW6urql2il_yFhB"); // Replace with your Public Key

export const useEmailNotifications = (tickets) => {
  useEffect(() => {
    const timers = tickets
      .filter((ticket) => ticket.currentHandler === "operator" && ticket.status === "pending")
      .map((ticket) => {
        return setTimeout(async () => {
          try {
            await emailjs.send("service_jlnl89i", "template_gohitig", {
              to_email: "Heni.sarwom@qrfpng.com",
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

          const updatedData = {
            currentHandler: "Supervisor",
            description: `${ticket.description}\nOperator | ${new Date().toLocaleString()} | Overdue | Ticket overdue - Forwarded to Supervisor`,
            status: "Overdue",
          };

          const ticketRef = doc(db, "complaints", ticket.id);
          await setDoc(ticketRef, updatedData, { merge: true });

          setTickets((prevTickets) =>
            prevTickets.map((t) =>
              t.id === ticket.id ? { ...t, ...updatedData } : t
            )
          );
        }, 24000); // 24 seconds
      });

    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [tickets]);
};