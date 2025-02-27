// dataFilters.js

// Filter tickets based on status, issueType, keyword search, and role
export const filterTickets = (tickets, statusFilter, issueTypeFilter, keywordSearch, role) => {
    if (!role) {
        console.error("Role is null or undefined");
        return []; // or handle the error appropriately
    }

    return tickets.filter((ticket) => {
        let matchesDirectorate = true;

        // Special condition for bU_supervisorC
        if (role === "bU_supervisorC") {
            matchesDirectorate =
                ticket.directorate === "Compliance" &&
                ticket.currentHandler === "Compliance Supervisor";
        } else if (role.startsWith("bU_")) {
            const directorateMap = {
                "bU_adminC": "Compliance",
                "bU_supervisorC": "Compliance",
                "bU_managerC": "Compliance",
                "bU_directorC": "Compliance",
                "bU_adminS_L": "Sustainability & Lifestyle",
                "bU_supervisorS_L": "Sustainability & Lifestyle",
                "bU_managerS_L": "Sustainability & Lifestyle",
                "bU_directorS_L": "Sustainability & Lifestyle",
                "bU_adminCPI": "City Planning & Infrastructure",
                "bU_supervisorCPI": "City Planning & Infrastructure",
                "bU_managerCPI": "City Planning & Infrastructure",
                "bU_directorCPI": "City Planning & Infrastructure"
            };

            const directorate = directorateMap[role];
            if (directorate) {
                matchesDirectorate = ticket.directorate === directorate && ["Verified", "In Progress", "Closed"].includes(ticket.status);
            }
        }

        const matchesStatus = statusFilter ? ticket.status === statusFilter : true;
        const matchesIssueType = issueTypeFilter ? ticket.issueType === issueTypeFilter : true;
        const matchesKeyword = keywordSearch
            ? Object.values(ticket).some((value) =>
                String(value).toLowerCase().includes(keywordSearch.toLowerCase())
            )
            : true;

        return matchesDirectorate && matchesStatus && matchesIssueType && matchesKeyword;
    });
};
// Filter unread tickets based on role
export const filterUnreadTickets = (tickets, role) => {
    return tickets.filter(ticket => {
        // Define a mapping of roles to their corresponding directorates
        const directorateMap = {
            "bU_adminC": "Compliance",
            "bU_supervisorC": "Compliance",
            "bU_managerC": "Compliance",
            "bU_directorC": "Compliance",
            "bU_adminS_L": "Sustainability & Lifestyle",
            "bU_supervisorS_L": "Sustainability & Lifestyle",
            "bU_managerS_L": "Sustainability & Lifestyle",
            "bU_directorS_L": "Sustainability & Lifestyle",
            "bU_adminCPI": "City Planning & Infrastructure",
            "bU_supervisorCPI": "City Planning & Infrastructure",
            "bU_managerCPI": "City Planning & Infrastructure",
            "bU_directorCPI": "City Planning & Infrastructure"
        };

        // Check if the role exists in the directorateMap
        const directorate = directorateMap[role];
        if (directorate) {
            return (
                ticket.directorate === directorate &&
                ["Verified", "In Progress", "Closed"].includes(ticket.status) &&
                (!ticket.isRead || !ticket.isRead[role]) // Ensure the ticket is unread for the role
            );
        }

        // For other roles, use the default filtering logic (based on isRead)
        return !ticket.isRead || !ticket.isRead[role];
    });
};

export const filterTicketsRoles = (tickets, role) => {
    const filteredTickets = tickets.filter((ticket) => {
        if (!role.startsWith("bU_")) return true;

        // Special condition for bU_supervisorC
        if (role === "bU_supervisorC") {
            return (
                ticket.directorate === "Compliance" &&
                ticket.currentHandler === "Compliance Supervisor"
            );
        }         if (role === "bU_managerC") {
            return (
                ticket.directorate === "Compliance" &&
                ticket.currentHandler === "Compliance Manager"
            );
        }         if (role === "bU_directorC") {
            return (
                ticket.directorate === "Compliance" &&
                ticket.currentHandler === "Compliance Director"
            );
        }          if (role === "bU_supervisorS_L") {
            return (
                ticket.directorate === "Sustainability & Lifestyle" &&
                ticket.currentHandler === "Sustainability & Lifestyle Supervisor"
            );
        }           if (role === "bU_managerS_L") {
            return (
                ticket.directorate === "Sustainability & Lifestyle" &&
                ticket.currentHandler === "Sustainability & Lifestyle Manager"
            );
        }            if (role === "bU_directorS_L") {
            return (
                ticket.directorate === "Sustainability & Lifestyle" &&
                ticket.currentHandler === "Sustainability & Lifestyle Director"
            );
        }             if (role === "bU_supervisorCPI") {
            return (
                ticket.directorate === "City Planning & Infrastructure" &&
                ticket.currentHandler === "City Planning & Infrastructure Supervisor"
            );
        }              if (role === "bU_managerCPI") {
            return (
                ticket.directorate === "City Planning & Infrastructure" &&
                ticket.currentHandler === "City Planning & Infrastructure Manager"
            );
        }              if (role === "bU_directorCPI") {
            return (
                ticket.directorate === "City Planning & Infrastructure" &&
                ticket.currentHandler === "City Planning & Infrastructure Director"
            );
        } 


        const directorateMap = {
            "bU_adminC": "Compliance",
            "bU_supervisorC": "Compliance",
            "bU_managerC": "Compliance",
            "bU_directorC": "Compliance",
            "bU_adminS_L": "Sustainability & Lifestyle",
            "bU_supervisorS_L": "Sustainability & Lifestyle",
            "bU_managerS_L": "Sustainability & Lifestyle",
            "bU_directorS_L": "Sustainability & Lifestyle",
            "bU_adminCPI": "City Planning & Infrastructure",
            "bU_supervisorCPI": "City Planning & Infrastructure",
            "bU_managerCPI": "City Planning & Infrastructure",
            "bU_directorCPI": "City Planning & Infrastructure",
        };

        const directorate = directorateMap[role];
        return directorate
            ? ticket.directorate === directorate && ["Verified", "In Progress", "Closed"].includes(ticket.status)
            : true;
    });

    // Log the role and filtered tickets
    console.log(`Role ${role} filtered tickets:`, filteredTickets);
    return filteredTickets;
};
