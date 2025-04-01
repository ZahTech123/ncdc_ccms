import emailjs from 'emailjs-com';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from "../../firebaseConfig";

// ======================
// CONFIGURATION
// ======================
const CONFIG = {
  EMAILJS: {
    PUBLIC_KEY: "4aWPJtcDKE1eCcfDk",
    SERVICE_ID: "service_0lequ6f",
    TEMPLATE_ID: "template_e75hmf5",
    // TO_EMAIL: "heni.sarwom@qrfpng.com"
    TO_EMAIL: "sarwomjohn@gmail.com"
  },
  DIRECTORATES: {
    COMPLIANCE: "Compliance",
    SUSTAINABILITY: "Sustainability & Lifestyle",
    PLANNING: "City Planning & Infrastructure"
  },
  ESCALATION_DELAY_MS: 30000 // 30 seconds (changed from 120000)
};

// ======================
// BUSINESS UNIT ROLES
// ======================
const ROLES = {
  COMPLIANCE: {
    ADMIN: "bU_adminC",
    SUPERVISOR: "bU_supervisorC",
    MANAGER: "bU_managerC",
    DIRECTOR: "bU_directorC",
    DISPLAY_NAMES: {
      "bU_adminC": "Admin Compliance",
      "bU_supervisorC": "Supervisor Compliance",
      "bU_managerC": "Manager Compliance",
      "bU_directorC": "Director Compliance"
    }
  },
  SUSTAINABILITY: {
    ADMIN: "bU_adminS_L",
    SUPERVISOR: "bU_supervisorS_L",
    MANAGER: "bU_managerS_L",
    DIRECTOR: "bU_directorS_L",
    DISPLAY_NAMES: {
      "bU_adminS_L": "Admin S&L",
      "bU_supervisorS_L": "Supervisor S&L",
      "bU_managerS_L": "Manager S&L",
      "bU_directorS_L": "Director S&L"
    }
  },
  PLANNING: {
    ADMIN: "bU_adminCPI",
    SUPERVISOR: "bU_supervisorCPI",
    MANAGER: "bU_managerCPI",
    DIRECTOR: "bU_directorCPI",
    DISPLAY_NAMES: {
      "bU_adminCPI": "Admin CPI",
      "bU_supervisorCPI": "Supervisor CPI",
      "bU_managerCPI": "Manager CPI",
      "bU_directorCPI": "Director CPI"
    }
  },
  CITY_MANAGER: {
    ROLE: "city_manager",
    DISPLAY: "City Manager"
  },
  BASE_ROLES: {
    OPERATOR: "operator",
    SUPERVISOR: "supervisor",
    ADMIN: "admin"
  }
};

// Initialize EmailJS
emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);

