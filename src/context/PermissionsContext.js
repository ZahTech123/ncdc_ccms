import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
// Create the context
export const PermissionsContext = createContext();

// Create the provider component
export const PermissionsProvider = ({ children }) => {
  // Initialize state from localStorage
  const [userPermissions, setUserPermissions] = useState({
    role: localStorage.getItem("userRole") || null,
    name: localStorage.getItem("userName") || null, // Add name field
    buttons: [],
    dropdowns: [],
    canView: [],
    canEdit: [],
    canDelete: [],
    canExpandCollapse: false,
    canEditTicket: false,
  });

  // Log the role and name when they change
  useEffect(() => {
    console.log("Role updated:", userPermissions.role);
    console.log("Name updated:", userPermissions.name);
  }, [userPermissions.role, userPermissions.name]);

  // Update localStorage whenever the role or name changes
  useEffect(() => {
    if (userPermissions.role) {
      localStorage.setItem("userRole", userPermissions.role);
    } else {
      localStorage.removeItem("userRole");
    }

    if (userPermissions.name) {
      localStorage.setItem("userName", userPermissions.name);
    } else {
      localStorage.removeItem("userName");
    }
  }, [userPermissions.role, userPermissions.name]);

  // Function to update permissions based on role and name
  const updatePermissions = (role, permissions, name) => {
    const rolePermissions = UI_PERMISSIONS[role] || {};
    setUserPermissions({
      role,
      name, // Add name to the state
      buttons: rolePermissions.buttons || [],
      dropdowns: rolePermissions.dropdowns || [],
      canView: rolePermissions.canView || [],
      canEdit: rolePermissions.canEdit || [],
      canDelete: rolePermissions.canDelete || [],
      canExpandCollapse: rolePermissions.canExpandCollapse || false,
      canEditTicket: rolePermissions.canEditTicket || false,
    });
  };

  return (
    <PermissionsContext.Provider value={{ userPermissions, updatePermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Custom hook to access permissions
export const usePermissions = () => useContext(PermissionsContext);

// Define UI permissions for each role
export const UI_PERMISSIONS = {
  admin: {
    canView: ["dashboard", "reports", "users", "settings"],
    canEdit: ["settings", "users", "tickets"],
    canDelete: ["users", "tickets"],
    dropdowns: ["adminSettings", "userManagement", "ticketManagement"],
    buttons: ["addUser", "deleteUser", "editSettings", "resolveTicket"],
    canExpandCollapse: true, // Admin can expand/collapse the table
    canEditTicket: true, // Admin can edit tickets
  },
  operator: {
    canView: ["dashboard", "tickets"],
    canEdit: ["tickets"],
    canDelete: [],
    dropdowns: ["ticketManagement"],
    buttons: ["resolveTicket"],
    canExpandCollapse: true, // Operator can expand/collapse the table
    canEditTicket: true, // Operator can edit tickets
  },
  supervisorC: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: true, // Cannot edit tickets
  },
  bU_adminC: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: true, // Cannot edit tickets
  },
  bU_SL_admin: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_CPI_admin: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_C_sup: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_SL_sup: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_CPI_sup: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_C_mang: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_SL_mang: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_CPI_mang: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_C_drtor: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_SL_drtor: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  bU_CPI_drtor: {
    canView: ["dashboard", "reports", "tickets"],
    canEdit: [],
    canDelete: [],
    dropdowns: [],
    buttons: [],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
  city_manager: {
    canView: ["dashboard", "reports", "tickets", "settings"],
    canEdit: ["tickets", "settings"],
    canDelete: [],
    dropdowns: ["ticketManagement", "settings"],
    buttons: ["resolveTicket", "editSettings"],
    canExpandCollapse: false, // Cannot expand/collapse the table
    canEditTicket: false, // Cannot edit tickets
  },
};

export default PermissionsProvider;