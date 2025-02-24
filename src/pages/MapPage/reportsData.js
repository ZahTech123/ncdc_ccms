// Utility functions for processing report data
export const processSection1Data = (tickets, role) => {
  // Filter tickets based on role
  const filteredTickets = tickets.filter(ticket => {
    if (role === "supervisorC" || role === "admin" || role === "operator") {
      return ticket.status === "New" || ticket.status === "Verified";
    }
    return true;
  });

  // Calculate counts for donut chart
  const verifiedCount = filteredTickets.filter(ticket => ticket.status === "Verified").length;
  const newCount = filteredTickets.filter(ticket => ticket.status === "New").length;

  // Prepare data for cards
  const cardData = [
    { 
      icon: 'chart-line', 
      title: "Total Escalations", 
      value: filteredTickets.filter(t => t.priority === "High").length,
      change: "↓ 10%"
    },
    {
      icon: 'exclamation-circle',
      title: "New Escalations",
      value: newCount,
      resolved: verifiedCount
    },
    // ... other card data
  ];

  return {
    donutData: [verifiedCount, newCount],
    cardData,
    totalTickets: filteredTickets.length
  };
};

export const processSection2Data = (tickets) => {
  // Process data for line chart
  const lineData = {
    labels: Array.from({ length: 20 }, (_, i) => `2025-01-${i + 1}`),
    datasets: [
      {
        label: "Resolved",
        data: Array.from({ length: 20 }, () => Math.floor(Math.random() * 100)),
        borderColor: "#10B981",
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Process data for electorate cards
  const electorateData = [
    {
      name: "MORESBY NORTH EAST",
      category: "Garbage",
      count: tickets.filter(t => t.issueType === "Garbage").length,
      percentage: 20,
      total: 25
    },
    // ... other electorate data
  ];

  return {
    lineData,
    electorateData
  };
};

export const processSection3Data = (tickets) => {
  // Process data for bar chart
  const issueTypes = [...new Set(tickets.map(ticket => ticket.issueType))];
  
  const datasets = issueTypes.map((type, index) => {
    const typeTickets = tickets.filter(t => t.issueType === type);
    return {
      label: type,
      data: [
        typeTickets.filter(t => t.status === "New").length,
        typeTickets.filter(t => t.status === "In Progress").length,
        typeTickets.filter(t => t.status === "Resolved").length,
        typeTickets.filter(t => t.status === "Overdue").length
      ],
      backgroundColor: ['#facc15', '#fbbf24', '#f59e0b', '#d97706'][index],
      borderWidth: 1,
      borderRadius: 12,
      borderSkipped: 'bottom'
    };
  });

  // Process report history
  const reports = [
    { date: '24/01/2025' },
    { date: '2/12/2024' },
    // ... other report dates
  ];

  return {
    barData: {
      labels: ["New", "In Progress", "Resolved", "Overdue"],
      datasets
    },
    reports
  };
};

// Helper function to get ticket statistics
export const getTicketStatistics = (tickets) => {
  return {
    totalTickets: tickets.length,
    totalNew: tickets.filter(t => t.status === "New").length,
    totalInProgress: tickets.filter(t => t.status === "In Progress").length,
    totalResolved: tickets.filter(t => t.status === "Resolved").length,
    totalOverdue: tickets.filter(t => t.status === "Overdue").length,
    totalHighPriority: tickets.filter(t => t.priority === "High").length,
    totalMediumPriority: tickets.filter(t => t.priority === "Medium").length,
    totalLowPriority: tickets.filter(t => t.priority === "Low").length
  };
}; 