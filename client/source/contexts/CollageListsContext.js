import React, { createContext, useContext, useState, useCallback } from "react";

const CollageListsContext = createContext();

export const CollageListsProvider = ({ children }) => {
  const [archivedCollages, setArchivedCollages] = useState([]);
  const [savedCollages, setSavedCollages] = useState([]);
  const [taggedCollages, setTaggedCollages] = useState([]);
  const [likedCollages, setLikedCollages] = useState([]);

  // Utility function to add a collage to a list
  const addCollageToContext = useCallback((listName, collage) => {
    switch (listName) {
      case "archived":
        setArchivedCollages((prev) => [...prev, collage]);
        break;
      case "saved":
        setSavedCollages((prev) => [...prev, collage]);
        break;
      case "tagged":
        setTaggedCollages((prev) => [...prev, collage]);
        break;
      case "liked":
        setLikedCollages((prev) => [...prev, collage]);
        break;
      default:
        console.warn(`Unknown list: ${listName}`);
    }
  }, []);

  // Utility function to remove a collage from a list
  const removeCollageFromContext = useCallback((listName, collageId) => {
    switch (listName) {
      case "archived":
        setArchivedCollages((prev) =>
          prev.filter((collage) => collage._id !== collageId)
        );
        break;
      case "saved":
        setSavedCollages((prev) =>
          prev.filter((collage) => collage._id !== collageId)
        );
        break;
      case "tagged":
        setTaggedCollages((prev) =>
          prev.filter((collage) => collage._id !== collageId)
        );
        break;
      case "liked":
        setLikedCollages((prev) =>
          prev.filter((collage) => collage._id !== collageId)
        );
        break;
      default:
        console.warn(`Unknown list: ${listName}`);
    }
  }, []);

  return (
    <CollageListsContext.Provider
      value={{
        archivedCollages,
        savedCollages,
        taggedCollages,
        likedCollages,
        addCollageToContext,
        removeCollageFromContext,
      }}
    >
      {children}
    </CollageListsContext.Provider>
  );
};

export const useCollageLists = () => useContext(CollageListsContext);
