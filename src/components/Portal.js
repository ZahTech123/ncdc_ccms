// Portal.js
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const Portal = ({ children }) => {
  const [portalNode, setPortalNode] = useState(null);

  useEffect(() => {
    const node = document.createElement("div");
    document.body.appendChild(node);
    setPortalNode(node);

    return () => {
      document.body.removeChild(node);
    };
  }, []);

  if (!portalNode) return null;

  return createPortal(children, portalNode);
};

export default Portal; // Ensure this is a default export
