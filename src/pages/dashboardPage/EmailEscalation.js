import emailjs from 'emailjs-com';

// Initialize EmailJS with your Public Key
emailjs.init("4aWPJtcDKE1eCcfDk");  // Replace with your Public Key

export const sendEmail = async (ticket) => {
  try {
    await emailjs.send("service_0lequ6f", "template_6ob0cq9", {
      to_email: "Heni.sarwom@qrfpng.com",
      cc_email: "sarwomjohn@gmail.com", // Add CC email address
      recipient_name: "Recipient Name", // Replace with dynamic data if available
      ticket_id: ticket.id,
      issue_type: ticket.issueType,
      status: "Submitted",
      date_submitted: ticket.dateSubmitted,
      location: ticket.suburb,
      assigned_to: ticket.team,
      priority: ticket.priority,
      resolution_progress: "Initial Status",
      escalation_info: "N/A", // Replace with dynamic data if available
      completion_date: "N/A", // Replace with dynamic data if available
      resident_feedback: "N/A", // Replace with dynamic data if available
      electorate: ticket.electorate,
      coordinates: `${ticket.latitude}, ${ticket.longitude}`,
      description: ticket.description,
      contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg", // Replace with actual contact info
    });
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};