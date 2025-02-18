import React, { useState,} from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAllowed, ] = useState(true); // Allow all users for now
  const [loading, setLoading] = useState(false); // Prevent multiple clicks
  const navigate = useNavigate();

  // 🔹 Removed Firestore access check logic

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    if (!isAllowed) {
      setError("Access Denied: Please contact the admin for access.");
      console.log("Access Denied for user:", email);
      setLoading(false);
      return;
    }
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login successful for user:", userCredential.user);
      navigate("/dashboard");
    } catch (error) {
      let errorMessage = "Something went wrong. Please try again.";
  
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "Oops! We couldn't find an account with that email. Please check and try again.";
          break;
        case "auth/wrong-password":
          errorMessage = "The password you entered is incorrect. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "The email address is not valid. Please enter a valid email.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many login attempts. Please try again later.";
          break;
        default:
          errorMessage = "An unexpected error occurred. Please try again.";
      }
  
      setError(errorMessage);
      console.error("Login error:", error);
    }
  
    setLoading(false);
  };
  
  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="flex w-4/5 max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Left Section */}
        <div className="w-1/2 bg-gray-900 text-white p-10 text-center flex flex-col items-center">
          <img
            src="https://i.ibb.co/h1srC1CQ/NCDC-Logo.png"
            alt="NCDC-Logo"
            className="w-32 mb-5 rounded-full"
          />
          <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-sm mb-6">To stay connected with us, please login with your credentials</p>
        </div>

        {/* Right Section */}
        <div className="w-1/2 bg-white text-gray-900 p-10">
          <h2 className="text-2xl font-bold text-center mb-6">Log in</h2>
          <form className="flex flex-col items-center" onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-4/5 p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-4/5 p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400"
            />
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              type="submit"
              disabled={!isAllowed || loading}
              className={`w-4/5 p-3 font-bold rounded-full transition ${!isAllowed ? "bg-gray-400 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-yellow-400"}`}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;



// import React, { useState, useEffect } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { auth } from "../../firebaseConfig";
// import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"; // Firestore imports
// import { useNavigate } from "react-router-dom";
// import CheckAdminStatus from "./CheckAdminStatus"; // 🔹 Import CheckAdminStatus

// const db = getFirestore(); // Firestore instance

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [isAllowed, setIsAllowed] = useState(false); // Controls button state
//   const [loading, setLoading] = useState(false); // Prevent multiple clicks
//   const navigate = useNavigate();

//   // 🔹 Check user access in Firestore when email is entered
//   useEffect(() => {
//     if (!email) return;

//     const checkAccess = async () => {
//       console.log("Checking access for email:", email); // Log the email being checked

//       const accessRef = collection(db, "userAccessControl");
//       const q = query(accessRef, where("user_Id", "==", email));
//       const querySnapshot = await getDocs(q);

//       if (!querySnapshot.empty) {
//         setIsAllowed(true);  // User has access
//         console.log("User found in access control:", email); // Log user found
//       } else {
//         setIsAllowed(false);  // User doesn't have access
//         console.log("User not found in access control:", email); // Log user not found
//       }
//     };

//     checkAccess();
//   }, [email]);

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     if (!isAllowed) {
//       setError("Access Denied: Contact Admin.");
//       console.log("Access Denied for user:", email); // Log access denied
//       setLoading(false);
//       return;
//     }

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       console.log("Login successful for user:", userCredential.user); // Log successful login
//       navigate("/dashboard"); // Redirect to dashboard
//     } catch (error) {
//       setError(error.message);
//       console.error("Login error:", error); // Log login error
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="flex justify-center items-center h-screen bg-white">
//       <div className="flex w-4/5 max-w-3xl bg-white rounded-lg shadow-lg overflow-hidden">
//         {/* Left Section */}
//         <div className="w-1/2 bg-gray-900 text-white p-10 text-center flex flex-col items-center">
//           <img
//             src="https://i.ibb.co/h1srC1CQ/NCDC-Logo.png"
//             alt="NCDC-Logo"
//             className="w-32 mb-5 rounded-full"
//           />
//           <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
//           <p className="text-sm mb-6">To stay connected with us, please login with your credentials</p>
//         </div>

//         {/* Right Section */}
//         <div className="w-1/2 bg-white text-gray-900 p-10">
//           <h2 className="text-2xl font-bold text-center mb-6">Log in</h2>
//           <CheckAdminStatus /> {/* 🔹 Display admin status */}
//           <form className="flex flex-col items-center" onSubmit={handleLogin}>
//             <input
//               type="email"
//               placeholder="Email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-4/5 p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400"
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className="w-4/5 p-3 mb-4 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-400"
//             />
//             {error && <p className="text-red-500 mb-4">{error}</p>}
//             <button
//               type="submit"
//               disabled={!isAllowed || loading}
//               className={`w-4/5 p-3 font-bold rounded-full transition ${
//                 !isAllowed
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-gray-900 text-white hover:bg-yellow-400"
//               }`}
//             >
//               {loading ? "Logging in..." : "Log in"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
