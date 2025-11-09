import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context'
import { useGetAllLeasesQuery } from '../../../redux.toolkit/rtk/leaseApis';
import { router } from 'expo-router';

type LeaseStatus = 'active' | 'expired' | 'upcoming' | 'terminated';

const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString();
};

const statusColor = (s: LeaseStatus) => {
  switch (s) {
    case 'active':
      return '#16a34a';
    case 'expired':
      return '#dc2626';
    case 'upcoming':
      return '#f59e0b';
    default:
      return '#000';
  }
};

export default function LeaseHistoryScreen() {
  const { width } = useWindowDimensions();
  const isTablet = useMemo(() => width >= 768, [width]);

  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: Leases, isLoading } = useGetAllLeasesQuery(undefined);
  const leases = useMemo(()=> Leases?.leases || [],[Leases?.leases]);


 
  const filteredLeases = useMemo(() => {
    if (!query.trim()) return leases;
    return leases.filter((lease: any) => {
      const model = lease.carDetails?.[0]?.modelName?.toLowerCase() ?? '';
      const brand = lease.carDetails?.[0]?.brand?.toLowerCase() ?? '';
      return (
        model.includes(query.toLowerCase()) ||
        brand.includes(query.toLowerCase())
      );
    });
  }, [leases, query]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(cur => (cur === id ? null : id));
  }, []);

  const renderLeaseCard = ({ item }: any) => {
    const expanded = expandedId === item._id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => toggleExpand(item._id)}
        style={[styles.card, isTablet && styles.cardTablet]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.unitText}>
              {item.carDetails?.[0]?.modelName?.charAt(0).toUpperCase() +
                item.carDetails?.[0]?.modelName?.slice(1)}
            </Text>
            <Text style={styles.tenantText}>
              {item.carDetails?.[0]?.brand?.charAt(0).toUpperCase() +
                item.carDetails?.[0]?.brand?.slice(1)}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.rentText}>
              ${item.totalAmount.toLocaleString()}
            </Text>
            <View
              style={[
                styles.statusPill,
                { backgroundColor: statusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.dateRow}>
            <Text style={styles.small}>
              Start: {formatDate(item.startDate)}
            </Text>
            <Text style={styles.small}>End: {formatDate(item.endDate)}</Text>
          </View>

          {expanded && (
            <View style={styles.expandedArea}>
              <Text style={styles.notes}>{item.notes}</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() =>
                    item.status === 'active'
                      ? router.push({pathname:"/screens/Lease/ExtendLease", params:{id: item?._id}})
                      : item.status === 'expired'
                      ? router.push({pathname:"/screens/Others/DateAndTime", params:{carId: item.car}})
                      : ''
                  }
                >
                  <Text style={styles.primaryBtnText}>
                    {item?.status === 'active'
                      ? 'Extend'
                      : item?.status === 'expired'
                      ? 'Renew'
                      : 'No action'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() =>
                    router.push({pathname:"/screens/Lease/LeaseDetails", params:{id: item._id}})
                  }
                >
                  <Text style={styles.secondaryBtnText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const numColumns = isTablet ? 2 : 1;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Lease History</Text>
          <Text style={styles.subtitle}>
            Track and manage all lease agreements
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search leases by car model or brand"
              placeholderTextColor={'#6b7280'}
              style={styles.searchInput}
              returnKeyType="search"
            />
            <TouchableOpacity style={styles.searchBtn}>
              <Text style={styles.searchBtnText}>Go</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listWrap}>
          {isLoading ? (
            <View style={styles.centered}>
              <Text style={styles.loadingText}>Loading leases...</Text>
            </View>
          ) : filteredLeases.length === 0 ? (
            <View style={styles.centered}>
              <Text style={styles.loadingText}>
                {query ? 'No leases found for your search.' : 'No leases available.'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLeases}
              keyExtractor={item => item._id}
              renderItem={renderLeaseCard}
              numColumns={numColumns}
              columnWrapperStyle={
                isTablet ? { justifyContent: 'space-between' } : undefined
              }
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f9fafb' },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 20 : 30,
  },
  header: { marginBottom: 20 },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3f3f3fff',
    fontFamily: 'bold',
  },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  searchSection: { marginBottom: 16 },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 12, paddingVertical: 6 },
  searchBtn: {
    marginLeft: 8,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchBtnText: { color: '#fff', fontWeight: '600', fontFamily:'bold' },

  listWrap: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 10, color: '#6b7280', fontFamily:'demiBold' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTablet: { marginHorizontal: 6, minWidth: '48%' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  unitText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3f3f3fff',
    fontFamily: 'bold',
  },
  tenantText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'demiBold',
  },
  metaCol: { alignItems: 'flex-end' },
  rentText: { fontWeight: '700', fontSize: 15, color: '#3f3f3fff' },
  statusPill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  cardBody: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 8 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  small: { fontSize: 13, color: '#3f3f3fff', fontFamily: 'demiBold' },
  expandedArea: { marginTop: 12 },
  notes: { fontSize: 13, color: '#374151', marginBottom: 12 },

  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  primaryBtn: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '600' },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  secondaryBtnText: { color: '#111827', fontWeight: '600' },

  footer: { paddingVertical: 16, alignItems: 'center' },
  footerText: { color: '#6b7280' },
});
