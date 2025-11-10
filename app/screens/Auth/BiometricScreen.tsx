import React, { useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context'
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux.toolkit/store';
import * as LocalAuthentication from 'expo-local-authentication';
import { showToast } from '../../../folder/toastService';
import { setLocked } from '@/redux.toolkit/slices/securitySlice';
import { RFValue } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/Ionicons';
import { router } from 'expo-router';

const BiometricScreen: React.FC = () => {
  const dispatch = useDispatch();
  const biometricEnabled = useSelector((state: RootState) => state.security.isLocked);

  const toggleBiometric = useCallback(async () => {
    if (!biometricEnabled) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return showToast('Biometric authentication not available or not enrolled');
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Enable Biometric Login',
      });

      if (!result.success) {
        return showToast('Authentication failed');
      }
    }

    dispatch(setLocked(!biometricEnabled));
    showToast(`Biometric ${!biometricEnabled ? 'enabled' : 'disabled'}`);
  }, [biometricEnabled, dispatch]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Security Settings</Text>
          <Text style={styles.headerSubtitle}>
            Protect your account with biometric authentication
          </Text>
        </View>

        {/* Biometric Card */}
        <View style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.info}>
              <Icon name="finger-print-outline" size={28} color="#45B1E8" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.cardTitle}>Enable Biometric Login</Text>
                <Text style={styles.cardSubtitle}>
                  Use Face ID / Touch ID to unlock the app quickly and securely.
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={toggleBiometric}
              trackColor={{ false: '#ccc', true: '#45B1E8' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            When enabled, you will be prompted to unlock the app using biometrics whenever you open it.
          </Text>
        </View>

        {/* Optional: Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Icon name="chevron-back-outline" size={24} color="#45B1E8" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default BiometricScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F9FAFB' },
  container: {
    flex: 1,
    padding: RFValue(20),
    justifyContent: 'flex-start',
  },
  header: {
    marginBottom: RFValue(30),
  },
  headerTitle: {
    fontSize: RFValue(22),
    fontWeight: 'bold',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: RFValue(14),
    color: '#6B7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: RFValue(16),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#222',
  },
  cardSubtitle: {
    fontSize: RFValue(12),
    color: '#6B7280',
    marginTop: 2,
    maxWidth: RFValue(220),
  },
  footer: {
    marginTop: RFValue(30),
  },
  footerText: {
    fontSize: RFValue(12),
    color: '#9CA3AF',
  },
  backButton: {
    marginTop: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: RFValue(14),
    color: '#45B1E8',
    marginLeft: 6,
    fontWeight: '600',
  },
});
