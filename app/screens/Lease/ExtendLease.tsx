import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePaymentIntentForExtendLeaseMutation } from '../../../redux.toolkit/rtk/payment';
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { router, useLocalSearchParams } from 'expo-router';

type RateOption = {
  label: string;
  subLabel: string;
  value: number;
  type: 'daily' | 'weekly' | 'monthly';
};

const ExtendLeaseScreen: React.FC = () => {
  const {id} = useLocalSearchParams();
  const [selectedRate, setSelectedRate] = useState<RateOption | null>(null);
  const [manualDays, setManualDays] = useState<string>('1');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [paymentIntentForExtendLease] =
    usePaymentIntentForExtendLeaseMutation();

  const rateOptions: RateOption[] = useMemo(
    () => [
      { label: 'Daily Rate', subLabel: '(+20%)', value: 44.4, type: 'daily' },
      { label: 'Weekly Rate', subLabel: '', value: 295.0, type: 'weekly' },
      {
        label: 'Monthly Rate',
        subLabel: '(-15%)',
        value: 880.6,
        type: 'monthly',
      },
    ],
    [],
  );

  const handleSelectRate = useCallback((option: RateOption) => {
    setSelectedRate(option);
  }, []);

  const handleManualInput = useCallback((text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    setManualDays(numericValue);
    setSelectedRate(null);
  }, []);

  const handleContinue = useCallback(async () => {
    const days = Number(manualDays);
    setIsLoading(true);
    try {
      const response = await paymentIntentForExtendLease({
        id: id,
        additionalDays: days,
      }).unwrap();
      

      const clientSecret = response?.clientSecret;
      if (!clientSecret) throw new Error('No client secret returned');

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'City Car Center',
        paymentIntentClientSecret: clientSecret,
      });
      if (initError) throw initError;

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw presentError;
      router.push("/screens/Payments/PaymentSuccess")
    } catch (error: any) {
    } finally {
      setIsLoading(false);
    }
  }, [manualDays, id, paymentIntentForExtendLease]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCon}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.header}>Extend Lease</Text>
        </View>
        <Text style={styles.subHeader}>
          Choose how much days you want to extend the lease of the car
        </Text>

        <Text style={styles.sectionTitle}>Default Days with Rate</Text>

        <View style={styles.rateOptions}>
          {rateOptions.map(option => {
            const isSelected = selectedRate?.type === option.type;
            return (
              <TouchableOpacity
                key={option.type}
                style={[styles.rateCard, isSelected && styles.selectedRateCard]}
                onPress={() => handleSelectRate(option)}
              >
                <Text style={styles.rateLabel}>
                  {option.label} {option.subLabel}
                </Text>
                <Text style={styles.rateValue}>{option.value.toFixed(2)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Or enter your days manually</Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={manualDays}
            onChangeText={handleManualInput}
            placeholder="Enter number of days"
            placeholderTextColor="#aaa"
          />
          <Text style={styles.daySuffix}>- Days</Text>
        </View>

        <TouchableOpacity
          disabled={isLoading}
          style={styles.button}
          onPress={handleContinue}
        >
          {isLoading ? (
            <ActivityIndicator size={'small'} color={'white'} />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  headerCon: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : 10,
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  header: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#002A32',
    fontFamily: 'bold',
  },
  subHeader: {
    fontSize: 13,
    color: '#444',
    marginBottom: 25,
    marginTop: 10,
    fontFamily: 'demiBold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111',
    fontFamily: 'demiBold',
  },
  rateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  rateCard: {
    flex: 1,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRateCard: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  rateLabel: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'demiBold',
  },
  rateValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'demiBold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 30,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'demiBold',
  },
  daySuffix: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#73C2FB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'demiBold',
  },
});

export default ExtendLeaseScreen;
