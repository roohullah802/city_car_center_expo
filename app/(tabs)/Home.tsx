import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux.toolkit/store";
import {
  useGetBrandsQuery,
  useGetCarsQuery,
} from "../../redux.toolkit/rtk/apis";

import { useGetCurrentLocation } from "../../folder/getAddress";
import { addFavCar, removeFavCar } from "../../redux.toolkit/slices/userSlice";
import { io } from "socket.io-client";
import { Modalize } from "react-native-modalize";
import { router } from "expo-router";

const socket = io("https://api.citycarcenters.com");
const { width } = Dimensions.get("window");

const HomeScreen: React.FC = () => {
  const capitalize = (str: string) =>
    str
      .split(" ")
      .map((itm) => itm.charAt(0).toUpperCase() + itm.slice(1))
      .join(" ");

  const [refreshing, setRefreshing] = useState(false);
  const [carListData, setCarListData] = useState<any[]>([]);
  const [brandsListData, setBrandListData] = useState<any[]>([]);

  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const modalRef = useRef<Modalize>(null);

  const { isLoggedIn, userData } = useSelector(
    (state: RootState) => state.user
  );

  const location = useGetCurrentLocation();

  const {
    data: Cars,
    isLoading,
    isError,
    refetch: refetchCars,
  } = useGetCarsQuery({});

  const {
    data: Brands,
    isLoading: isLoadingBrands,
    isError: isErrorBrands,
    refetch: refetchBrands,
  } = useGetBrandsQuery({});

  const favouriteCars = useSelector(
    (state: RootState) => state.user.favouriteCars
  );

  const carList = useMemo(() => Cars?.data || [], [Cars]);
  const brandList = useMemo(() => Brands?.brands || [], [Brands]);

  /**  Update car list */
  useEffect(() => {
    setCarListData(carList);
  }, [carList]);

  /**  Update brand list */
  useEffect(() => {
    setBrandListData(brandList);
  }, [brandList]);

  /**  SOCKET listeners */
  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket connected", socket.id);
    });

    socket.on("carAdded", (car) => {
      setCarListData((prev) => [car, ...prev]);
    });

    socket.on("brandAdded", (brand) => {
      setBrandListData((prev) => [...prev, brand]);
    });

    return () => {
      socket.off("carAdded");
      socket.off("brandAdded");
    };
  }, []);

  /**  FAV button handler */
  const handleFav = useCallback(
    (item: any) => {
      const isFav = favouriteCars?.some((items) => items._id === item?._id);
      if (isFav) {
        dispatch(removeFavCar(item._id));
      } else {
        dispatch(addFavCar(item));
      }
    },
    [favouriteCars, dispatch]
  );

  /**  Render Brand */
  const renderBrand = useCallback(({ item }: any) => {
    const brandImage =
      item?.brandImage?.[0] ??
      "https://cdn-icons-png.flaticon.com/512/273/273452.png";

    return (
      <Pressable
        onPress={() =>
          router.push({
            pathname: "/screens/Others/CarCardsByBrand",
            params: { brand: item.brand },
          })
        }
      >
        <View style={styles.brandIconContainer}>
          <Image
            source={{ uri: brandImage }}
            style={styles.brandIcon}
            resizeMode="contain"
          />
        </View>
      </Pressable>
    );
  }, []);

  /**  Render Car */
  const renderCar = useCallback(
    ({ item }: any) => {
      const isFav = favouriteCars?.some((items) => items._id === item?._id);
      const carImage =
        item?.images?.[0] ??
        "https://cdn-icons-png.flaticon.com/512/833/833276.png";

      return (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/screens/Others/CarLeaseDetails",
              params: { id: item?._id },
            })
          }
        >
          <View style={styles.carCard}>
            <Image
              source={{ uri: carImage }}
              style={styles.carImage}
              resizeMode="cover"
            />
            <Text  numberOfLines={1} style={styles.carName}>{capitalize(item.modelName)}</Text>

            <View style={styles.carFooter}>
              <Text style={styles.carPrice}>${item.pricePerDay}/day</Text>

              <TouchableOpacity
                style={styles.leaseButton}
                onPress={() => {
                  if (!isLoggedIn) {
                    router.push("/screens/Auth/SocialAuth");
                  } else {
                    router.push({
                      pathname: "/screens/Others/DateAndTime",
                      params: { carId: item?._id },
                    });
                  }
                }}
              >
                <Text style={styles.leaseButtonText}>Rent Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.favoriteIcon}>
              <TouchableOpacity onPress={() => handleFav(item)}>
                <Icon
                  name={isFav ? "heart" : "heart-outline"}
                  color="#73C2FB"
                  size={26}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      );
    },
    [favouriteCars, isLoggedIn, handleFav]
  );

  /**  Pull-to-refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchCars(), refetchBrands()]);
    setRefreshing(false);
  }, [refetchBrands, refetchCars]);

  const openProfileModal = () => {
    modalRef.current?.open();
  };

  // LOADING UI
  if (isLoading || isLoadingBrands) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#73C2FB" />
        <Text style={{ marginTop: 10, color: "#1F305E" }}>Loading...</Text>
      </View>
    );
  }

  // ERROR UI
  if (isError || isErrorBrands) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={{ color: "red", marginBottom: 10 }}>
          Something went wrong.
        </Text>
        <TouchableOpacity
          onPress={() => onRefresh()}
          style={{
            backgroundColor: "#73C2FB",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // MAIN UI

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 30 },
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          {isLoggedIn ? (
            <View>
              <Text style={styles.locationLabel}>Location</Text>
              <Text style={styles.locationValue} numberOfLines={1}>
                {location || "Fetching location..."}
              </Text>
            </View>
          ) : (
            <Text style={styles.guest}>Guest</Text>
          )}

          <TouchableOpacity onPress={openProfileModal}>
            <Image
              source={
                userData?.profile
                  ? { uri: userData.profile }
                  : require("../../assests/guest3.png")
              }
              style={styles.profileImage}
            />
          </TouchableOpacity>
        </View>

        {/* SEARCH */}
        <Text style={styles.title}>
          Find your ideal ride in just a few clicks{"\n"}
          <Text style={styles.boldText}>quick, easy, and reliable</Text>
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/screens/Others/SearchCarCards")}
          activeOpacity={0.5}
          style={styles.searchBarContainer}
        >
          <Text style={[styles.searchInput, { color: "#E5E4E2" }]}>Search</Text>
          <Icon
            name="search"
            size={18}
            color="#999"
            style={styles.searchIcon}
          />
        </TouchableOpacity>

        {/* BRANDS */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Brands</Text>
            <TouchableOpacity
              onPress={() => router.push("/screens/Others/BrandCards")}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={brandsListData}
            renderItem={renderBrand}
            keyExtractor={(item) => item?.brand}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>

        {/* CARS */}
        <View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Near You</Text>
            <TouchableOpacity
              onPress={() => router.push("/screens/Others/SearchCarCards")}
            >
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={carListData}
            renderItem={renderCar}
            keyExtractor={(item) => item?._id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          />
        </View>
      </ScrollView>

      {/* PROFILE MODAL */}
      <Modalize
        ref={modalRef}
        adjustToContentHeight
        handleStyle={{ backgroundColor: "#73C2FB" }}
        modalStyle={{ padding: 30 }}
      >
        <View style={styles.modalContent}>
          <Image
            source={
              userData?.profile
                ? { uri: userData.profile }
                : require("../../assests/guest3.png")
            }
            style={styles.modalProfileImage}
          />
          <Text style={styles.modalName}>{userData?.name || "No Name"}</Text>
          <Text style={styles.modalEmail}>{userData?.email || "No Email"}</Text>
        </View>
      </Modalize>
    </>
  );
};

