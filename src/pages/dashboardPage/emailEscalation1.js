import emailjs from "emailjs-com";

// Initialize EmailJS with your Public Key
emailjs.init("4aWPJtcDKE1eCcfDk");

/**
 * Function to monitor tickets and trigger escalation emails
 * @param {Array} tickets - List of tickets
 * @param {String} role - The user's role
 * @param {Function} updateTicket - Function to update ticket in database
 */
export const monitorTicketsForEscalation = (tickets, role, updateTicket) => {
  // Filter tickets based on conditions
  const ticketsToEscalate = tickets.filter((ticket) => {
    const validRoles = [
      "bU_adminC",
      "bU_supervisorC",
      "bU_managerC",
      "bU_directorC",
      "bU_adminS_L",
      "bU_supervisorS_L",
      "bU_managerS_L",
      "bU_directorS_L",
      "bU_adminCPI",
      "bU_supervisorCPI",
      "bU_managerCPI",
      "bU_directorCPI"
    ];

    return (
      validRoles.includes(role) &&
      (ticket.status === "In Progress" || ticket.status === "Overdue") &&
      ticket.emailEscalation === false
    );
  });

  // Process each ticket that meets the conditions
  ticketsToEscalate.forEach((ticket) => {
    // Set a timeout to send the email after 24 seconds
    setTimeout(() => {
      // Email template parameters
      const emailParams = {
        to_email: "sarwomjohn@gmail.com",
        ticket_id: ticket.ticketId || "N/A",
        issue_type: ticket.issueType || "N/A",
        status: ticket.status || "N/A",
        date_submitted: ticket.dateSubmitted || "N/A",
        location: ticket.suburb || "N/A",
        assigned_to: ticket.team || "N/A",
        priority: ticket.priority || "N/A",
        description: ticket.description || "N/A",
        contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg",
      };

      // Send the email using EmailJS
      emailjs.send(
        "service_0lequ6f",
        "template_e75hmf5",
        emailParams
      )
      .then((response) => {
        console.log("Escalation email sent successfully:", response);
        
        // Update the ticket's emailEscalation field to true
        const updatedTicket = {
          ...ticket,
          emailEscalation: true
        };
        
        // Call the updateTicket function to persist the change
        updateTicket(updatedTicket)
          .then(() => {
            console.log("Ticket emailEscalation status updated to true");
          })
          .catch((error) => {
            console.error("Failed to update ticket:", error);
          });
      })
      .catch((error) => {
        console.error("Failed to send escalation email:", error);
      });
    }, 120000); // 24 seconds = 24000 milliseconds
  });
};