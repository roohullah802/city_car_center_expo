import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

let showToastFn: ((message: string) => void) | null = null;

export const showToast = (message: string) => {
  if (showToastFn) {
    showToastFn(message);
  } else {
    console.warn("⚠️ ToastProvider not mounted yet.");
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [message, setMessage] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showToastFn = (msg: string) => {
      setMessage(msg);
      setVisible(true);
      fadeAnim.setValue(0);

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    };

    return () => {
      showToastFn = null;
    };
  }, [fadeAnim]);

  return (
    <View style={{ flex: 1 }}>
      {children}

      <Animated.View
        pointerEvents="none"
        style={[
          styles.toastContainer,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-40, 0],
                }),
              },
            ],
          },
        ]}
      >
        {visible && (
          <View style={styles.toast}>
            <Text style={styles.text} numberOfLines={2}>{message}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
    elevation: 9999,
    padding: 30
  },
  toast: {
    // width: 300,
    backgroundColor: "#353839",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
});