export default HomeScreen;

// STYLES (UNCHANGED EXCEPT SMALL FIXES)
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? 20 : 30
  },

  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  locationLabel: {
    fontSize: 11,
    color: "#3f3f3fff",
    fontFamily: 'bold',
  },

  locationValue: {
    fontSize: 10,
    fontWeight: "600",
    color: "gray",
    fontFamily: 'demiBold',
    width: 230,
  },

  guest: {
    fontFamily: 'bold',
    fontSize: 20,
    color: "#3f3f3fff",
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  title: {
    paddingHorizontal: 16,
    fontSize: 14,
    marginTop: 20,
    color: "#3f3f3fff",
    fontFamily: 'bold',
  },

  boldText: {
    fontWeight: "bold",
  },

  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    paddingHorizontal: 10,
    borderWidth: 0.3,
    borderColor: "#C0C0C0",
    padding: 3,
  },

  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: "#333",
  },

  searchIcon: {
    marginLeft: 10,
    fontSize: 25,
    color: "#E5E4E2",
  },

  sectionHeader: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'bold',
    color: "#3f3f3fff",
  },

  seeAll: {
    fontSize: 12,
    color: "#73C2FB",
    fontFamily: 'demiBold',
  },

  brandIconContainer: {
    width: 65,
    height: 70,
    borderRadius: 10,
    borderWidth: 0.3,
    borderColor: "#C0C0C0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 10,
  },

  brandIcon: {
    width: 45,
    height: 45,
  },

  carCard: {
    width: width * 0.62,
    marginRight: 16,
    backgroundColor: "#eef5ff",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 55,
    paddingBottom: 10,
  },

  carImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  carName: {
    fontSize: 15,
    marginTop: 10,
    fontFamily: 'bold',
    color: "#3f3f3fff",
    marginLeft: 10,
    marginRight:10,
    marginBottom: 20
  },

  carFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  carPrice: {
    fontSize: 11,
    color: "#3f3f3fff",
    fontFamily: 'demiBold',
  },

  leaseButton: {
    backgroundColor: "#73C2FB",
    paddingHorizontal: 20,
    paddingVertical: 17,
    borderRadius: 8,
  },

  leaseButtonText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
  },

  favoriteIcon: {
    position: "absolute",
    top: 20,
    right: 10,
  },

  horizontalList: {
    paddingHorizontal: 16,
  },

  modalContent: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 100,
  },

  modalProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
  },

  modalName: {
    fontSize: 16,
    fontFamily: 'bold',
    color: "black",
    marginBottom: 5,
  },

  modalEmail: {
    fontSize: 14,
    color: "gray",
    fontFamily: 'demiBold',
  },
});
