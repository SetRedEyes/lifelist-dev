import React, { createContext, useContext, useState } from "react";

const FeedRefreshContext = createContext();

export const FeedRefreshProvider = ({ children }) => {
  const [refreshMainFeed, setRefreshMainFeed] = useState(false);
  return (
    <FeedRefreshContext.Provider
      value={{ refreshMainFeed, setRefreshMainFeed }}
    >
      {children}
    </FeedRefreshContext.Provider>
  );
};

export const useFeedRefresh = () => useContext(FeedRefreshContext);
