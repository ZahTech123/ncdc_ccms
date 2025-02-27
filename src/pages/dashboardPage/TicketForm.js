import React, { useState } from "react";
import Modal from "react-modal";
import ModalMap from "./ModalMap";  // Ensure ModalMap exists or remove this line if not needed
import { sendEmail } from "./EmailEscalation";
// Initialize EmailJS with your Public Key
//emailjs.init("SimW6urql2il_yFhB");  // Replace with your Public Key

// Mapping of suburbs to electorates
const suburbElectorateMapping = {
  "Eight Mile": "Moresby North-East Open",
  "Nine Mile": "Moresby North-East Open",
  "Air Transport Squadron (ATS)": "Moresby North-East Open",
  Erima: "Moresby North-East Open",
  Gordons: "Moresby North-East Open",
  "Gordons North": "Moresby North-East Open",
  "Jacksons Airport Area": "Moresby North-East Open",
  Makana: "Moresby North-East Open",
  "Moitaka Ridge": "Moresby North-East Open",
  "North Waigani": "Moresby North-East Open",
  "Portion Two Hundred Seventy-One": "Moresby North-East Open",
  Sabama: "Moresby North-East Open",
  "Saraga (Six Mile)": "Moresby North-East Open",
  Wildlife: "Moresby North-East Open",
  Baruni: "Moresby North-West Open",
  Boroko: "Moresby North-West Open",
  "Ensisi Valley": "Moresby North-West Open",
  "Gerehu Stage One": "Moresby North-West Open",
  "Gerehu Stage Two": "Moresby North-West Open",
  "Gerehu Stage Three": "Moresby North-West Open",
  "Gerehu Stage Four": "Moresby North-West Open",
  "Gerehu Stage Five": "Moresby North-West Open",
  "Gerehu Stage Six": "Moresby North-West Open",
  "Gerehu Stage Seven": "Moresby North-West Open",
  "Hohola One": "Moresby North-West Open",
  "Hohola Two": "Moresby North-West Open",
  "Hohola Three": "Moresby North-West Open",
  "Hohola Four": "Moresby North-West Open",
  "June Valley": "Moresby North-West Open",
  Kaevaga: "Moresby North-West Open",
  "Morata One": "Moresby North-West Open",
  "Morata Two": "Moresby North-West Open",
  "Morata Three": "Moresby North-West Open",
  "Morata Four": "Moresby North-West Open",
  "Rainbow Estate": "Moresby North-West Open",
  Tokarara: "Moresby North-West Open",
  "University of PNG (Waigani)": "Moresby North-West Open",
  "Waigani Central": "Moresby North-West Open",
  "Waigani North": "Moresby North-West Open",
  "Waigani Drive": "Moresby North-West Open",
  Badili: "Moresby South Open",
  Gabutu: "Moresby South Open",
  Hanuabada: "Moresby South Open",
  Kaugere: "Moresby South Open",
  Koki: "Moresby South Open",
  Konebada: "Moresby South Open",
  "Kone (Korobosea)": "Moresby South Open",
  "Manu Autoport": "Moresby South Open",
  "Town (Downtown Port Moresby)": "Moresby South Open",
  Taurama: "Moresby South Open",
  Vadavada: "Moresby South Open",
};

// Mapping of Directorates to their respective issue types
const directorateIssueTypeMapping = {
  "Sustainability & Lifestyle": [
    "Urban Safety",
    "Waste Management",
    "Markets",
    "Parks & Gardens",
    "Eda City Bus",
  ],
  Compliance: [
    "Liquor License",
    "Building",
    "Development Control & Physical Planning",
    "Enforcement",
  ],
  "City Planning & Infrastructure": [
    "Streetlights & Traffic Management",
    "Road Furniture & Road Signs",
    "Potholes & Drainage",
    "Strategic Planning",
  ],
};

