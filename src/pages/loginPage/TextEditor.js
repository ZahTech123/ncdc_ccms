import React, { useState, useEffect } from "react";

const TextEditor = () => {
  const [text, setText] = useState("This is a sample text.");
  const [editable, setEditable] = useState(false);
  const [userPermissions, setUserPermissions] = useState([]);

  useEffect(() => {
    // Fetch user permissions from localStorage
    const permissions = JSON.parse(localStorage.getItem("userPermissions")) || [];
    setUserPermissions(permissions);
    console.log("User permissions loaded:", permissions);
  }, []);

  const handleEdit = () => {
    if (userPermissions.includes("edit")) {
      setEditable(true);
    } else {
      console.log("User does not have permission to edit.");
    }
  };

  const handleDelete = () => {
    if (userPermissions.includes("delete")) {
      setText("");
      console.log("Text deleted.");
    } else {
      console.log("User does not have permission to delete.");
    }
  };

  const handleSave = () => {
    setEditable(false);
    console.log("Text saved:", text);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Text Editor</h2>
      {editable ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      ) : (
        <p className="mb-4">{text}</p>
      )}
      <div className="flex space-x-2">
        {userPermissions.includes("edit") && (
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
        )}
        {userPermissions.includes("delete") && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        )}
        {editable && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        )}
      </div>
    </div>
  );
};

export default TextEditor;