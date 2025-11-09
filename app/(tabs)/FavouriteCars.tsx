import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Animated,
} from 'react-native';
import React, { useCallback, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux.toolkit/store';
import { FlatList } from 'react-native-gesture-handler';
import { addFavCar, removeFavCar } from '../../redux.toolkit/slices/userSlice';
import { router } from 'expo-router';

const FavouriteCars: React.FC = () => {
  const { favouriteCars } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState('');

  const searchAnim = useRef(new Animated.Value(0)).current;

  const handleSearchToggle = () => {
    if (!isSearching) {
      setIsSearching(true);
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      setIsSearching(false);
      setSearchText('');
      Animated.timing(searchAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleFav = useCallback(
    (item: any) => {
      const isFav = favouriteCars?.some(items => items._id === item?._id);
      if (isFav) {
        dispatch(removeFavCar(item._id));
      } else {
        dispatch(addFavCar(item));
      }
    },
    [favouriteCars, dispatch],
  );

  const renderCar = useCallback(
    ({ item }: any) => {
      const isFav = favouriteCars?.some(items => items._id === item?._id);

      return (
        <View style={{ marginTop: 30 }}>
          <Pressable
            style={({ pressed }) => [
              styles.cardWrapper,
              pressed && styles.cardPressed,
            ]}
            onPress={()=> router.push({pathname:"/screens/Others/CarLeaseDetails", params:{id: item?._id}})}
            >
            <View style={styles.card}>
              <Image
                source={{ uri: item?.images?.[0] }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.details}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.modelName}
                </Text>
                <Text style={styles.price} numberOfLines={1}>
                  Price: ${item.pricePerDay}/day
                </Text>

                <View style={styles.rating}>
                  <Icon name="star" size={16} color="#fbbf24" />
                  <Text style={styles.ratingText}>
                    ({item.totalReviews} Reviews)
                  </Text>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.rentBtn}
                    onPress={() =>
                      router.push({pathname:"/screens/Others/DateAndTime", params:{carId:item?._id}})
                    }>
                    <Text style={styles.rentBtnText}>Rent Now</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.heartBtn}
                    onPress={() => handleFav(item)}>
                    <Icon
                      name={isFav ? 'heart' : 'heart-outline'}
                      color="#73C2FB"
                      size={18}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Pressable>
        </View>
      );
    },
    [favouriteCars, handleFav],
  );

  const renderEmptyComponent = () => {
    return (
      <View style={styles.centered}>
        <Icon name="information-circle-outline" size={40} color="#ccc" />
        <Text style={styles.message}>
          No Favourite Cars available at the moment.
        </Text>
      </View>
    );
  };

  // 🔎 Filter cars
  const filteredCars = favouriteCars?.filter(car =>
    car.modelName.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!isSearching ? (
          <>
            {/* Back button */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}>
              <Icon name="chevron-back" size={24} color="#1F305E" />
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.headerText}>Favourite Cars</Text>

            {/* Search button */}
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleSearchToggle}>
              <Icon name="search" size={24} color="#1F305E" />
            </TouchableOpacity>
          </>
        ) : (
          <Animated.View
            style={[
              styles.searchContainer,
              {
                width: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}>
            <TextInput
              placeholder="Search cars..."
              value={searchText}
              onChangeText={setSearchText}
              style={styles.searchInput}
              autoFocus
            />
            <TouchableOpacity onPress={handleSearchToggle}>
              <Icon name="close" size={22} color="#1F305E" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      <FlatList
        data={filteredCars}
        renderItem={renderCar}
        keyExtractor={item => item._id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

export default FavouriteCars;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor:"white"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 60,
    paddingHorizontal: 2,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F305E',
  },
  iconBtn: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 40,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 14,
    fontFamily: 'medium',
    color: '#1F305E',
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
  cardWrapper: {
    width: '100%',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 250,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    fontFamily: 'medium',
  },
});
