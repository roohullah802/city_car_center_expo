import { useSSO } from "@clerk/clerk-expo";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
} from "react-native";
import { View } from "react-native-animatable";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { showToast } from "@/folder/toastService";

const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function SignInWithApple() {
  const [loading, setLoading] = useState<boolean>(false);
  const { startSSOFlow } = useSSO();
  useWarmUpBrowser();

  const handlePress = useCallback(async () => {
    console.log("pressed!");

    try {
      if (!startSSOFlow) {
        console.warn("startSSOFlow is not ready yet");
        return;
      }
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_apple",
        redirectUrl: Linking.createURL("/"),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      } else {
        showToast("Apple sign in failed!");
      }
    } catch (error: any) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  }, [startSSOFlow]);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      style={[styles.button, { height: 56 }]}
    >
      <View style={styles.iconWrap}>
        <Image
          source={require("../../../assests/apple.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.labelWrap}>
        <Text style={styles.buttonLabel}>
          {loading ? (
            <ActivityIndicator
              style={{ justifyContent: "center", alignItems: "center" }}
              size={"small"}
              color={'#73C2FB'}
            />
          ) : (
            "Sign-in with Apple"
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
