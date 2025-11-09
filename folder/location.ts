import { useState, useEffect } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import Geolocation, { PositionError, GeoPosition, GeoError } from 'react-native-geolocation-service';

async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const permissionsToRequest = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ];

    try {
      const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);

      const fine = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION];
      const coarse = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION];

      const isFineGranted = fine === PermissionsAndroid.RESULTS.GRANTED;
      const isCoarseGranted = coarse === PermissionsAndroid.RESULTS.GRANTED;

      return isFineGranted && isCoarseGranted;
    } catch (err) {
      return false;
    }
  } else {
    // iOS case
    try {
      const authStatus = await Geolocation.requestAuthorization('whenInUse');
      return authStatus === 'granted';
    } catch (err) {
      return false;
    }
  }
}

const useLocationData = (): GeoPosition | null => {
  const [location, setLocation] = useState<GeoPosition | null>(null);

  useEffect(() => {
    let isActive = true;

    (async () => {
      const hasPerm = await requestLocationPermission();
      if (!isActive) return;
      if (!hasPerm) {
        Alert.alert('Permission denied', 'Cannot get location without permission');
        return;
      }

      Geolocation.getCurrentPosition(
        (pos: GeoPosition) => {
          if (!isActive) return;
          setLocation(pos);
        },
        (error: GeoError) => {
          if (!isActive) return;
          switch (error.code) {
            case PositionError.PERMISSION_DENIED:
              Alert.alert('Permission Denied', 'User denied the request for location.');
              break;
            case PositionError.POSITION_UNAVAILABLE:
              Alert.alert('Position Unavailable', 'Location information is unavailable.');
              break;
            case PositionError.TIMEOUT:
              Alert.alert('Timeout', 'The request to get user location timed out.');
              break;
            case PositionError.PLAY_SERVICE_NOT_AVAILABLE:
              Alert.alert('Play Services Not Available', 'Google Play services are not available.');
              break;
            case PositionError.SETTINGS_NOT_SATISFIED:
              Alert.alert('Settings Not Satisfied', 'Location settings are not satisfied.');
              break;
            case PositionError.INTERNAL_ERROR:
              Alert.alert('Internal Error', 'An internal error occurred.');
              break;
            default:
              Alert.alert('Unknown Error', 'An unknown error occurred.');
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          forceRequestLocation: true,
        }
      );
    })();

    return () => {
      isActive = false;
    };
  }, []);

  return location;
};

export { useLocationData };
