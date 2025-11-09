import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux.toolkit/store";
import {
  clearToken,
  clearUserData,
  setLoggedIn,
} from "../../../redux.toolkit/slices/userSlice";
import { showToast } from "../../../folder/toastService";
import { router } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";

const { width } = Dimensions.get("window");

interface LogoutModalProps {
  visible: boolean;
  onClose: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const [loading , setLoading] = useState<boolean>(false);
  const { signOut } = useClerk();

  const handleLogout = async () => {
    setLoading(true)
    try {
      if (!isLoggedIn) {
        showToast("please login first!");
        return;
      }

      await signOut();

      dispatch(clearUserData());
      dispatch(setLoggedIn(false));
      dispatch(clearToken());
      router.push("/screens/Auth/SocialAuth");
    } catch (error: any) {
      showToast(error.data.message || error.message || "Logout failed!");
      onClose();
    }finally{
      setLoading(false)
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Icon */}
          <View style={styles.iconWrapper}>
            <Icon name="lock-closed-outline" size={width * 0.08} color="#fff" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Log Out</Text>
          <Text style={styles.subtitle}>
            Are you sure you want to log out? You’ll need to sign in again to
            access your account.
          </Text>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              disabled={loading}
              style={[styles.enableBtn]}
              onPress={handleLogout}
            >
              {loading ? (
                <ActivityIndicator size={"small"} color={"#73C2FB"} />
              ) : (
                <Text style={styles.enableText}>{"Logout"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: width * 0.06,
    width: "100%",
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#004AAD",
    borderRadius: 50,
    padding: width * 0.04,
    marginBottom: width * 0.04,
  },
  title: {
    fontSize: width * 0.05,
    color: "#3f3f3fff",
    marginBottom: width * 0.02,
    fontFamily: 'bold',
  },
  subtitle: {
    fontSize: width * 0.038,
    color: "#6B6B6B",
    textAlign: "center",
    marginBottom: width * 0.06,
    fontFamily: 'demiBold',
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: width * 0.04,
    height: width * 0.13,
    backgroundColor: "#F6F8F8",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: width * 0.06,
  },
  input: {
    flex: 1,
    fontSize: width * 0.042,
    color: "#000",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: width * 0.04,
  },
  enableBtn: {
    flex: 1,
    paddingVertical: width * 0.035,
    borderRadius: 8,
    backgroundColor: "#73C2FB",
    alignItems: "center",
  },
  enableText: {
    color: "#fff",
    fontWeight: "500",
    fontFamily: 'demiBold',
  },
});

export default LogoutModal;
