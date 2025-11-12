import { SplashScreen, Stack } from "expo-router";
import { Provider, useSelector } from "react-redux";
import { store, RootState, persistor } from "../redux.toolkit/store";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider } from "@clerk/clerk-expo";
import ClerkTokenProvider from "@/componentss/clerkTokenProvider";
import { ToastProvider } from "@/folder/toastService";
import { useFonts } from "expo-font";
import { useEffect, useState } from "react";
import { StripeProvider } from "@stripe/stripe-react-native";
import { tokenCache } from "@/folder/tokenCache";
import * as LocalAuthentication from "expo-local-authentication";
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { PersistGate } from "redux-persist/integration/react";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    regular: require("../assests/fonts/TTHoves-Regular.ttf"),
    medium: require("../assests/fonts/TTHoves-Medium.ttf"),
    demiBold: require("../assests/fonts/TTHoves-DemiBold.ttf"),
    bold: require("../assests/fonts/TTHoves-Bold.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar 
        translucent
        backgroundColor="transparent"
        barStyle='dark-content'
      />
      <ClerkProvider
        tokenCache={tokenCache}
        publishableKey="pk_test_Ym9sZC1kdWNrbGluZy03MC5jbGVyay5hY2NvdW50cy5kZXYk"
      >
        <Provider store={store}>
         <PersistGate loading={null} persistor={persistor}>
           <ClerkTokenProvider>
            <ToastProvider>
              <StripeProvider publishableKey="pk_test_51Re3kqIetrHxrdQ8R3S84zr8YR1OMwqW3KNjGQGWB4hUCyINYxNJfSrfD9llu98yQMHRDobHBj1j9GMUBTpfXhgk00ZET6yOby">
                <MainLayoutWithBiometric />
              </StripeProvider>
            </ToastProvider>
          </ClerkTokenProvider>
         </PersistGate>
        </Provider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}


function MainLayoutWithBiometric() {
  const biometricEnabled = useSelector(
    (state: RootState) => state.security.isLocked
  );
  const [isUnlocked, setIsUnlocked] = useState(!biometricEnabled);
  const [checking, setChecking] = useState(biometricEnabled);

  useEffect(() => {
    const authenticate = async () => {
      if (!biometricEnabled) return;

      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: "Unlock with Biometrics",
          fallbackLabel: "Enter Passcode",
        });

        if (result.success) {
          setIsUnlocked(true);
        }
      } catch (err) {
        console.error("Biometric authentication failed", err);
      } finally {
        setChecking(false);
      }
    };

    if (biometricEnabled) {
      authenticate();
    }
  }, [biometricEnabled]);

  if (checking) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.lockText}>Checking Biometrics...</Text>
        <ActivityIndicator size="large" color="#45B1E8" />
      </View>
    );
  }

  if (!isUnlocked && biometricEnabled) {
    return (
      <View style={styles.lockScreen}>
        <Text style={styles.lockText}>Please unlock to continue</Text>
        <ActivityIndicator size="large" color="#45B1E8" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />

      {/* Other screens */}
      <Stack.Screen name="screens/Others/BrandCards" />
      <Stack.Screen name="screens/Others/SearchCarCards" />
      <Stack.Screen name="screens/Others/CarCardsByBrand" />
      <Stack.Screen name="screens/Setting/PrivatePolicy" />
      <Stack.Screen name="screens/Setting/Report" />
      <Stack.Screen name="screens/Lease/ExtendLease" />
      <Stack.Screen name="screens/Others/CarLeaseDetails" />
      <Stack.Screen name="screens/Others/DateAndTime" />
      <Stack.Screen name="screens/Lease/LeaseDetails" />
      <Stack.Screen name="screens/Payments/PaymentDetails" />
      <Stack.Screen name="screens/Payments/PaymentSuccess" />
      <Stack.Screen name="screens/Auth/SocialAuth" />
      <Stack.Screen name="screens/Others/CarImages" />
      <Stack.Screen name="screens/Lease/LeaseHistory" />
      <Stack.Screen name="screens/Auth/BiometricScreen" />
      <Stack.Screen name="screens/Setting/DocumentUploadScreen"/>
    </Stack>
  );
}

const styles = StyleSheet.create({
  lockScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  lockText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#222",
  },
});
