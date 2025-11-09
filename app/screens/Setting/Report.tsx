import React, { useState, useCallback, useMemo } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { usePostReportIssueMutation } from '../../../redux.toolkit/rtk/apis';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux.toolkit/store';
import { showToast } from '../../../folder/toastService';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

const ReportIssueScreen: React.FC = () => {
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const { userData, isLoggedIn } = useSelector((state: RootState) => state.user);

  const [postReportIssue, { isLoading }] = usePostReportIssueMutation();

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isValid = useMemo(
    () => description.trim().length > 0 && isValidEmail(email),
    [description, email]
  );

  const handleSend = useCallback(async () => {
    if (!isLoggedIn) {
      router.push("/screens/Auth/SocialAuth")
      return;
    }

    if (!isValid) {
      showToast('Please enter a valid email and description.')
      return;
    }

    try {
      const userId = userData?.id;
      const payload = { userId, description, email };
      await postReportIssue(payload).unwrap();
      showToast('Issue reported successfully! Our team will review it shortly.')

      setDescription('');
      setEmail('');
      router.back()
    } catch (error: any) {
      showToast('Failed to report issue')
    }
  }, [description, email, postReportIssue, userData, isLoggedIn, isValid]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Report Issue</Text>
        <Text style={styles.subHeader}>Describe your problem in detail and send to us.</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Describe your problem in detail."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: isValid ? '#73C2FB' : '#ccc' }]}
          onPress={handleSend}
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Send</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ReportIssueScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 20 : 30
  },
  content: {
    paddingHorizontal: width * 0.05,
    paddingTop: RFValue(40),
    paddingBottom: RFValue(30),
  },
  header: {
    fontSize: RFValue(22),
    fontWeight: '600',
    marginBottom: RFValue(8),
    fontFamily: 'bold',
    color: '#3f3f3fff',
  },
  subHeader: {
    fontSize: RFValue(13),
    color: '#3f3f3fff',
    marginBottom: RFValue(20),
    fontFamily: 'medium',
  },
  textArea: {
    height: RFValue(140),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: RFValue(14),
    fontSize: RFValue(13),
    marginBottom: RFValue(16),
    fontFamily: 'regular',
    textAlignVertical: 'top',
  },
  input: {
    height: RFValue(50),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: RFValue(14),
    fontSize: RFValue(13),
    marginBottom: RFValue(24),
    fontFamily: 'regular',
  },
  button: {
    height: RFValue(50),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: RFValue(14),
    fontWeight: '500',
    fontFamily: 'demiBold',
  },
});
