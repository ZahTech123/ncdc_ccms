import emailjs from 'emailjs-com';

// Initialize EmailJS with your Public Key
emailjs.init("4aWPJtcDKE1eCcfDk"); // Replace with your actual Public Key

export const sendEmail = async (ticket) => {
  try {
    // // Extract the comment from the description
    // const descriptionParts = ticket.description.split('|');
    // const comment = descriptionParts[descriptionParts.length - 1].trim();
   

    await emailjs.send("service_0lequ6f", "template_iagffxk", {
      to_email:  "benjaminb@ncdc.gov.pg",
      recipient_name: ticket.name || "Recipient", // Use dynamic data if available
      cc_email: "heni.sarwom@qrfpng.com", 
      issue_type: ticket.issueType,
      status: ticket.status || "Submitted",
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
      description: "Gerehu stage 2, canteen named Jamas Trading is operating without a licence", // Only the comment is passed here
      contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg",
      ticket_id: ticket.ticketId || "N/A", // Add the ticket ID here
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};