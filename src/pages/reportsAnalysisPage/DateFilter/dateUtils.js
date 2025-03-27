export const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Format date for display
export const formatDate = (date) => {
  if (!date) return "";
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Format date for input value (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};