// import { app, database } from './firebaseConfig'; // Import `app` and `database` from firebaseConfig.js
// import firebase from 'firebase/app'; // Import firebase for Firebase v8
// import 'firebase/database'; // Import Realtime Database module

// // Function to mark a notification as read for a specific role
// function markNotificationAsRead(ticketId, role) {
//   const ticketRef = database.ref(`tickets/${ticketId}`);
  
//   // Update only the specific role's read status
//   const updates = {
//     [`isRead/${role}`]: true
//   };
  
//   return ticketRef.update(updates);
// }

// // Function to get unread notifications for a specific role
// function getUnreadNotifications(role) {
//   const ticketsRef = database.ref('tickets');
  
//   return ticketsRef.once('value').then(snapshot => {
//     const notifications = [];
//     snapshot.forEach(childSnapshot => {
//       const ticket = childSnapshot.val();
//       // Check if the notification is unread for the specific role
//       if (!ticket.isRead || !ticket.isRead[role]) {
//         notifications.push(ticket);
//       }
//     });
//     return notifications;
//   });
// }

// export { markNotificationAsRead, getUnreadNotifications }; // Export both functions