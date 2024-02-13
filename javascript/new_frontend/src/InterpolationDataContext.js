import React, { createContext, useContext, useState } from 'react';

const InterpolationDataContext = createContext();

export function useInterpolationData() {
  return useContext(InterpolationDataContext);
}

export const InterpolationDataProvider = ({ children }) => {
  const [interpolationData, setInterpolationData] = useState(null);

  return (
    <InterpolationDataContext.Provider value={{ interpolationData, setInterpolationData }}>
      {children}
    </InterpolationDataContext.Provider>
  );
};
