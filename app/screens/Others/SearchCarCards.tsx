import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import BottomSheetFilterModal from './BottomSheetFilterModel';
import { Modalize } from 'react-native-modalize';
import { useGetCarsQuery } from '../../../redux.toolkit/rtk/apis';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux.toolkit/store';
import { addFavCar, removeFavCar } from '../../../redux.toolkit/slices/userSlice';
import { router } from 'expo-router';

interface Car {
  modelName: string;
  price: number;
  pricePerDay: number;
  images: string[];
  brandImage: string;
  totalReviews: number;
  brand: string;
  _id: string;
}

const SearchCarCards: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 1000]);

  const ref = useRef<Modalize>(null);
  const { data: Cars, isLoading } = useGetCarsQuery([]);

   const favouriteCars = useSelector(
      (state: RootState) => state.user.favouriteCars,
    );
    const dispatch = useDispatch();


   const handleFav = useCallback((item: any)=>{
      const isFav = favouriteCars.some(c => c._id === item._id);
      if (isFav) {
        dispatch(removeFavCar(item._id))
      }else{
        dispatch(addFavCar(item));
      }

   },[favouriteCars, dispatch])

  const filteredCars = useMemo(() => {
    if (!Cars?.data) return [];
    return Cars.data.filter((item: Car) =>
      item.modelName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, Cars?.data]);

  const modalFilteredCars = useMemo(() => {
    if (!filteredCars) return [];
    return filteredCars
      .filter((item: Car) =>
        selectedBrand
          ? item.brand.toLowerCase().includes(selectedBrand.toLowerCase())
          : true
      )
      .filter(
        (item: Car) =>
          item.pricePerDay >= priceRange[0] &&
          item.pricePerDay <= priceRange[1]
      );
  }, [filteredCars, priceRange, selectedBrand]);

  const onClose = () => ref.current?.close();
  const openFilterModal = () => ref.current?.open();

  const renderCarCard = useCallback(
    ({ item }: { item: Car }) =>{ 
      const isFav = favouriteCars.some(c => c._id === item._id);
      return(
      <Pressable
        style={({ pressed }) => [
          styles.cardWrapper,
          pressed && styles.cardPressed,
        ]}
        onPress={() => router.push({pathname:"/screens/Others/CarLeaseDetails", params:{_id: item?._id}})}
      >
        <View style={styles.card}>
          <Image
            source={{ uri: item.images[0] }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.details}>
            <Text style={styles.name} numberOfLines={1}>{item.modelName}</Text>
            <Text style={styles.price} numberOfLines={1}>Price: ${item.pricePerDay}/day</Text>

            <View style={styles.rating}>
              <Icon name="star" size={16} color="#fbbf24" />
              <Text style={styles.ratingText}>
                ({item.totalReviews} Reviews)
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.rentBtn} onPress={()=> router.push({pathname:"/screens/Others/DateAndTime", params:{carId: item?._id}})}>
                <Text style={styles.rentBtnText}>Rent Now</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.heartBtn} onPress={()=> handleFav(item)}>
                <Icon name={isFav ? "heart":"heart-outline"} color='#73C2FB' size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Pressable>
    )},
    [favouriteCars, handleFav]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.message}>Loading city car center...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Icon name="arrow-back" size={24} color='#1F305E' />
        </TouchableOpacity>

        <Text style={styles.title}>Available Cars</Text>

        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={20} color="#999" />
          <TextInput
            placeholder="Search cars..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
          <TouchableOpacity onPress={openFilterModal}>
            <Icon name="options-outline" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {modalFilteredCars.length <= 0 ? (
          <View style={styles.noData}>
            <Icon name="car-sport" size={30} color="#000" />
            <Text style={styles.noDataText}>No Cars Found</Text>
          </View>
        ) : (
          <FlatList
            data={modalFilteredCars}
            keyExtractor={(item) => item._id}
            renderItem={renderCarCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
          />
        )}

        <BottomSheetFilterModal
          key={`modal-${selectedBrand}-${priceRange[1]}`}
          setPriceRange={setPriceRange}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          priceRange={priceRange}
          ref={ref}
          onClose={onClose}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    marginTop: 10,
    marginBottom: 5,
    width: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginVertical: 10,
    color: '#1F305E',
    fontFamily: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    color: '#333',
    fontFamily: 'demiBold',
  },
  cardWrapper: {
    width: '100%',
  },
  cardPressed: {
    opacity: 0.9,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#98817B',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
    height: 130,
    width: '99%',
  },
  image: {
    width: '55%',
    height: '100%',
  },
  details: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F305E',
    fontFamily: 'bold',
  },
  price: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F305E',
    fontFamily: 'bold',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 7,
    color: '#1F305E',
    fontFamily: 'demiBold',
    marginLeft: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  rentBtn: {
    backgroundColor: '#73C2FB',
    width: 90,
    paddingVertical: 7,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentBtnText: {
    fontSize: 10,
    fontFamily: 'demiBold',
    color: 'white',
  },
  heartBtn: {
    padding: 8,
    backgroundColor: '#eef5ff',
    borderRadius: 50,
  },
  noData: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  noDataText: {
    fontFamily: 'demiBold',
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontFamily: 'medium',
  },
  listContainer: {
    paddingBottom: 20,
  },
});

export default SearchCarCards;
