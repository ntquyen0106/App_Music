import React, { useEffect, createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [library, setLibrary] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);


  return (
    <AppContext.Provider value={{ library, setLibrary, playlists, setPlaylists,followedArtists, setFollowedArtists}}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
