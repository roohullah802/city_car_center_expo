import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  FlatList,
  Dimensions,
  Animated,
  Image,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetCarDetailsQuery } from '../../../redux.toolkit/rtk/apis';
import { RFValue } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../redux.toolkit/store';
import { addFavCar, removeFavCar } from '../../../redux.toolkit/slices/userSlice';
import { router, useLocalSearchParams } from 'expo-router';

const { width, height } = Dimensions.get('window');

const HEADER_HEIGHT_RATIO = 0.38;

// Image Item
const ImageItem: React.FC<{
  item: string;
  index: number;
  HEADER_HEIGHT: number;
}> = ({ item, HEADER_HEIGHT }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={[styles.carImageContainer, { height: HEADER_HEIGHT }]}>
      {(isLoading || hasError) && (
        <Image
          source={require('../../../assests/placeholder.png')}
          style={[styles.carImage, styles.fallbackImage]}
          resizeMode="cover"
        />
      )}

      {!hasError && (
        <Animated.Image
          source={{ uri: item }}
          style={[styles.carImage, isLoading && styles.loadingImage]}
          resizeMode="cover"
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </View>
  );
};

const CarDetails: React.FC= () => {
  const {id} = useLocalSearchParams();
  const { data: Cars, isLoading } = useGetCarDetailsQuery(id);
  const car = Cars?.data;

  const capitalize = (str: string) =>
    str
      .split(' ')
      .map(itm => itm.charAt(0).toUpperCase() + itm.slice(1))
      .join(' ');

  const favouriteCars = useSelector(
    (state: RootState) => state.user.favouriteCars,
  );
  const { isLoggedIn } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [isAct, setIsAct] = useState<boolean>(false);
  const [isShowMoreBtn, setIsShowMoreBtn] = useState<boolean>(false);

  const images = useMemo(() => {
    if (!car?.images) return [];
    if (Array.isArray(car.images)) return car.images;
    if (typeof car.images === 'string') {
      try {
        const parsed = JSON.parse(car.images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [car?.images]);

  const onViewRef = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) setActiveIndex(viewableItems[0].index);
  });

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  const HEADER_HEIGHT = height * HEADER_HEIGHT_RATIO;

  const renderImage = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <Pressable
        onPress={() => router.push({pathname:"/screens/Others/CarImages", params:{id: car?._id}})}
      >
        <ImageItem item={item} index={index} HEADER_HEIGHT={HEADER_HEIGHT} />
      </Pressable>
    ),
    [HEADER_HEIGHT, car],
  );

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

  const isFav = favouriteCars?.some(items => items._id === car?._id);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading car details...</Text>
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Car not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Header with Image Slider */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        {images.length === 0 ? (
          <View style={[styles.carImageContainer, { height: HEADER_HEIGHT }]}>
            <Image
              source={require('../../../assests/placeholder.png')}
              style={styles.carImage}
              resizeMode="cover"
            />
          </View>
        ) : (
          <>
            <FlatList
              data={images}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => index.toString()}
              renderItem={renderImage}
              onViewableItemsChanged={onViewRef.current}
              viewabilityConfig={viewConfigRef.current}
              ref={flatListRef}
              scrollEnabled={true}
            />

            {images.length > 1 && (
              <View style={[styles.dotsContainer, { bottom: 40 }]}>
                {images.map((_: any, index: any) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        opacity: index === activeIndex ? 1 : 0.3,
                        transform: [{ scale: index === activeIndex ? 1.2 : 1 }],
                      },
                    ]}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Overlay Header Icons */}
        <SafeAreaView style={styles.overlayHeader}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.back()}
          >
            <Icon name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleFav(car)}
          >
            <Icon
              name={isFav ? 'heart' : 'heart-outline'}
              size={22}
              color="#fff"
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Scrollable Details Section */}
      <ScrollView
        style={styles.detailsSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.titleRow}>
          <Text style={styles.carTitle} numberOfLines={1}>
            {capitalize(car?.modelName) || 'N/A'}
          </Text>
          <View style={styles.ratingRow}>
            <Icon name="star" size={15} color="#f5a623" />
            <Text style={styles.rating}>({car?.totalReviews || 0})</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>Year</Text>
            <Text style={styles.statsValue}>{car?.year}</Text>
          </View>
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>Mileage</Text>
            <Text style={styles.statsValue}>{car?.allowedMilleage}</Text>
          </View>
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>Transmission</Text>
            <Text style={styles.statsValue}>{car?.transmission}</Text>
          </View>
          <View style={styles.statsCol}>
            <Text style={styles.statsLabel}>Fuel</Text>
            <Text style={styles.statsValue}>{car?.fuelType}</Text>
          </View>
        </View>

        {/* Details */}
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.detailsBox}>
          <View style={styles.detailsLeft}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Brand</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Car</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Color</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Doors</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>PricePerDay</Text>
            </View>
            <View style={[styles.priceRow, styles.noBorder]}>
              <Text style={styles.priceLabel}>Weekly Rate</Text>
            </View>
          </View>

          <View style={styles.detailsRight}>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{capitalize(car?.brand)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>
                {capitalize(car?.modelName)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{car?.color}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{car?.doors}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceValue}>{car?.pricePerDay}</Text>
            </View>
            <View style={[styles.priceRow, styles.noBorder]}>
              <Text style={styles.priceValue}>{car?.weeklyRate}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text
            style={styles.descriptionText}
            numberOfLines={isAct ? undefined : 2}
            onTextLayout={e => {
              if (e.nativeEvent.lines.length > 2) {
                setIsShowMoreBtn(true);
              }
            }}
          >
            {car?.description}
          </Text>

          {isShowMoreBtn && (
            <TouchableOpacity onPress={() => setIsAct(!isAct)}>
              <Text style={styles.showMoreBtn}>
                {isAct ? 'Less' : 'show more'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Features */}
        <Text style={styles.featuresTitle}>Features</Text>
        <View style={styles.featuresRow}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconWrapper}>
              <MaterialIcon name="chair-rolling" size={25} color="#1F305E" />
            </View>
            <Text style={styles.featureLabel}>Total Capacity</Text>
            <Text style={styles.featureValue}>{car?.passengers} seats</Text>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIconWrapper}>
              <MaterialIcon name="speedometer" size={25} color="#1F305E" />
            </View>
            <Text style={styles.featureLabel}>High Speed</Text>
            <Text style={styles.featureValue}>{car?.topSpeed} KM/H</Text>
          </View>
          <View style={styles.featureCard}>
            <View style={styles.featureIconWrapper}>
              <MaterialIcon
                name="car-shift-pattern"
                size={25}
                color="#1F305E"
              />
            </View>
            <Text style={styles.featureLabel}>Car Type</Text>
            <Text style={styles.featureValue}>{car?.transmission}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.footerPriceLabel}>Price: </Text>
          <Text style={styles.price}>${car?.pricePerDay}/day</Text>
        </View>

        <TouchableOpacity
          style={styles.buyBtn}
          onPress={() => {
            if (!isLoggedIn) {
              router.push("/screens/Auth/SocialAuth")
            } else {
              router.push({pathname:"/screens/Others/DateAndTime", params:{carId: car?._id}})
            }
          }}
        >
          <Text style={styles.buyText}>Rent Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CarDetails;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', fontFamily: 'demiBold' },

  header: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    position: 'relative',
  },
  carImageContainer: {
    width,
    position: 'relative',
  },
  carImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fallbackImage: { zIndex: 1 },
  loadingImage: { opacity: 0 },

  overlayHeader: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
    zIndex: 21,
  },

  detailsSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollContent: { paddingBottom: 40 },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  carTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F305E',
    fontFamily: 'bold',
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  rating: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1F305E',
    fontFamily: 'demiBold',
  },

  statsRow: {
    width: '100%',
    height: 80,
    backgroundColor: '#e7e8ebff',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 10,
  },
  statsCol: { alignItems: 'center', gap: 8 },
  statsLabel: {
    color: 'black',
    fontSize: 10,
    fontFamily: 'demiBold',
  },
  statsValue: {
    color: 'black',
    fontFamily: 'demiBold',
    fontSize: 11,
  },

  sectionTitle: {
    fontFamily: 'bold',
    fontSize: RFValue(12),
    marginTop: RFValue(10),
    marginBottom: RFValue(10),
    color: '#1F305E',
  },
  detailsBox: {
    borderWidth: 0.5,
    borderColor: 'gray',
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 10,
  },
  detailsLeft: { backgroundColor: '#e7e8ebff', width: '35%' },
  detailsRight: { width: '65%' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: RFValue(10),
    borderBottomWidth: 0.5,
    borderColor: 'black',
    paddingBottom: 5,
  },
  priceLabel: {
    width: '100%',
    fontSize: RFValue(10),
    fontFamily: 'demiBold',
    color: 'black',
    marginLeft: 10,
    marginRight: 10,
  },
  priceValue: {
    width: '55%',
    fontSize: RFValue(10),
    fontFamily: 'demiBold',
    color: 'black',
    marginLeft: 10,
  },
  noBorder: { borderBottomWidth: 0 },

  descriptionTitle: {
    color: '#1F305E',
    marginTop: 20,
    fontFamily: 'bold',
  },
  descriptionText: {
    color: 'black',
    fontFamily: 'medium',
    fontSize: 12,
    marginTop: 10,
  },
  showMoreBtn: {
    color: '#73C2FB',
    fontFamily: 'demiBold',
    fontSize: 12,
    position: 'absolute',
    right: 0,
  },

  featuresTitle: {
    fontFamily: 'bold',
    color: '#1F305E',
    marginTop: 20,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginBottom: 50,
  },
  featureCard: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 20,
    margin: 5,
    backgroundColor: '#eef5ff',
    gap: 5,
    borderRadius: 10,
  },
  featureIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: '#FEFEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F305E',
    fontFamily: 'bold',
  },
  featureLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 3,
    fontFamily: 'demiBold',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -10,
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'white',
    width: '100%',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 20,
    paddingRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  footerPriceLabel: {
    color: '#1F305E',
    marginTop: 15,
    fontSize: 10,
  },
  price: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1F305E',
    fontFamily: 'bold',
  },
  buyBtn: {
    backgroundColor: '#73C2FB',
    paddingVertical: 12,
    paddingHorizontal: 80,
    borderRadius: 30,
  },
  buyText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'demiBold',
  },

  dotsContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
    zIndex: 20,
  },
  dot: {
    width: 13,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#fff',
    margin: 2,
  },
});
