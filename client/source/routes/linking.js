import * as Linking from "expo-linking";

const linking = {
  prefixes: ["https://joinlifelist.com"], // Base URL for deep linking
  config: {
    screens: {
      MainApp: {
        screens: {
          ProfileStack: {
            screens: {
              Profile: "profile/:userId", // Profile screen with a userId param
              CollageStack: {
                screens: {
                  SingleCollage: "profile/:userId/collage/:collageId",
                },
              },
            },
          },
        },
      },
    },
  },
};

export default linking;
