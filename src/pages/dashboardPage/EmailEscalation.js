import emailjs from 'emailjs-com';

// Initialize EmailJS with your Public Key
emailjs.init("4aWPJtcDKE1eCcfDk"); // Replace with your actual Public Key

export const sendEmail = async (ticket) => {
  try {
    await emailjs.send("service_0lequ6f","template_iagffxk", {
      to_email: "Heni.sarwom@qrfpng.com",
      cc_email: "sarwomjohn@gmail.com", // CC email address
      recipient_name: ticket.name || "Recipient", // Use dynamic data if available

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
      description: ticket.description,
      contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg", 
    });

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
