import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import BrandCard from '../../../componentss/BrandCard';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetBrandsQuery } from '../../../redux.toolkit/rtk/apis';
import { router } from 'expo-router';

const TopBrandsScreen: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const { data, isLoading, isError } = useGetBrandsQuery([]);
  const brandData = data?.brands;

  const filteredBrands = useMemo(() => {
    if (!brandData || brandData.length <= 0) return [];
    return brandData.filter((brand: any) =>
      brand.brand.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, brandData]);

  const renderBrand = useCallback(
    ({ item }: { item: (typeof brandData)[0] }) => {
      return <BrandCard item={item} router={router} />;
    },
    [],
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
      <StatusBar backgroundColor={'white'} barStyle={'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="arrow-back" size={24} color='#1F305E' />
        </TouchableOpacity>
        <Text style={styles.title}>Top Brands</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Icon name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          placeholder="Search with brand name..."
          value={search}
          onChangeText={setSearch}
          style={styles.input}
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Grid */}
      {!brandData || brandData?.length <= 0 || isError ? (
        <View style={styles.centered}>
          <Text style={{ margin: 20, fontFamily: 'medium' }}>
            No brands available
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBrands}
          numColumns={4}
          keyExtractor={item => item.brand}
          contentContainerStyle={styles.grid}
          renderItem={renderBrand}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F305E',
    fontFamily: 'bold',
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    marginBottom: 16,
    height: 44,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    fontFamily: 'demiBold',
  },
  grid: {
    justifyContent: 'center',
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  noDataText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  noDataSubText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 300,
  },
  titleError: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    fontFamily: 'demiBold',
  },
  location: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    fontFamily: 'medium',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingTextError: {
    marginLeft: 6,
    fontSize: 14,
    color: '#333',
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

export default TopBrandsScreen;
