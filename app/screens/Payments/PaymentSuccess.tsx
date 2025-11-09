import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Animatable from 'react-native-animatable';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

const scaleFont = (size: number) => {
  const scale = width / 375;
  return Math.round(size * scale);
};


const PaymentSuccessScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Animated Circle + Checkmark */}
      <Animatable.View
        animation="bounceIn"
        duration={1200}
        style={styles.iconContainer}
      >
        <Animatable.Text
          animation="zoomIn"
          delay={400}
          style={styles.checkmark}
        >
          ✓
        </Animatable.Text>
      </Animatable.View>

      <Text style={styles.title}>Payment Successful!</Text>
      <Text style={styles.subtitle}>
        You’re all set — your lease has been processed and confirmed. Our team is getting everything ready for your scheduled pick-up.
      </Text>

      <View style={styles.detailsContainer}></View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.push("/(tabs)/Home")}
        activeOpacity={0.7}
      >
        <Text style={styles.homeButtonText}>Go to home page</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.timerButton}
        onPress={() => router.push("/(tabs)/AllLeases")}
        activeOpacity={0.7}
      >
        <Text style={styles.timerButtonText}>View Lease Timer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop:50,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: height,
  },
  iconContainer: {
    backgroundColor: '#50d05c',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkmark: {
    color: 'white',
    fontSize: scaleFont(48),
    fontWeight: 'bold',
  },
  title: {
    fontSize: scaleFont(22),
    fontWeight: '700',
    color: '#004466',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'bold',
  },
  subtitle: {
    fontSize: scaleFont(16),
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
    fontFamily: 'demiBold',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 32,
  },
  homeButton: {
    backgroundColor: '#73C2FB',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    marginBottom: 16,
  },
  homeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontFamily: 'demiBold',
  },
  timerButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
  },
  timerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: scaleFont(16),
    textAlign: 'center',
    fontFamily: 'demiBold',
  },
});

export default PaymentSuccessScreen;
