
import {  SplashScreen, Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux.toolkit/store";
import "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider } from "@clerk/clerk-expo";
import ClerkTokenProvider from "@/componentss/clerkTokenProvider";
import { ToastProvider } from "@/folder/toastService";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import {StripeProvider} from '@stripe/stripe-react-native'



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
    console.log(fontsLoaded);
    
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ClerkProvider publishableKey="pk_test_Ym9sZC1kdWNrbGluZy03MC5jbGVyay5hY2NvdW50cy5kZXYk">
        <Provider store={store}>
          <ClerkTokenProvider>
            <ToastProvider>
              <StripeProvider publishableKey="pk_test_51Re3kqIetrHxrdQ8R3S84zr8YR1OMwqW3KNjGQGWB4hUCyINYxNJfSrfD9llu98yQMHRDobHBj1j9GMUBTpfXhgk00ZET6yOby">
                <MainLayout />
              </StripeProvider>
            </ToastProvider>
          </ClerkTokenProvider>
        </Provider>
      </ClerkProvider>
    </GestureHandlerRootView>
  );
}


function MainLayout() {

  return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />

        {/* screens */}
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
      </Stack>

  );
}
