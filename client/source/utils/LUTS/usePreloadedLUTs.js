import { Asset } from "expo-asset";
import { useState, useEffect } from "react";

export const usePreloadedLUTs = () => {
  const [lutTextures, setLutTextures] = useState([]);

  useEffect(() => {
    const preloadLUTs = async () => {
      try {
        const luts = [
          require("../../../assets/luts/standard-lut.png"),
          require("../../../assets/luts/disposable-lut.png"),
          require("../../../assets/luts/kodak-lut.png"),
        ];

        const loadedAssets = await Promise.all(
          luts.map(async (lut) => {
            try {
              const [asset] = await Asset.loadAsync(lut); // Use array destructuring
              return asset.localUri || asset.uri;
            } catch (error) {
              console.error("Error loading LUT:", error);
              return null; // Return null for failed LUTs
            }
          })
        );

        // Filter out any null values from failed loads
        const validTextures = loadedAssets.filter(Boolean);
        setLutTextures(validTextures);
      } catch (error) {
        console.error("Error preloading LUTs:", error);
      }
    };

    preloadLUTs();
  }, []);

  return lutTextures;
};
