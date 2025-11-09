import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LogoutModal from '../screens/Auth/Logout';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux.toolkit/store';
import { clearGuest } from '../../redux.toolkit/slices/userSlice';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const Settings: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const { userData, isLoggedIn } = useSelector(
    (state: RootState) => state.user,
  );
  const dispatch = useDispatch();

  const handleVisible = () => setIsVisible(prev => !prev);

  const avatarSource =
    isLoggedIn && userData?.profile
      ? { uri: userData.profile }
      : require('../../assests/guest3.png');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Text style={styles.header}>Settings</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={avatarSource}
            style={styles.avatar}
            resizeMode="cover"
          />

          <View style={styles.profileDetails}>
            <Text style={styles.name}>
              {userData?.name
                ? userData.name.charAt(0).toUpperCase() + userData.name.slice(1)
                : 'Guest'}
            </Text>
            {userData?.email && (
              <Text numberOfLines={1} ellipsizeMode="tail" style={styles.email}>
                {userData.email}
              </Text>
            )}
          </View>

          {!isLoggedIn && (
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                router.push("/screens/Auth/SocialAuth")
                dispatch(clearGuest())
              }}
              activeOpacity={0.7}
              accessibilityLabel="Login"
            >
              <Text style={styles.login}>Login</Text>
              <Icon name="log-in-outline" size={26} color="#45B1E8" />
            </TouchableOpacity>
          )}
        </View>

        {/* History */}
        {isLoggedIn && (
          <>
            <Text style={styles.sectionTitle}>History</Text>
            <View style={styles.card}>
              <SettingsRow
                icon="hourglass-outline"
                label="Lease History"
                onPress={() => router.push("/screens/Lease/LeaseHistory")}
              />
            </View>
          </>
        )}

        {/* Helpful Desk */}
        <Text style={styles.sectionTitle}>Helpful Desk</Text>
        <View style={styles.card}>
          <SettingsRow
            icon="help-circle-outline"
            label="FAQs"
            onPress={() => router.push("/screens/Setting/Faqs")}
          />
          <SettingsRow
            icon="document-text-outline"
            label="Terms & Privacy Policy"
            onPress={() => router.push("/screens/Setting/PrivatePolicy")}
          />
          <SettingsRow
            icon="chatbubble-ellipses-outline"
            label="Report Issue"
            onPress={() => router.push("/screens/Setting/Report")}
          />
        </View>

        {/* Logout */}
        {isLoggedIn && (
          <View style={styles.card}>
            <SettingsRow
              icon="log-out-outline"
              label="Logout"
              onPress={handleVisible}
            />
          </View>
        )}
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutModal visible={isVisible} onClose={() => setIsVisible(false)} />
    </SafeAreaView>
  );
};

type SettingsRowProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

const SettingsRow: React.FC<SettingsRowProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityLabel={`Go to ${label}`}
  >
    <View style={styles.rowLeft}>
      <Icon name={icon} size={22} color="#444" />
      <Text style={styles.rowLabel} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </View>
    <Icon name="chevron-forward" size={18} color="#999" />
  </TouchableOpacity>
);

export default Settings;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: width * 0.05,
  },
  scrollContent: {
    paddingBottom: RFValue(40),
  },
  header: {
    fontSize: RFValue(20),
    fontFamily: 'bold',
    color: '#1F305E',
    marginVertical: RFValue(16),
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: RFValue(14),
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: RFValue(20),
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  avatar: {
    width: RFValue(56),
    height: RFValue(56),
    borderRadius: RFValue(28),
    marginRight: RFValue(12),
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    fontSize: RFValue(14),
    fontFamily: 'bold',
    color: '#1F305E',
  },
  email: {
    fontSize: RFValue(11),
    color: '#6B7280',
    fontFamily: 'demiBold',
  },
  sectionTitle: {
    fontSize: RFValue(12),
    color: '#9CA3AF',
    marginBottom: RFValue(6),
    marginTop: RFValue(12),
    fontFamily: 'demiBold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 1,
    marginBottom: RFValue(14),
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  row: {
    paddingHorizontal: RFValue(14),
    paddingVertical: RFValue(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#F3F4F6',
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rowLabel: {
    fontSize: RFValue(13),
    color: '#1F305E',
    marginLeft: RFValue(12),
    flexShrink: 1,
    fontFamily: 'demiBold',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  login: {
    fontFamily: 'bold',
    color: '#45B1E8',
    marginRight: RFValue(6),
  },
});