// ======================
// CORE LOGIC
// ======================
const getEscalationPath = (directorate, currentRole) => {
  console.log(`[Escalation Path] Determining next role for ${currentRole} in ${directorate}`);
  
  // Handle base roles first
  if (currentRole === ROLES.CITY_MANAGER.ROLE) {
    return {
      nextRole: ROLES.CITY_MANAGER.ROLE, // Returns itself to indicate end of chain
      nextDisplay: ROLES.CITY_MANAGER.DISPLAY
    };
  }
  
  if (currentRole === ROLES.BASE_ROLES.SUPERVISOR) {
    if (directorate === CONFIG.DIRECTORATES.COMPLIANCE) {
      return {
        nextRole: ROLES.COMPLIANCE.ADMIN,
        nextDisplay: ROLES.COMPLIANCE.DISPLAY_NAMES[ROLES.COMPLIANCE.ADMIN]
      };
    } else if (directorate === CONFIG.DIRECTORATES.SUSTAINABILITY) {
      return {
        nextRole: ROLES.SUSTAINABILITY.ADMIN,
        nextDisplay: ROLES.SUSTAINABILITY.DISPLAY_NAMES[ROLES.SUSTAINABILITY.ADMIN]
      };
    } else {
      return {
        nextRole: ROLES.PLANNING.ADMIN,
        nextDisplay: ROLES.PLANNING.DISPLAY_NAMES[ROLES.PLANNING.ADMIN]
      };
    }
  }

  // Find the role key if currentRole is a display name
  let roleKey = currentRole;
  if (currentRole.includes(" ")) { // If it's a display name
    for (const category in ROLES) {
      if (ROLES[category].DISPLAY_NAMES) {
        for (const [key, value] of Object.entries(ROLES[category].DISPLAY_NAMES)) {
          if (value === currentRole) {
            roleKey = key;
            break;
          }
        }
      }
    }
  }

  // Handle business unit roles
  const directorateMap = {
    [CONFIG.DIRECTORATES.COMPLIANCE]: {
      roles: {
        [ROLES.COMPLIANCE.ADMIN]: {
          nextRole: ROLES.COMPLIANCE.SUPERVISOR,
          nextDisplay: ROLES.COMPLIANCE.DISPLAY_NAMES[ROLES.COMPLIANCE.SUPERVISOR]
        },
        [ROLES.COMPLIANCE.SUPERVISOR]: {
          nextRole: ROLES.COMPLIANCE.MANAGER,
          nextDisplay: ROLES.COMPLIANCE.DISPLAY_NAMES[ROLES.COMPLIANCE.MANAGER]
        },
        [ROLES.COMPLIANCE.MANAGER]: {
          nextRole: ROLES.COMPLIANCE.DIRECTOR,
          nextDisplay: ROLES.COMPLIANCE.DISPLAY_NAMES[ROLES.COMPLIANCE.DIRECTOR]
        },
        [ROLES.COMPLIANCE.DIRECTOR]: {
          nextRole: ROLES.CITY_MANAGER.ROLE,
          nextDisplay: ROLES.CITY_MANAGER.DISPLAY
        }
      },
      displayNameMap: ROLES.COMPLIANCE.DISPLAY_NAMES
    },
    [CONFIG.DIRECTORATES.SUSTAINABILITY]: {
      roles: {
        [ROLES.SUSTAINABILITY.ADMIN]: {
          nextRole: ROLES.SUSTAINABILITY.SUPERVISOR,
          nextDisplay: ROLES.SUSTAINABILITY.DISPLAY_NAMES[ROLES.SUSTAINABILITY.SUPERVISOR]
        },
        [ROLES.SUSTAINABILITY.SUPERVISOR]: {
          nextRole: ROLES.SUSTAINABILITY.MANAGER,
          nextDisplay: ROLES.SUSTAINABILITY.DISPLAY_NAMES[ROLES.SUSTAINABILITY.MANAGER]
        },
        [ROLES.SUSTAINABILITY.MANAGER]: {
          nextRole: ROLES.SUSTAINABILITY.DIRECTOR,
          nextDisplay: ROLES.SUSTAINABILITY.DISPLAY_NAMES[ROLES.SUSTAINABILITY.DIRECTOR]
        },
        [ROLES.SUSTAINABILITY.DIRECTOR]: {
          nextRole: ROLES.CITY_MANAGER.ROLE,
          nextDisplay: ROLES.CITY_MANAGER.DISPLAY
        }
      },
      displayNameMap: ROLES.SUSTAINABILITY.DISPLAY_NAMES
    },
    [CONFIG.DIRECTORATES.PLANNING]: {
      roles: {
        [ROLES.PLANNING.ADMIN]: {
          nextRole: ROLES.PLANNING.SUPERVISOR,
          nextDisplay: ROLES.PLANNING.DISPLAY_NAMES[ROLES.PLANNING.SUPERVISOR]
        },
        [ROLES.PLANNING.SUPERVISOR]: {
          nextRole: ROLES.PLANNING.MANAGER,
          nextDisplay: ROLES.PLANNING.DISPLAY_NAMES[ROLES.PLANNING.MANAGER]
        },
        [ROLES.PLANNING.MANAGER]: {
          nextRole: ROLES.PLANNING.DIRECTOR,
          nextDisplay: ROLES.PLANNING.DISPLAY_NAMES[ROLES.PLANNING.DIRECTOR]
        },
        [ROLES.PLANNING.DIRECTOR]: {
          nextRole: ROLES.CITY_MANAGER.ROLE,
          nextDisplay: ROLES.CITY_MANAGER.DISPLAY
        }
      },
      displayNameMap: ROLES.PLANNING.DISPLAY_NAMES
    }
  };

  // Get the directorate config
  const dirConfig = directorateMap[directorate];
  
  if (!dirConfig) {
    console.error(`[Escalation Path] Unknown directorate: ${directorate}`);
    return { nextRole: currentRole, nextDisplay: currentRole };
  }

  // Check if we're dealing with a display name
  if (currentRole.includes(" ")) {
    // Find the role key for the display name
    for (const [key, displayName] of Object.entries(dirConfig.displayNameMap)) {
      if (displayName === currentRole) {
        roleKey = key;
        break;
      }
    }
  }

  // Get the next role based on the role key
  const nextRoleInfo = dirConfig.roles[roleKey];
  
  if (!nextRoleInfo) {
    console.error(`[Escalation Path] Could not determine next role for ${currentRole} in ${directorate}`);
    return { nextRole: currentRole, nextDisplay: currentRole };
  }

  console.log(`[Escalation Path] Current: ${currentRole} (${roleKey}) → Next: ${nextRoleInfo.nextDisplay} (${nextRoleInfo.nextRole})`);
  return nextRoleInfo;
};

