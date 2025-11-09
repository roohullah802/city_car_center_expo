import React from 'react';
import {
  Image,
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

interface Props {
  item: {
    brandImage: [string]
    brand: string;
  };
  size?: number;
  router: any;
}

const { width } = Dimensions.get('window');
const NUM_COLUMNS = 4;
const CARD_MARGIN = 12;
const CARD_SIZE = (width - CARD_MARGIN * 2 * NUM_COLUMNS - 32) / NUM_COLUMNS;

const BrandCard: React.FC<Props> = React.memo(
  ({ item, router, size = CARD_SIZE }) => {
    
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({pathname:"/screens/Others/CarCardsByBrand", params:{brand: item?.brand}})
        }
      >
        <View
          style={[
            styles.card,
            { width: size, height: size, margin: CARD_MARGIN },
          ]}
        >
          <Image
            source={{ uri: item?.brandImage[0] as unknown as string }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#F6F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '70%',
    height: '70%',
    borderRadius: 15,
  },
});

BrandCard.displayName = 'BrandCard';

export default BrandCard;
