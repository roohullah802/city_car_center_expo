import React, { useEffect, useState, useMemo } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Image,
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useGetCarDetailsQuery } from '../../../redux.toolkit/rtk/apis';
import { router, useLocalSearchParams } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function CarImages() {
  const {id} = useLocalSearchParams();
  const { data: Cars } = useGetCarDetailsQuery(id);
  const car = Cars?.data;

  const [imageSizes, setImageSizes] = useState<
    { width: number; height: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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

  // fetch image natural sizes
  useEffect(() => {
    if (images.length > 0) {
      Promise.all(
        images.map(
          (uri: string) =>
            new Promise<{ width: number; height: number }>(resolve => {
              Image.getSize(
                uri,
                (w, h) => resolve({ width: w, height: h }),
                () => resolve({ width: screenWidth, height: screenHeight }),
              );
            }),
        ),
      ).then(setImageSizes);
    }
  }, [images]);

  return (
    <View style={{ flex: 1, backgroundColor: '#1B1B1B' }}>
      {/* Close button */}
      <View style={{ marginTop: 50, marginLeft: 20 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icon name="close" color="white" size={30} />
        </TouchableOpacity>
      </View>

      {/* Image carousel */}
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const size = imageSizes[index] || {
            width: screenWidth,
            height: screenHeight,
          };


          return (
            <View
              style={{
                width: screenWidth,
                height: screenHeight,
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: -60,
              }}
            >
              {error ? (
              
                <Image
                  source={require('../../../assests/placeholder.png')}
                  style={{ width: 300, height: 200 }}
                  resizeMode="cover"
                />
              ) : (
                <>
                  {loading && (
                    <ActivityIndicator
                      size="large"
                      color="#73C2FB"
                      style={{ position: 'absolute' }}
                    />
                  )}
                  <Image
                    source={{ uri: item }}
                    style={{
                      width: Math.min(size.width, screenWidth),
                      height: Math.min(size.height, screenHeight),
                    }}
                    resizeMode="contain"
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => {
                      setLoading(false);
                      setError(true);
                    }}
                  />
                </>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

export default CarImages;
