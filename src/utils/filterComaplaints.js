// src/utils/filterComplaints.js

export const filterComplaints = (complaints, selectedCity, category, date, locationKeyword) => {
  return complaints.filter(complaint => {
    const matchesCity = selectedCity ? (complaint.city || '').toLowerCase() === selectedCity.toLowerCase() : true;
    const matchesCategory = category ? (complaint.issueType || '').toLowerCase() === category.toLowerCase() : true;
    const matchesDate = date ? (complaint.dateSubmitted || '') === date : true;
    const matchesKeyword = locationKeyword 
      ? (complaint.location?.address || '').toLowerCase().includes(locationKeyword.toLowerCase())
      : true;

    return matchesCity && matchesCategory && matchesDate && matchesKeyword;
  });
};