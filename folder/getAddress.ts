// folder/getAddress.ts
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export function useGetCurrentLocation() {
  const [address, setAddress] = useState<string>("N/A");

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setAddress("Permission denied");
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const geo = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geo.length > 0) {
          const g = geo[0];
          const fullAddress = `${g.name || ""} ${g.street || ""}, ${g.city || ""}`;
          setAddress(fullAddress);
        }
      } catch (err) {
        console.log("Location error:", err);
        setAddress("N/A");
      }
    })();
  }, []);

  return address;
}