const updateFirestoreTicket = async (ticketId, updates, previousHandler, nextHandler) => {
  console.log(`[Firestore] Preparing to update complaints/${ticketId}`);
  
  try {
    const timestamp = new Date().toLocaleString();
    const escalationComment = `\nEscalated Ticket - From ${previousHandler} to ${nextHandler} | ${timestamp} | System Auto-Escalation |`;
    
    const fullUpdates = {
      ...updates,
      description: updates.description ? 
        `${updates.description}${escalationComment}` : 
        escalationComment,
      _lastUpdated: new Date().toISOString()
    };

    await updateDoc(doc(db, "complaints", ticketId), fullUpdates);
    console.log(`[Firestore] Successfully updated complaints/${ticketId}`);
    return true;
  } catch (error) {
    console.error(`[Firestore] Update failed for complaints/${ticketId}:`, error);
    return false;
  }
};

const sendEscalationEmail = async (ticket, nextHandler, nextRole) => {
  console.log(`[Email] Preparing escalation email for ${ticket.ticketId}`);
  
  const emailParams = {
    to_email: CONFIG.EMAILJS.TO_EMAIL,
    ticket_id: ticket.ticketId || "N/A",
    directorate: ticket.team || ticket.directorate,
    assigned_to: nextHandler,
    assigned_role: nextRole,
    previous_handler: ticket.currentHandler,
    issue_type: ticket.issueType || "N/A",
    status: ticket.status || "N/A",
    priority: ticket.priority || "N/A",
    description: ticket.description || "N/A",
    contact_information: "NCDC CCMS Response Team | contact@ncdc.gov.pg"
  };

  try {
    await emailjs.send(
      CONFIG.EMAILJS.SERVICE_ID,
      CONFIG.EMAILJS.TEMPLATE_ID,
      emailParams
    );
    console.log(`[Email] Successfully sent escalation email for ${ticket.ticketId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send escalation email for ${ticket.ticketId}:`, error);
    return false;
  }
};