const TicketForm = ({ onSubmit }) => {
  const [directorate, setDirectorate] = useState("");
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [priority, setPriority] = useState("");
  const [suburb, setSuburb] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!latitude || !longitude) {
      alert("Please select a location before submitting.");
      return;
    }

    const electorate = suburbElectorateMapping[suburb] || "Unknown Electorate";
    const team = directorate;

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US");
    const formattedTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const defaultDescription = `Operator | ${formattedDate}, ${formattedTime} | New | New Ticket registered by Controls Operator.|`;
    const editedDescription = `Operator | ${formattedDate}, ${formattedTime} | New | ${description}|`;

    const ticket = {
      directorate,
      issueType,
      description: editedDescription || defaultDescription,
      name,
      priority,
      suburb,
      electorate,
      latitude,
      longitude,
      status: "New",
      dateSubmitted: now.toISOString(),
      submissionTime: formattedTime,
      currentHandler: "Supervisor",
      previousHandler: "Operator",
      team,
      handlerStartDateAndTime: now.toISOString(),
      closedTime: formattedTime,
      previousHandlers: ["operator", "supervisorC"],
      escalationCount: 0,
      resolved: false,
      isRead: {
        admin: false,
        supervisorC: false,
        operator: false,
        bU_admin: false,
        bU_adminCPI: false,
      },
    };

    console.log("Ticket before onSubmit:", ticket);
    onSubmit(ticket);

    // Send email
    await sendEmail(ticket);
  };

  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const saveLocation = () => {
    if (window.globalLat !== undefined && window.globalLng !== undefined) {
      setLatitude(window.globalLat);
      setLongitude(window.globalLng);
      setIsModalOpen(false);
    } else {
      alert("Please select a valid location on the map.");
    }
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow-md p-6 border border-gray-500">
      <form id="userForm" className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <select
            id="directorate"
            className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
            value={directorate}
            onChange={(e) => setDirectorate(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Directorate
            </option>
            <option value="Sustainability & Lifestyle">
              Sustainability & Lifestyle
            </option>
            <option value="Compliance">Compliance</option>
            <option value="City Planning & Infrastructure">
              City Planning & Infrastructure
            </option>
          </select>
        </div>
        <div>
          <select
            id="issueType"
            className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
            value={issueType}
            onChange={(e) => setIssueType(e.target.value)}
            required
            disabled={!directorate}
          >
            <option value="" disabled>
              Select Issue Type
            </option>
            {directorate &&
              directorateIssueTypeMapping[directorate].map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
          </select>
        </div>
        <div>
          <textarea
            id="description"
            placeholder="Description of the complaint"
            className="w-full bg-gray-700 p-2 rounded-md text-sm h-24 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <input
            type="text"
            id="name"
            placeholder="Requester Name (Optional)"
            className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <select
            id="priority"
            className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Priority
            </option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <select
            id="suburb"
            className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            required
          >
            <option value="" disabled>
              Select Suburb
            </option>
            {Object.keys(suburbElectorateMapping).map((suburb) => (
              <option key={suburb} value={suburb}>
                {suburb}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-4">
          <div className="w-1/2">
            <input
              type="text"
              id="latitude"
              placeholder="Latitude"
              className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
              value={latitude}
              readOnly
            />
          </div>
          <div className="w-1/2">
            <input
              type="text"
              id="longitude"
              placeholder="Longitude"
              className="w-full bg-gray-700 p-2 rounded-md text-sm text-white"
              value={longitude}
              readOnly
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            id="selectLocationButton"
            className="w-full bg-gray-700 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600"
            onClick={() => setIsModalOpen(true)}
          >
            Select Location
          </button>
        </div>
        <div className="flex justify-between space-x-4">
          <button
            type="button"
            className="w-1/2 text-white py-2 px-4 rounded-md shadow hover:bg-gray-600 border border-gray-100 border-opacity-30"
            onClick={() => {
              setDirectorate("");
              setIssueType("");
              setDescription("");
              setName("");
              setPriority("");
              setSuburb("");
              setLatitude("");
              setLongitude("");
            }}
          >
            Clear
          </button>
          <button
            type="submit"
            className="w-1/2 bg-yellow-400 text-black py-2 px-4 rounded-md shadow hover:bg-yellow-300"
          >
            Submit
          </button>
        </div>
      </form>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Select Location"
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50"
        overlayClassName="modal-overlay"
      >
        <div
          className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-[800px]"
          style={{ zIndex: 9999 }}
        >
          <h2 className="text-lg font-semibold text-gray-800 text-center mb-4">
            Select Location
          </h2>
          <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
            <ModalMap onLocationSelect={handleLocationSelect} />
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
              onClick={saveLocation}
            >
              Save Location
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TicketForm;