import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useGetPolicyQuery } from '../../../redux.toolkit/rtk/apis';
import Icon from 'react-native-vector-icons/Ionicons';


const { width } = Dimensions.get('window');

const TermsPrivacyScreen: React.FC = () => {

  const {data: Policy, isLoading, isError, refetch} = useGetPolicyQuery([]);

  const renderedPolicySections = useMemo(() => {
  return Policy?.data.map((section: any, index: number) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  ));
}, [Policy?.data]);

  

  if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.message}>Loading city car centers...</Text>
        </View>
      );
    }
  
    if (isError) {
      return (
        <View style={styles.centered}>
          <Icon name="alert-circle" size={40} color="red" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.message}>
            We couldn’t load the car centers. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Terms & Privacy Policy</Text>
      <Text style={styles.subHeader}>Last updated: June 23, 2025</Text>

      {renderedPolicySections}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingHorizontal: width * 0.05,
    paddingTop: RFValue(30),
    paddingBottom: RFValue(40),
  },
  header: {
    fontSize: RFValue(24),
    fontWeight: '600',
    marginBottom: RFValue(6),
    fontFamily: 'bold',
    color: '#000',
  },
  subHeader: {
    fontSize: RFValue(13),
    color: '#888',
    marginBottom: RFValue(20),
    fontFamily: 'demiBold',
  },
  section: {
    marginBottom: RFValue(22),
  },
  sectionTitle: {
    fontSize: RFValue(18),
    fontWeight: '900',
    marginBottom: RFValue(6),
    color: '#111',
    fontFamily: 'bold',
  },
  sectionContent: {
    fontSize: RFValue(13),
    color: '#707070',
    lineHeight: RFValue(20),
    fontFamily: 'medium',
  },
    centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
    color: 'red',
    fontFamily: 'bold',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontFamily: 'medium',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'demiBold',
  },
});

export default TermsPrivacyScreen;
