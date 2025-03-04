import {
  FaTrash,
  FaExclamationTriangle,
  FaShoppingCart,
  FaTree,
  FaBus,
  FaGlassCheers,
  FaBuilding,
  FaProjectDiagram,
  FaGavel,
  FaRoad,
  FaMapMarkedAlt,
  FaTrafficLight,
  FaHardHat,
} from "react-icons/fa";
import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
import { createRoot } from "react-dom/client";

// Export the function as a named export
export const CreatePopupContent = (complaint) => {
  const popupContent = document.createElement("div");
  popupContent.className = "custom-popup";

  // Create and style the icon container
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
    "Urban Safety": <FaExclamationTriangle size={16} color="black" />,
    "Waste Management": <FaTrash size={16} color="black" />,
    "Markets": <FaShoppingCart size={16} color="black" />,
    "Parks & Gardens": <FaTree size={16} color="black" />,
    "Eda City Bus": <FaBus size={16} color="black" />,
    "Liquor License": <FaGlassCheers size={16} color="black" />,
    "Building": <FaBuilding size={16} color="black" />,
    "Development Control & Physical Planning": <FaProjectDiagram size={16} color="black" />,
    "Enforcement": <FaGavel size={16} color="black" />,
    "Streetlights & Traffic Management": <FaTrafficLight size={16} color="black" />,
    "Road Furniture & Road Signs": <FaRoad size={16} color="black" />,
    "Potholes & Drainage": <FaHardHat size={16} color="black" />,
    "Strategic Planning": <FaMapMarkedAlt size={16} color="black" />,
  }[complaint.issueType] || (
    <HiOutlineQuestionMarkCircle size={16} color="white" />
  );

  // Render the icon into the container
  const root = createRoot(iconContainer);
  root.render(icon);

  // Create the rest of the popup content
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

  // Add issue type, ticket ID, status, location, description, and "See More" button
  const issueTypeSection = document.createElement("div");
  issueTypeSection.style.display = "flex";
  issueTypeSection.style.alignItems = "center";
  issueTypeSection.style.gap = "8px";
  issueTypeSection.style.marginBottom = "6px";
  issueTypeSection.appendChild(iconContainer);

  const issueTypeText = document.createElement("h3");
  issueTypeText.style.fontSize = "18px";
  issueTypeText.style.fontWeight = "600";
  issueTypeText.style.color = "black";
  issueTypeText.textContent = complaint.issueType;
  issueTypeSection.appendChild(issueTypeText);
  popupInner.appendChild(issueTypeSection);

  // Add ticket ID and status
  const ticketIdSection = document.createElement("div");
  ticketIdSection.style.display = "flex";
  ticketIdSection.style.justifyContent = "space-between";
  ticketIdSection.style.alignItems = "center";
  ticketIdSection.style.width = "100%";
  ticketIdSection.style.marginBottom = "6px";

  const ticketIdText = document.createElement("p");
  ticketIdText.style.fontWeight = "bold";
  ticketIdText.style.color = "black";
  ticketIdText.textContent = `Ticket ID: #${complaint.id}`;
  ticketIdSection.appendChild(ticketIdText);

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
  popupInner.appendChild(ticketIdSection);

  // Add a divider
  const divider = document.createElement("hr");
  divider.style.border = "none";
  divider.style.height = "1px";
  divider.style.backgroundColor = "#e5e7eb";
  divider.style.margin = "12px 0";
  divider.style.width = "100%";
  popupInner.appendChild(divider);

  // Add location
  const locationText = document.createElement("p");
  locationText.style.color = "gray";
  locationText.style.fontSize = "14px";
  locationText.style.marginBottom = "12px";
  locationText.textContent = `Location: ${complaint.suburb || "N/A"}`;
  popupInner.appendChild(locationText);

  // Add description
  const descriptionText = document.createElement("div");
  descriptionText.style.color = "#4b5563";
  descriptionText.style.fontSize = "14px";
  descriptionText.style.marginBottom = "16px";
  descriptionText.style.whiteSpace = "nowrap"; // Prevent text wrapping
  descriptionText.style.overflow = "hidden"; // Hide overflow
  descriptionText.style.textOverflow = "ellipsis"; // Add ellipsis for overflow

  if (complaint.description) {
    // Split the description into individual comments
    const comments = complaint.description.split('\n').map(comment => comment.trim());

    // Get the latest comment (last entry in the array)
    const latestComment = comments[comments.length - 1];

    // Split the latest comment into parts using the pipe (|) delimiter
    const parts = latestComment.split('|').map(part => part.trim());

    // Extract the current handler (first part)
    const currentHandler = parts[0];

    // Extract the comment (fourth part)
    const comment = parts[3];

    // Combine the current handler and comment with a dash
    const formattedDescription = `${currentHandler} - ${comment}`;

    // Truncate the description if it exceeds 100 characters
    let truncatedDescription = formattedDescription;
    if (truncatedDescription.length > 100) {
      truncatedDescription = truncatedDescription.substring(0, 97) + '...';
    }

    descriptionText.textContent = truncatedDescription;
  } else {
    descriptionText.textContent = "No description provided.";
  }

  popupInner.appendChild(descriptionText);

  // Add "See More" button
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