// Function to schedule the next escalation for a ticket
const scheduleNextEscalation = (ticket, currentRole, delay = CONFIG.ESCALATION_DELAY_MS) => {
  console.log(`[Schedule] Planning next escalation for ticket ${ticket.id || ticket.ticketId} in ${delay/1000} seconds`);
  
  // Create a copy of the active timeouts array if it doesn't exist
  if (!window.activeEscalationTimeouts) {
    window.activeEscalationTimeouts = [];
  }
  
  const { nextRole, nextDisplay } = getEscalationPath(ticket.team, currentRole);
  
  // If we've reached the final role, no need to schedule another escalation
// Check if we're already at the final role
if (nextRole === currentRole || currentRole === ROLES.CITY_MANAGER.ROLE) {
  console.log(`[Schedule] Ticket ${ticket.id || ticket.ticketId} has reached ${ticket.currentHandler} - escalation chain completed`);
  return null;
}
  
  // Prepare updates for the next escalation
  const updates = {
    currentHandler: nextDisplay,
    previousHandler: ticket.currentHandler,
    previousHandlers: [...(ticket.previousHandlers || []), ticket.currentHandler],
    lastEscalated: new Date().toISOString(),
    escalationCount: (ticket.escalationCount || 0) + 1,
    isNew: {
      ...ticket.isNew,
      [currentRole]: false,
      [nextRole]: true
    }
  };
  
  // Set timeout for the next escalation
  const timeoutId = setTimeout(async () => {
    console.log(`[Escalation] Executing escalation for ticket ${ticket.id || ticket.ticketId} to ${nextDisplay}`);
    
    const results = await Promise.allSettled([
      sendEscalationEmail(ticket, nextDisplay, nextRole),
      updateFirestoreTicket(ticket.id, updates, ticket.currentHandler, nextDisplay)
    ]);
    
    console.log(`[Escalation] Completed escalation for ${ticket.id || ticket.ticketId}`, {
      email: results[0].status,
      firestore: results[1].status
    });
    
    // If escalation was successful, schedule the next one
    if (results[1].status === 'fulfilled' && results[1].value) {
      const updatedTicket = {
        ...ticket,
        ...updates,
        currentHandler: nextDisplay,
        isNew: {
          ...ticket.isNew,
          [currentRole]: false,
          [nextRole]: true
        }
      };
      
      // Schedule the next escalation in the chain
      scheduleNextEscalation(updatedTicket, nextRole);
    }
  }, delay);
  
  // Store the timeout ID for cleanup
  window.activeEscalationTimeouts.push(timeoutId);
  
  return timeoutId;
};

// ======================
// MAIN EXPORT
// ======================
export const monitorTicketEscalations = async (tickets) => {
  console.log('[Monitor] Starting ticket escalation monitoring');
  
  if (!Array.isArray(tickets)) {
    console.error("[Monitor] Expected array of tickets, received:", typeof tickets);
    return;
  }

  console.log(`[Monitor] Processing ${tickets.length} ticket(s)`);
  
  // Initialize the global active timeouts array if it doesn't exist
  if (!window.activeEscalationTimeouts) {
    window.activeEscalationTimeouts = [];
  }

  tickets.forEach(ticket => {
    console.log(`[Monitor] Processing ticket ${ticket.ticketId || ticket.id || 'unknown'}`);
    
    // Validate ticket structure
    if (!ticket?.id || !ticket?.team || !ticket?.currentHandler || !ticket?.status) {
      console.warn("[Monitor] Skipping invalid ticket:", ticket?.ticketId);
      return;
    }

    // Check escalation conditions
    if (ticket.status !== "In Progress") {
      console.log(`[Monitor] Ticket ${ticket.ticketId} status is "${ticket.status}" - no escalation needed`);
      return;
    }

    // Find current active role
    const currentRole = Object.entries(ticket.isNew || {}).find(
      ([key, value]) => value === true && (key.startsWith("bU_") || ["operator", "supervisor", "admin"].includes(key))
    )?.[0];

    if (!currentRole) {
      console.warn(`[Monitor] No active role found for ticket ${ticket.ticketId}`);
      return;
    }

    console.log(`[Monitor] Current role for ticket ${ticket.ticketId}: ${currentRole}`);
    
    // Schedule the first escalation in the chain
    scheduleNextEscalation(ticket, currentRole);
  });

  console.log(`[Monitor] Monitoring complete. ${window.activeEscalationTimeouts.length} escalation(s) scheduled.`);
  
  // Return a cleanup function that clears all active timeouts
  return () => {
    console.log(`[Cleanup] Clearing ${window.activeEscalationTimeouts.length} active timeouts`);
    window.activeEscalationTimeouts.forEach(clearTimeout);
    window.activeEscalationTimeouts = [];
  };
};