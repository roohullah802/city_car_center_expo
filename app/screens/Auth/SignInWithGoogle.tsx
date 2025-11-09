import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet } from "react-native";
import { Image, Text, TouchableOpacity } from "react-native";
import { View } from "react-native-animatable";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useSSO, useAuth } from "@clerk/clerk-expo";
import { showToast } from "@/folder/toastService";
import { useDispatch } from "react-redux";
import {
  setToken,
} from "@/redux.toolkit/slices/userSlice";
import { router } from "expo-router";

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "android") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInWithGoogle() {
  const [loading, setLoading] = useState<boolean>(false);
  const { startSSOFlow } = useSSO();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  useWarmUpBrowser();

  const handlePress = useCallback(async () => {
    setLoading(true);
    try {
      if (!startSSOFlow) {
        console.warn("startSSOFlow is not ready yet");
        return;
      }
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/"),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        const token = await getToken();
        if (!token) throw new Error("Token not received");

        dispatch(setToken(token));
        router.push("/(tabs)/Home")
      } else {
        showToast("Google sign in failed!");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow, dispatch, getToken]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.button, { height: 56 }]}
    >
      <View style={styles.iconWrap}>
        <Image
          source={require("../../../assests/google.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.labelWrap}>
        <Text style={styles.buttonLabel}>
          {loading ? (
            <ActivityIndicator size={"small"} />
          ) : (
            "Sign-in with google"
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 5,
    paddingHorizontal: 14,
    borderWidth: 0.2,
    borderColor: "gray",
    marginBottom: 12,
  },
  iconWrap: { width: 48, alignItems: "center", justifyContent: "center" },
  icon: { width: 28, height: 28 },
  labelWrap: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    paddingLeft: 6,
  },
  buttonLabel: {
    color: "#222",
    fontWeight: "600",
    letterSpacing: -0.6,
    fontSize: 12,
  },
});
