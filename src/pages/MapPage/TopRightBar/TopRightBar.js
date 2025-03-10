import React from "react";

const NavbarTopRight = ({ toggleMapStyle, currentStyleIndex }) => {
  // Function to get appropriate icon based on current style
  const renderMapIcon = () => {
    switch (currentStyleIndex) {
      case 0: // streets
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"
            />
          </svg>
        );
      case 1: // dark
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
            />
          </svg>
        );
      case 2: // satellite
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  // Get button background color based on style
  const getButtonStyle = () => {
    switch (currentStyleIndex) {
      case 0: // streets
        return "bg-white";
      case 1: // dark
        return "bg-gray-800";
      case 2: // satellite
        return "bg-blue-800";
      default:
        return "bg-white";
    }
  };

  // Get icon color based on style
  const getIconColor = () => {
    return currentStyleIndex === 0 ? "text-gray-700" : "text-white";
  };

  // Get title based on style
  const getButtonTitle = () => {
    const titles = [
      "Switch to dark mode",
      "Switch to satellite view",
      "Switch to streets view"
    ];
    return titles[currentStyleIndex];
  };

  return (
    <div className="flex items-center bg-transparent">
      <div className="relative flex items-center space-x-4">
        {/* Map Switch Icon (Outside Navbar) */}
        <button
          onClick={toggleMapStyle}
          className={`w-12 h-12 rounded-full overflow-hidden border shadow-lg absolute -left-16 flex items-center justify-center ${getButtonStyle()}`}
          title={getButtonTitle()}
          aria-label={getButtonTitle()} // Add aria-label
        >
          <span className={getIconColor()}>
            {renderMapIcon()}
          </span>
        </button>

        {/* Rest of the Navbar */}
        <div className="flex items-center space-x-4 bg-white shadow-md rounded-full px-6 py-3 pl-14">
          {/* Status Indicator */}
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>

          {/* Notification Bell */}
          <button className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405C18.835 14.21 19 13.105 19 12V8a7 7 0 10-14 0v4c0 1.105.165 2.21.405 3.595L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
              />
            </svg>
          </button>

          {/* Email Icon with Notification Badge */}
          <button className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l9 6 9-6M4 6h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z"
              />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
              1
            </span>
          </button>

          {/* Profile Icon with User Name */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="white"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A4 4 0 018.914 15h6.172a4 4 0 013.793 2.804M12 11a4 4 0 100-8 4 4 0 000 8z"
                />
              </svg>
            </div>
            <span className="text-gray-500 font-medium">User Name</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarTopRight;