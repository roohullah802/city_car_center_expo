import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useStripe } from "@stripe/stripe-react-native";
import { useCreatePaymentIntendMutation } from "../../../redux.toolkit/rtk/payment";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux.toolkit/store";
import { showToast } from "../../../folder/toastService";
import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useDocumentStatusQuery } from "@/redux.toolkit/rtk/apis";
import { useAuth } from "@clerk/clerk-expo";

const DateAndTimeScreen: React.FC = () => {
  const { carId } = useLocalSearchParams<{ carId: string }>();
  const insets = useSafeAreaInsets();

  // State
  const [pickUpDate, setPickUpDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isLoggedIn } = useSelector((state: RootState) => state.user);

  // Stripe
  const [createPaymentIntent] = useCreatePaymentIntendMutation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {isSignedIn} = useAuth();
  const {refetch, isLoading: isLoadingStatus} = useDocumentStatusQuery({}, {skip: !isSignedIn});

  // Return date: 7 days after pick-up
  const returnDate = useMemo(() => {
    const result = new Date(pickUpDate);
    if (isNaN(result.getTime())) return new Date();
    result.setDate(result.getDate() + 7);
    return result;
  }, [pickUpDate]);

  // Handle date change
  const onChangeDate = useCallback(
    (event: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS !== "ios") setShowDatePicker(false);

      let currentDate: Date | undefined;

      if (Platform.OS === "ios") {
        currentDate = selectedDate;
      } else {
        if (event.type === "set" && event.nativeEvent.timestamp) {
          currentDate = new Date(event.nativeEvent.timestamp);
        }
      }

      if (currentDate && !isNaN(currentDate.getTime())) {
        setPickUpDate(currentDate);
      }
    },
    []
  );

  const formattedDate = (date: Date) => {
    if (!date || isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePress = async () => {
    setLoading(true);
    try {
      const docStatus = await refetch();
      
      if (docStatus.data.user.documentStatus === "notVerified") {
        showToast("Please verify your documents to continue.");
        return;
      }
      const validCarId = carId.replace(/"/g, "");
      if (!isLoggedIn) {
        showToast("Please login first");
        setLoading(false);
        return;
      }

      const response = await createPaymentIntent({
        id: validCarId,
        startDate: pickUpDate.toISOString(),
        endDate: returnDate.toISOString(),
      }).unwrap();

      const clientSecret = response?.clientSecret;
      if (!clientSecret) throw new Error("No client secret returned");

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "City Car Center",
        paymentIntentClientSecret: clientSecret,
      });
      if (initError) throw initError;

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) throw presentError;

      router.push("/screens/Payments/PaymentSuccess");
    } catch (error: any) {
      showToast(error?.data?.message || error?.message || "Error Occurred!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          padding: 20,
        }}
      >
        <Text style={styles.title}>Select Rental Dates</Text>

        {/* Pick-up Date */}
        <TouchableOpacity
          style={styles.dateCard}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateLabel}>Pick-up Date</Text>
          <Text style={styles.dateValue}>{formattedDate(pickUpDate)}</Text>
        </TouchableOpacity>

        {/* Return Date */}
        <View style={[styles.dateCard, styles.returnDateCard]}>
          <Text style={styles.dateLabel}>Return Date</Text>
          <Text style={styles.dateValue}>{formattedDate(returnDate)}</Text>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={pickUpDate || new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={onChangeDate}
          />
        )}

        {/* Payment Button */}
        <TouchableOpacity
          style={[styles.payButton, loading && { opacity: 0.7 }]}
          onPress={handlePress}
          disabled={loading || isLoadingStatus}
        >
          {loading || isLoadingStatus ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DateAndTimeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    paddingTop: Platform.OS === "android" ? 20 : 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F305E",
    marginBottom: 30,
  },
  dateCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  returnDateCard: {
    backgroundColor: "#eef5ff",
  },
  dateLabel: {
    fontSize: 14,
    color: "#888",
    marginBottom: 5,
  },
  dateValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F305E",
  },
  payButton: {
    backgroundColor: "#73C2FB",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#73C2FB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
