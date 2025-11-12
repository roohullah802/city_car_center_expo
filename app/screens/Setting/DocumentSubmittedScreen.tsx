import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { RFValue } from 'react-native-responsive-fontsize';

const { width } = Dimensions.get('window');

const DocumentsSubmittedScreen: React.FC = () => {
  const router = useRouter();

  const handleGoHome = useCallback(() => {
    router.push('/(tabs)/Home');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require('../../../assests/uploadSuccess.jpeg')}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Center Title */}
        <Text style={styles.title}>
          Documents Submitted!
        </Text>

        {/* Center Message */}
        <Text style={styles.message}>
          Your documents have been uploaded successfully and are waiting for admin approval.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleGoHome}>
          <Text style={styles.buttonText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DocumentsSubmittedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.05,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: RFValue(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: RFValue(120),
    height: RFValue(120),
    marginBottom: RFValue(20),
  },
  title: {
    fontSize: RFValue(20),
    fontFamily: 'bold',
    color: '#10B981',
    marginBottom: RFValue(10),
    textAlign: 'center',
  },
  message: {
    fontSize: RFValue(14),
    fontFamily: 'medium',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: RFValue(20),
    width: '90%',
  },
  button: {
    backgroundColor: '#45B1E8',
    paddingVertical: RFValue(12),
    paddingHorizontal: RFValue(25),
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontFamily: 'bold',
  },
});
