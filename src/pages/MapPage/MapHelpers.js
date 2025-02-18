import {
    FaTrash,
    FaLightbulb,
    FaTrafficLight,
    FaHardHat,
    FaExclamationTriangle,
  } from "react-icons/fa";
  import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
  import { createRoot } from "react-dom/client";
  
  // Helper function to create popup content
  export const createPopupContent = (complaint) => {
    const popupContent = document.createElement("div");
    popupContent.className = "custom-popup";
  
    // Create a container for the icon
    const iconContainer = document.createElement("div");
    iconContainer.style.width = "24px";
    iconContainer.style.height = "24px";
    iconContainer.style.borderRadius = "50%";
    iconContainer.style.backgroundColor = "#d1d5db";
    iconContainer.style.display = "flex";
    iconContainer.style.alignItems = "center";
    iconContainer.style.justifyContent = "center";
  
    // Define the icon based on the issue type
    const icon = {
      "Garbage and Sanitation": <FaTrash size={16} color="black" />, // Single icon for "Garbage and Sanitation"
      "Street Lights": <FaLightbulb size={16} color="black" />,
      "Crime Alert": <FaExclamationTriangle size={16} color="black" />,
      "Traffic Lights": <FaTrafficLight size={16} color="black" />,
      "Pothole Roads": <FaHardHat size={16} color="black" />,
    }[complaint.issueType] || (
      <HiOutlineQuestionMarkCircle size={16} color="white" />
    );
  
    // Render the icon into the container using createRoot
    const root = createRoot(iconContainer);
    root.render(icon);
  
    // Create the popup content structure
    const popupInner = document.createElement("div");
    popupInner.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    popupInner.style.padding = "16px 32px 16px 16px";
    popupInner.style.borderRadius = "12px";
    popupInner.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    popupInner.style.width = "320px";
    popupInner.style.position = "relative";
    popupInner.style.display = "flex";
    popupInner.style.flexDirection = "column";
    popupInner.style.boxSizing = "border-box";
  
    // Create the issue type section
    const issueTypeSection = document.createElement("div");
    issueTypeSection.style.display = "flex";
    issueTypeSection.style.alignItems = "center";
    issueTypeSection.style.gap = "8px";
    issueTypeSection.style.marginBottom = "6px";
  
    // Append the icon container to the issue type section
    issueTypeSection.appendChild(iconContainer);
  
    // Add the issue type text
    const issueTypeText = document.createElement("h3");
    issueTypeText.style.fontSize = "18px";
    issueTypeText.style.fontWeight = "600";
    issueTypeText.style.color = "black";
    issueTypeText.textContent = complaint.issueType;
    issueTypeSection.appendChild(issueTypeText);
  
    // Append the issue type section to the popup inner content
    popupInner.appendChild(issueTypeSection);
  
    // Create the ticket ID and status section
    const ticketIdSection = document.createElement("div");
    ticketIdSection.style.display = "flex";
    ticketIdSection.style.justifyContent = "space-between";
    ticketIdSection.style.alignItems = "center";
    ticketIdSection.style.width = "100%";
    ticketIdSection.style.marginBottom = "6px";
  
    // Add the ticket ID
    const ticketIdText = document.createElement("p");
    ticketIdText.style.fontWeight = "bold";
    ticketIdText.style.color = "black";
    ticketIdText.textContent = `Ticket ID: #${complaint.id}`;
    ticketIdSection.appendChild(ticketIdText);
  
    // Add the status badge
    const statusBadge = document.createElement("span");
    statusBadge.style.display = "inline-block";
    statusBadge.style.padding = "6px 12px";
    statusBadge.style.fontSize = "14px";
    statusBadge.style.borderRadius = "20px";
    statusBadge.style.fontWeight = "600";
    statusBadge.style.color = "white";
    statusBadge.style.whiteSpace = "nowrap";
    statusBadge.style.backgroundColor =
      {
        New: "#10b981",
        "In Progress": "#d9cc41",
        Resolved: "#6b7280",
        Pending: "#ef4444",
      }[complaint.status] || "#6b7280";
    statusBadge.textContent = complaint.status;
    ticketIdSection.appendChild(statusBadge);
  
    // Append the ticket ID section to the popup inner content
    popupInner.appendChild(ticketIdSection);
  
    // Add a divider
    const divider = document.createElement("hr");
    divider.style.border = "none";
    divider.style.height = "1px";
    divider.style.backgroundColor = "#e5e7eb";
    divider.style.margin = "12px 0";
    divider.style.width = "100%";
    popupInner.appendChild(divider);
  
    // Add the location
    const locationText = document.createElement("p");
    locationText.style.color = "gray";
    locationText.style.fontSize = "14px";
    locationText.style.marginBottom = "12px";
    locationText.textContent = `Location: ${complaint.suburb || "N/A"}`;
    popupInner.appendChild(locationText);
  
    // Add the description
    const descriptionText = document.createElement("p");
    descriptionText.style.color = "#4b5563";
    descriptionText.style.fontSize = "14px";
    descriptionText.style.marginBottom = "16px";
  
    // Check if description exists and truncate if it's too long
    const descriptionContent = complaint.description
      ? complaint.description.length > 100 // Adjust the character limit as needed
        ? `${complaint.description.substring(0, 100)}...`
        : complaint.description
      : "No description provided.";
  
    descriptionText.textContent = descriptionContent;
  
    popupInner.appendChild(descriptionText);
  
    // Add the "See More" button
    const seeMoreButton = document.createElement("button");
    seeMoreButton.style.width = "100%";
    seeMoreButton.style.padding = "10px 0";
    seeMoreButton.style.backgroundColor = "#eab308";
    seeMoreButton.style.color = "white";
    seeMoreButton.style.borderRadius = "8px";
    seeMoreButton.style.fontSize = "14px";
    seeMoreButton.style.fontWeight = "600";
    seeMoreButton.style.transition = "background-color 0.3s";
    seeMoreButton.textContent = "See More";
    seeMoreButton.id = `seeMoreBtn-${complaint.id}`;
    seeMoreButton.onmouseover = () => {
      seeMoreButton.style.backgroundColor = "#f0ca55";
    };
    seeMoreButton.onmouseout = () => {
      seeMoreButton.style.backgroundColor = "#eab308";
    };
    popupInner.appendChild(seeMoreButton);
  
    // Append the popup inner content to the popup container
    popupContent.appendChild(popupInner);
  
    return popupContent;
  };
  
  // Helper function to get marker color based on status
  export const getMarkerColor = (status) => {
    switch (status) {
      case "New":
        return "#10B981"; // green
      case "In Progress":
        return "#FBBF24"; // yellow
      case "Resolved":
        return "#6B7280"; // gray
      case "Overdue":
        return "#EF4444"; // red
      default:
        return "#3B82F6"; // blue
    }
  };