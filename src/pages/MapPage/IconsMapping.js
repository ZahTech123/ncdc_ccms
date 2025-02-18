// src/utils/IconsMapping.js
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
    FaLightbulb,
  } from "react-icons/fa";
  import { HiOutlineQuestionMarkCircle } from "react-icons/hi2";
  
  export const getIconForIssueType = (issueType) => {
    const iconMapping = {
      "Garbage and Sanitation": <FaTrash size={16} color="black" />,
      "Street Lights": <FaLightbulb size={16} color="black" />,
      "Crime Alert": <FaExclamationTriangle size={16} color="black" />,
      "Traffic Lights": <FaTrafficLight size={16} color="black" />,
      "Pothole Roads": <FaHardHat size={16} color="black" />,
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
    };
  
    return iconMapping[issueType] || <HiOutlineQuestionMarkCircle size={16} color="white" />;
  };