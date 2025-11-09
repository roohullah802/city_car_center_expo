import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useGetAllFaqsQuery } from '../../../redux.toolkit/rtk/apis';
import Icon from 'react-native-vector-icons/Ionicons';

interface FAQItem {
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
  _id: string;
}

const FAQScreen: React.FC = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const { data: Faqs, isLoading, isError, refetch } = useGetAllFaqsQuery([]);

  const faqData: FAQItem[] = Faqs?.data || [];

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FAQItem; index: number }) => (
      <View style={styles.card}>
        <TouchableOpacity
          onPress={() => handleToggle(index)}
          style={styles.questionRow}
          activeOpacity={0.7}
        >
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.toggle}>{expandedIndex === index ? '−' : '+'}</Text>
        </TouchableOpacity>
        {expandedIndex === index && <Text style={styles.answer}>{item.answer}</Text>}
      </View>
    ),
    [expandedIndex, handleToggle]
  );

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1F305E" />
          <Text style={styles.message}>Loading FAQs...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centered}>
          <Icon name="alert-circle" size={40} color="red" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.message}>
            We couldn’t load the FAQs. Please try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <Icon name="information-circle-outline" size={40} color="#ccc" />
        <Text style={styles.message}>No FAQs available at the moment.</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>FAQs</Text>
      <Text style={styles.subHeader}>Frequently Asked Questions (FAQs)</Text>

      <FlatList
        data={faqData}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={faqData.length === 0 ? styles.fullHeight : styles.listSpacing}
      />
    </View>
  );
};

export default FAQScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 4,
    fontFamily: 'bold',
    color: '#1F305E',
  },
  subHeader: {
    fontSize: 14,
    color: '#1F305E',
    marginBottom: 20,
    fontFamily: 'demiBold',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    fontFamily: 'demiBold',
    color: '#1F305E',
  },
  toggle: {
    fontSize: 20,
    fontWeight: '500',
    paddingLeft: 10,
    color: '#1F305E',
  },
  answer: {
    marginTop: 10,
    fontSize: 14,
    color: '#555',
    fontFamily: 'medium',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 50,
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
    backgroundColor: '#1F305E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'demiBold',
  },
  fullHeight: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  listSpacing: {
    paddingBottom: 30,
  },
});

