import React, { useState, useEffect, useMemo } from "react";
import { FaHeadset, FaUser, FaUsers, FaCheck } from "react-icons/fa";
import "../../styles/ticketTracker.css";

const TicketTracker = ({ ticket, onClose }) => {
  // Define the stages of the escalation process
  const stages = useMemo(() => ["Operator", "Supervisor", "Unit Manager", "Response Team"], []);

  // Local state for real-time updates
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // Start from Operator (index 0)
  const [timeElapsed, setTimeElapsed] = useState(0); // Time elapsed for the current handler
  const [isTicketClosed, setIsTicketClosed] = useState(false); // Track if the ticket is closed

  // Move to the next handler after 24 seconds
  useEffect(() => {
    if (isTicketClosed) return; // Stop the timer if the ticket is closed

    const interval = setInterval(() => {
      setTimeElapsed((prevTime) => {
        if (prevTime >= 24) {
          // Move to the next stage if 24 seconds have passed
          if (currentStageIndex < stages.length - 1) {
            setCurrentStageIndex((prevIndex) => prevIndex + 1); // Move to the next handler
            return 0; // Reset the timer for the next handler
          } else {
            // If this is the final stage, close the ticket
            setIsTicketClosed(true);
            clearInterval(interval); // Stop the timer
            return prevTime;
          }
        } else {
          return prevTime + 1; // Increment the timer
        }
      });
    }, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [currentStageIndex, isTicketClosed, stages.length]);

  // Calculate the gradient percentage for the current handler
  const gradientPercentage = (timeElapsed / 24) * 100;

  return (
    <div className="modal">
      <div className="ticket-card">
        <button onClick={onClose} className="close-button" aria-label="Close Ticket">
          &times;
        </button>

        <h2 className="text-center text-white text-2xl font-bold mb-6">
          TICKET NUMBER: {ticket?.id}
        </h2>

        {isTicketClosed && (
          <h3 className="text-center text-red-500 text-xl font-bold mb-6">
            TICKET CLOSED
          </h3>
        )}

        <div className="ticket-tracker-container">
          {/* Connecting Line */}
          <div
            className="connecting-line"
            style={{
              width: `calc(${((currentStageIndex + 1) / stages.length) * 100}% - 120px)`,
            }}
          ></div>

          {/* Stages */}
          {stages.map((stage, index) => (
            <React.Fragment key={stage}>
              {/* Stage Icon */}
              <div
                className={`relative flex flex-col items-center ${
                  index > currentStageIndex ? "opacity-50" : ""
                }`}
              >
                <div
                  className="icon-container"
                  style={{
                    background:
                      index === currentStageIndex
                        ? `conic-gradient(
                            #facc22 ${gradientPercentage}%,
                            transparent ${gradientPercentage}% 100%
                          )`
                        : index < currentStageIndex
                        ? "conic-gradient(#facc22 100%, transparent 100%)"
                        : "conic-gradient(transparent 100%, transparent 100%)",
                  }}
                >
                  <div className="spacer">
                    <div
                      className="inner-circle"
                      style={{
                        backgroundColor: "#1f2937",
                      }}
                    >
                      {stage === "Operator" && (
                        <FaHeadset className="text-white text-4xl" />
                      )}
                      {stage === "Supervisor" && (
                        <FaUser className="text-white text-4xl" />
                      )}
                      {stage === "Unit Manager" && (
                        <FaUser className="text-white text-4xl" />
                      )}
                      {stage === "Response Team" && (
                        <FaUsers className="text-white text-4xl" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Timer or Checkmark */}
                {index < currentStageIndex ? (
                  <div className="checkmark-container">
                    <FaCheck className="text-green-500 text-2xl" />
                  </div>
                ) : index === currentStageIndex ? (
                  <div className="timer-container">
                    <span className="timer-text">{timeElapsed}/24</span>
                  </div>
                ) : null}

                <span className="mt-3 text-yellow-500 text-sm font-medium whitespace-nowrap">
                  {stage}
                </span>
              </div>

              {/* Dashed Line (except after the last stage) */}
              {index < stages.length - 1 && (
                <div
                  className="dashed-line"
                  style={{
                    backgroundColor:
                      index < currentStageIndex ? "#facc22" : "#6b7280",
                  }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketTracker;