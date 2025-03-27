import { useState, useEffect, useRef } from "react";

export default function LiveComments({
  searchedComplaints,
  role,
  isFullscreen,
  markersRef,
  flyToLocation,
  setSelectedComplaint,
  setShowModal
}) {
  const [comments, setComments] = useState([]);
  const [visibleComments, setVisibleComments] = useState([]);
  const currentIndexRef = useRef(0);
  const commentIdsRef = useRef(new Set());
  const animationStateRef = useRef('fade-out'); // Track current animation state

  // Process new complaints into comment format
  useEffect(() => {
    const newTickets = searchedComplaints.filter((ticket) => 
      ticket.status === "New" || ticket.status === "In Progress"
    );

    setComments((prevComments) => {
      const ticketsToAdd = newTickets.filter(
        (ticket) => !commentIdsRef.current.has(ticket.ticketId)
      );

      if (ticketsToAdd.length > 0) {
        const newComments = ticketsToAdd.map((ticket) => {
          commentIdsRef.current.add(ticket.ticketId);
          
          return {
            id: ticket.ticketId,
            type: ticket.issueType || ticket.category,
            ticketId: ticket.ticketId,
            status: ticket.status,
            time: new Date(ticket.dateSubmitted || ticket.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            complaintData: ticket
          };
        });
        return [...prevComments, ...newComments];
      }
      return prevComments;
    });
  }, [searchedComplaints]);

  // Rotate visible comments
  useEffect(() => {
    if (comments.length === 0) return;

    const rotateComments = () => {
      if (comments.length === 1) {
        // Special handling for single comment
        setVisibleComments([comments[0]]);
        
        // Toggle animation state between fade-out and fade-in
        animationStateRef.current = animationStateRef.current === 'fade-out' ? 'fade-in' : 'fade-out';
      } else {
        // Normal rotation for multiple comments
        const nextIndex = (currentIndexRef.current + 1) % comments.length;
        const nextComments = [];
        
        // Always show 3 comments (current, next, next+1)
        for (let i = 0; i < 3; i++) {
          const index = (nextIndex + i) % comments.length;
          nextComments.push(comments[index]);
        }
        
        setVisibleComments(nextComments);
        currentIndexRef.current = nextIndex;
        animationStateRef.current = 'rotate'; // Standard rotation
      }
    };

    // Initial rotation
    rotateComments();

    // Set up interval for continuous rotation
    const interval = setInterval(rotateComments, 3000);

    // Clean up the interval when component unmounts or comments change
    return () => clearInterval(interval);
  }, [comments, isFullscreen]);

  const handleCommentClick = (complaintData) => {
    if (flyToLocation && setSelectedComplaint) {
      setSelectedComplaint(complaintData);
      flyToLocation(complaintData);
    }
  };

  return (
    <div className="live-feed">
      {comments.length === 1 ? (
        // Single comment with alternating animation
        <div
          key={comments[0].id}
          className={`comment ${animationStateRef.current}`}
          onClick={() => handleCommentClick(comments[0].complaintData)}
        >
          <div className="flex justify-between">
            <span className="font-medium">
              {comments[0].type} - {comments[0].ticketId}
            </span>
            <span className={`status ${comments[0].status.toLowerCase().replace(" ", "-")}`}>
              ({comments[0].status}) {comments[0].time}
            </span>
          </div>
        </div>
      ) : (
        // Multiple comments with standard rotation
        visibleComments.map((comment, index) => (
          <div
            key={`${comment.id}-${index}`}
            className={`comment ${
              index === 0 ? "fade-out" : 
              index === visibleComments.length - 1 ? "fade-in" : "slide-up"
            }`}
            onClick={() => handleCommentClick(comment.complaintData)}
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
        ))
      )}

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
          margin: 2px 0;
          border-radius: 8px;
          color: white;
          font-size: 14px;
          position: relative;
          transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.5s ease-in-out;
          cursor: pointer;
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