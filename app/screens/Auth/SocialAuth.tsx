// src/screens/Auth/SocialAuthScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context'
import { useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Modalize } from 'react-native-modalize';
import { router } from 'expo-router';
import { showToast } from '../../../folder/toastService';
import {
  setToken,
  setLoggedIn,
  continueAsGuest,
} from '../../../redux.toolkit/slices/userSlice';
import SignInWithGoogle from './SignInWithGoogle';
import SignInWithApple from './SignInWithApple';

export default function SocialAuthScreen() {
  const { width, height } = useWindowDimensions();
  const dispatch = useDispatch();
  const modelRef = useRef<Modalize>(null);
  const [showBiometric, setShowBiometric] = useState(false);

  // Check if biometric login is available
  useEffect(() => {
    const checkBiometric = async () => {
      const token = await AsyncStorage.getItem('token');
      const biometric = await AsyncStorage.getItem('userBiometric');
      setShowBiometric(!!token && biometric === 'true');
    };
    checkBiometric();
  }, []);

  const isTablet = Math.min(width, height) >= 600;
  const logoTop = (height / 896) * (isTablet ? 80 : 60);
  const buttonHeight = Math.max(52, (height / 896) * (isTablet ? 68 : 56));

  // ------------------ Biometric Login ------------------
  const handleBiometricLogin = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
    const { available } = await rnBiometrics.isSensorAvailable();
    if (!available) return showToast('Biometric authentication not available');

    const { success } = await rnBiometrics.simplePrompt({
      promptMessage: 'Login with Face ID / Touch ID',
    });
    if (!success) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) return showToast('Please login first via Google or Apple.');

    dispatch(setToken(token));
    dispatch(setLoggedIn(true));
    router.push('/(tabs)/Home');
  };

  // ------------------ Guest Login ------------------
  const handleGuest = useCallback(() => {
    dispatch(continueAsGuest());
    router.push('/(tabs)/Home');
  }, [dispatch]);


  

  const openModel = useCallback(() => modelRef.current?.open(), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.container, { paddingHorizontal: 20 }]}>
        <View style={[styles.header, { marginTop: logoTop }]}>
          <Text style={styles.title}>
            <Text style={styles.titleBold}>Smart Solutions{'\n'}For Your Car Needs {'\n'}</Text>
            <Text style={styles.titleAccent}>City Car Center</Text>
          </Text>
        </View>

        <View style={styles.buttonsWrap}>
          <SignInWithGoogle />
          <SignInWithApple />
          {showBiometric && <SocialButton label="Login with Face ID / Touch ID" icon={require('../../../assests/face.png')} onPress={handleBiometricLogin} height={buttonHeight} />}
          <SocialButton label="Continue as Guest" icon={require('../../../assests/guest3.png')} onPress={handleGuest} height={buttonHeight} />
        </View>

        <TouchableOpacity accessibilityRole="link" onPress={openModel} style={styles.whyWrap} activeOpacity={0.7}>
          <Text style={styles.whyText}>Why do I have to sign in?</Text>
        </TouchableOpacity>
      </View>

      <Modalize ref={modelRef} handleStyle={{ backgroundColor: '#73C2FB' }} modalStyle={{ padding: 30 }} modalHeight={300}>
        <View style={styles.modalContent}>
          <Text style={styles.modalText}>
            Signing in helps uniquely identify who you are. This ensures that your data—like favorites, rental history, and payment info—is securely tied to your account only.
          </Text>
        </View>
      </Modalize>
    </SafeAreaView>
  );
}

type SocialButtonProps = { label: string; icon: any; onPress?: () => void; height?: number };
function SocialButton({ label, icon, onPress, height = 56 }: SocialButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={[styles.button, { height }]}>
      <View style={styles.iconWrap}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.labelWrap}>
        <Text style={styles.buttonLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? 50 : 0 },
  container: { flex: 1, justifyContent: 'flex-start' },
  header: { alignSelf: 'stretch', marginBottom: 24 },
  title: { color: '#222', fontWeight: '400' },
  titleBold: { color: '#222', fontWeight: '700', fontSize: 25 },
  titleAccent: { color: '#00AEEF', fontWeight: '700', fontSize: 25 },
  buttonsWrap: { marginTop: 20, gap: 8 },
  button: { flexDirection: 'row', alignItems: 'center', borderRadius: 5, paddingHorizontal: 14, borderWidth: 0.2, borderColor: 'gray', marginBottom: 12 },
  iconWrap: { width: 48, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 28, height: 28 },
  labelWrap: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', paddingLeft: 6 },
  buttonLabel: { color: '#222', fontWeight: '600', letterSpacing: -0.6, fontSize: 12 },
  whyWrap: { marginTop: 40, alignSelf: 'center' },
  whyText: { textDecorationLine: 'underline', color: '#9aa0a6', fontWeight: '600', fontSize: 12 },
  modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalText: { fontSize: 18, color: '#1F305E', fontWeight: 'bold', textAlign: 'center', fontFamily: 'demiBold' },
});
