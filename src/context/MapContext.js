// src/context/MapContext.js
import { createContext, useContext } from 'react';

const MapContext = createContext(null);

export const MapProvider = ({ children, map }) => (
  <MapContext.Provider value={map}>
    {children}
  </MapContext.Provider>
);

export const useMap = () => useContext(MapContext);