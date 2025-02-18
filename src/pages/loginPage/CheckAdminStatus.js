import { useEffect, useState } from "react";
import { db } from "./firebase"; // Ensure your Firebase config is imported
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const CheckAdminStatus = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const auth = getAuth();

  useEffect(() => {
    const checkAdmin = async () => {
      if (auth.currentUser) {
        const userEmail = auth.currentUser.email;
        const adminRef = doc(db, "userAccessControl", "admin");

        try {
          const adminSnap = await getDoc(adminRef);
          if (adminSnap.exists() && adminSnap.data().user_ID === userEmail) {
            setIsAdmin(true);
            console.log("Yes, John is an admin.");
          } else {
            console.log("No, John is not an admin.");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      }
    };

    checkAdmin();
  }, [auth]);

  return <div>{isAdmin ? "Yes, John is an admin." : "No, John is not an admin."}</div>;
};

export default CheckAdminStatus;
