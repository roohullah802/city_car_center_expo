import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Modalize } from 'react-native-modalize';
import Slider from '@react-native-community/slider';
import { useGetBrandsQuery } from '../../../redux.toolkit/rtk/apis';



interface FilterModalProps {
  onClose: () => void;
  priceRange: [number, number];
  setPriceRange: React.Dispatch<React.SetStateAction<[number, number]>>
  setSelectedBrand: React.Dispatch<React.SetStateAction<string | null>>
  selectedBrand: string | null;
  
}


const BottomSheetFilterModal = React.memo(forwardRef<Modalize, FilterModalProps>(
  ({ onClose, setPriceRange, setSelectedBrand, selectedBrand, priceRange }, ref) => {
    const [localPrice, setLocalPrice] = useState<[number, number]>(priceRange);
    const [localBrand, setLocalBrand] = useState<string | null>(selectedBrand);

    const { data: Brands, isLoading } = useGetBrandsQuery(undefined);
    
    

    useEffect(() => {
      setLocalBrand(selectedBrand);
      setLocalPrice(priceRange);
    }, [selectedBrand, priceRange]);

    const handleApplyFilters = useCallback(() => {
      setSelectedBrand(localBrand);
      setPriceRange(localPrice);
      onClose();
    }, [localBrand, localPrice,onClose, setPriceRange, setSelectedBrand]);

    const clearFilter = () => {
      setLocalBrand(null);
      setSelectedBrand(null);
      setPriceRange([1,1000]);
      setLocalPrice([1, 1000]);
    };

    return (
      <Modalize ref={ref} adjustToContentHeight modalStyle={styles.modal}>
        <ScrollView style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={clearFilter}>
              <Text style={styles.clearText}>Clear filter</Text>
            </TouchableOpacity>
          </View>

          {/* Brand */}
          <Text style={styles.label}>Price Range</Text>
          <View style={styles.sliderRow}>
            <Text style={styles.sliderValue}>${localPrice[0]}</Text>
            <Text style={styles.sliderValue}>${localPrice[1]}</Text>
          </View>
          <Slider
            style={{ width: '100%' }}
            minimumValue={1}
            maximumValue={1000}
            step={1}
            value={localPrice[1]}
            onValueChange={(value) => setLocalPrice([1, value])}
          />


         

          {/* Price Slider */}
           <Text style={styles.label}>Brand</Text>
          <View style={styles.brandContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="black" />
            ) : (
              Brands?.brands?.map(({ brand }: any) => (
                <TouchableOpacity
                  key={brand}
                  style={[
                    styles.brandButton,
                    localBrand === brand && styles.brandButtonSelected,
                  ]}
                  onPress={() => setLocalBrand(brand)}
                >
                  <Text
                    style={[
                      styles.brandText,
                      localBrand === brand && styles.brandTextSelected,
                    ]}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Apply */}
          <TouchableOpacity style={styles.searchButton} onPress={handleApplyFilters}>
            <Text style={styles.searchButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modalize>
    );
  }
));


const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily:'bold',
  },
  clearText: {
    width: 100,
    color: '#73C2FB',
    fontSize: 14,
    fontFamily:'demiBold'
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
    fontFamily:'demiBold',
    color:'#1F305E'
  },
  brandContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  brandButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#f2f2f2',
    borderRadius: 20,
  },
  brandButtonSelected: {
    backgroundColor: '#000',
  },
  brandText: {
    fontSize: 14,
    color: '#333',
    fontFamily:'demiBold'
  },
  brandTextSelected: {
    color: '#fff',
    fontWeight: '600',
    fontFamily:'demiBold'
  },
  sliderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sliderValue: {
    fontSize: 12,
    color: '#555',
    fontFamily:'demiBold'
  },
  sliderCenterLabel: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
    color: 'gray',
    fontFamily:'demiBold'
  },
  searchButton: {
    backgroundColor: '#73C2FB',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 30,
    marginTop: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    fontFamily:'demiBold'
  },
});

export default BottomSheetFilterModal;
