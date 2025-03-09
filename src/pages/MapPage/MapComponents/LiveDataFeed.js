import { useState, useEffect, useRef } from "react";
import { useTickets } from "../../../context/TicketsContext";

export default function LiveComments() {
  const [comments, setComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState([]);
  const { filteredTickets } = useTickets();
  const currentIndexRef = useRef(0);

  useEffect(() => {
    const newTickets = filteredTickets.filter((ticket) => ticket.status === "New");

    setComments((prevComments) => {
      const currentCommentIds = prevComments.map((comment) => comment.id);
      const ticketsToAdd = newTickets.filter(
        (ticket) => !currentCommentIds.includes(ticket.id)
      );

      if (ticketsToAdd.length > 0) {
        const newComments = ticketsToAdd.map((ticket) => ({
          id: ticket.id,
          type: ticket.issueType,
          ticketId: ticket.ticketId,
          status: ticket.status,
          time: new Date(ticket.dateSubmitted).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        return [...prevComments, ...newComments];
      }
      return prevComments;
    });
  }, [filteredTickets]);

  useEffect(() => {
    if (comments.length === 0) return;

    setVisibleComments(comments.slice(0, 3));

    const interval = setInterval(() => {
      currentIndexRef.current = (currentIndexRef.current + 1) % comments.length;
      setVisibleComments(comments.slice(currentIndexRef.current, currentIndexRef.current + 3));
    }, 5000);

    return () => clearInterval(interval);
  }, [comments]);

  return (
    <div className="live-feed">
      {visibleComments.map((comment, index) => (
        <div
          key={comment.id}
          className={`comment ${index === 0 ? "fade-out" : "slide-up"} ${
            index === 2 ? "fade-in" : ""
          }`}
        >
          <div className="flex justify-between">
            <span className="font-medium">
              {comment.type} - {comment.ticketId}
            </span>
            <span className={`status ${comment.status.toLowerCase().replace(" ", "-")}`}>
              ({comment.status}) {comment.time}
            </span>
          </div>
        </div>
      ))}

      <style jsx>{`
        .live-feed {
          position: fixed;
          bottom: 20px;
          left: 20px;
          width: 320px;
          max-height: 180px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 100;
          background: rgba(255, 255, 255, 0);
          backdrop-filter: blur(5px);
          border-radius: 12px;
          padding: 10px;
        }
        .comment {
          background: rgba(85, 85, 85, 0.35);
          padding: 8px;
          margin: 2px 0; /* Reduced spacing */
          border-radius: 8px;
          color: white;
          font-size: 14px;
          position: relative;
          transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease-in-out;
        }
        .status {
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .status.new {
          color: #10b981;
        }
        .status.in-progress {
          color: #fbbf24;
        }
        .status.resolved {
          color: #6b7280;
        }
        .status.overdue {
          color: #ef4444;
        }
        .fade-out {
          animation: fadeOutUp 0.5s ease-in-out forwards;
        }
        .slide-up {
          animation: slideUp 0.5s ease-in-out forwards;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-in-out forwards;
        }
        @keyframes fadeOutUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-15px);
          }
        }
        @keyframes slideUp {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            transform: translateY(-15px);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
