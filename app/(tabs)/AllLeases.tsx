import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux.toolkit/store';
import { useFocusEffect } from '@react-navigation/native';
import { useGetAllActiveLeasesQuery } from '../../redux.toolkit/rtk/leaseApis';
import { useCountdowns } from '../../timer/leaseTimer';
import {io} from 'socket.io-client';
import { router } from 'expo-router';

const socket = io('https://api.citycarcenters.com');

const AllLeases: React.FC = () => {
  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.user,
  );

  const [refreshing, setRefreshing] = useState(false);
  const [Leases, setLeases] = useState<any[]>([]);

  const {
    data: LeasesData,
    isLoading,
    refetch,
  } = useGetAllActiveLeasesQuery(userData?.id);

  useEffect(() => {
    if (LeasesData?.lease) {
      setLeases(LeasesData?.lease);
    }
  }, [LeasesData]);

  useEffect(() => {
    socket.on('leaseCreated', lease => {
      setLeases(prev => {
        if (!Array.isArray(prev)) return [lease];
        return [lease, ...prev];
      });
    });

    socket.on('leaseExtended', updatedLease => {

      setLeases(prev => prev.filter(l => l._id !== updatedLease._id));
    });

    return () => {
      socket.off('leaseCreated');
      socket.off('leaseExtended');
    };
  }, []);

  const LeasesCountDown = useCountdowns(Leases);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );


  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch().unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const leasesCallBack = useCallback(
    ({ item }: any) => (
      <Pressable
        onPress={() => router.push({pathname:"/screens/Lease/LeaseDetails", params:{id: item?._id}})}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <View style={styles.leaseCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.leaseTitle}>My Lease</Text>
            <TouchableOpacity
              style={styles.extendButton}
              onPress={() =>
                router.push({pathname:"/screens/Lease/ExtendLease", params:{id: item?._id}})
              }
            >
              <Text style={styles.extendText}>Extend Lease</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.leaseModel}>
            {item?.carDetails?.[0]?.modelName}
          </Text>

          {item.countdown && (
            <View style={styles.timerContainer}>
              {[
                { value: item.countdown.days, label: 'day' },
                { value: item.countdown.hours, label: 'hr' },
                { value: item.countdown.minutes, label: 'min' },
                { value: item.countdown.seconds, label: 'sec' },
              ].map((t, index) => (
                <View key={index} style={styles.timerBlock}>
                  <Text style={styles.ti}>{t.value}</Text>
                  <Text style={styles.timerLabel}>{t.label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    ),
    [],
  );

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) {
        router.push("/screens/Auth/SocialAuth")
        return;
      }
    }, [isLoggedIn]),
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.message}>Loading city car centers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'ios' && <View style={styles.statusBarBackground} />}
      <StatusBar backgroundColor="transparent" barStyle="dark-content" />

      {LeasesCountDown?.length === 0 || !isLoggedIn ? (
        <View style={styles.noLeaseContainer}>
          <Text style={styles.noLeaseText}>No lease found!</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <Text style={styles.topText}>Car lease</Text>
          <Text style={styles.topDescription}>
            You have {Leases?.length} car
            {LeasesCountDown?.length > 1 ? 's' : ''} at lease so far
          </Text>

          <FlatList
            data={LeasesCountDown || []}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={leasesCallBack}
            showsVerticalScrollIndicator={false}
            extraData={LeasesCountDown}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default AllLeases;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom: 70,
  },
  statusBarBackground: {
    height: Platform.OS === 'ios' ? 44 : 0,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 30,
  },
  topText: {
    fontSize: 24,
    marginBottom: 4,
    fontFamily: 'bold',
    color: '#1F305E',
  },
  topDescription: {
    color: '#1F305E',
    fontSize: 14,
    marginBottom: 10,
    fontFamily: 'demiBold',
  },
  leaseCard: {
    width: '100%',
    backgroundColor: '#25262A',
    borderRadius: 15,
    padding: 13,
    marginBottom: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaseTitle: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'demiBold',
  },
  leaseModel: {
    color: '#ccc',
    fontSize: 12,
    marginTop: 16,
    fontFamily: 'demiBold',
  },
  extendButton: {
    backgroundColor: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  extendText: {
    fontWeight: '600',
    fontSize: 10,
    fontFamily: 'demiBold',
    color: '#1F305E',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  timerBlock: {
    flex: 1,
    alignItems: 'center',
  },
  ti: {
    color: '#fff',
    fontSize: 30,
    marginTop: 10,
    fontFamily: 'BebasNeue Regular',
  },
  timerLabel: {
    width: 30,
    fontSize: 11,
    color: '#fff',
    marginTop: 4,
    fontFamily: 'demiBold',
    textAlign: 'center',
  },
  noLeaseContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  noLeaseText: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
    fontFamily: 'demiBold',
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
