// dataFilters.js

// Filter tickets based on status, issueType, keyword search, and role
export const filterTickets = (tickets, statusFilter, issueTypeFilter, keywordSearch, role) => {
    if (!role) {
        console.error("Role is null or undefined");
        return []; // Return an empty array if role is not provided
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
        "bU_directorCPI": "City Planning & Infrastructure"
    };

    return tickets.filter((ticket) => {
        let matchesDirectorate = true;

        if (role.startsWith("bU_")) {
            const directorate = directorateMap[role];
            if (directorate) {
                matchesDirectorate = ticket.directorate === directorate;
                
                // Apply additional filtering for Compliance roles
                if (["bU_supervisorC", "bU_managerC", "bU_directorC"].includes(role)) {
                    const roleHandlerMap = {
                        "bU_supervisorC": "Compliance Supervisor",
                        "bU_managerC": "Compliance Manager",
                        "bU_directorC": "Compliance Director"
                    };
                    matchesDirectorate = matchesDirectorate && ticket.currentHandler === roleHandlerMap[role];
                } else {
                    matchesDirectorate = matchesDirectorate && ["Verified", "In Progress", "Closed"].includes(ticket.status);
                }
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
    if (!role.startsWith("bU_")) return tickets;

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

    return tickets.filter(ticket => 
        directorate
            ? ticket.directorate === directorate && ["Verified", "In Progress", "Closed"].includes(ticket.status)
            : true
    );
};

