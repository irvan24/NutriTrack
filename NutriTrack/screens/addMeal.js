import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  Image,
  ActivityIndicator
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const tabs = ['All products', 'Meals', 'Created by me'];

export default function AddMealScreen() {
  const { selectedDate, selectedMeal } = useRoute().params || {};
  const navigation = useNavigation();

  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFoods([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          searchQuery
        )}&search_simple=1&action=process&json=1&page_size=20`;
        const res = await fetch(url);
        const json = await res.json();
        const items = (json.products || []).map((p, idx) => ({
          id: p.code || `${idx}`,
          name: p.product_name || 'Unknown',
          calories: p.nutriments?.energy_100g
            ? Math.round(p.nutriments.energy_100g / 4.184)
            : 0,
          protein: p.nutriments?.proteins_100g
            ? Math.round(p.nutriments.proteins_100g)
            : 0,
          carbs: p.nutriments?.carbohydrates_100g
            ? Math.round(p.nutriments.carbohydrates_100g)
            : 0,
          fat: p.nutriments?.fat_100g
            ? Math.round(p.nutriments.fat_100g)
            : 0,
          unit: p.serving_size || '100g',
          image: p.image_front_small_url || p.image_thumb_url || null
        }));
        setFoods(items);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>×</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.searchInput}
        placeholder="Search products..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
    </View>
  );

  const renderTabs = () => (
    <View style={styles.tabs}>
      {tabs.map(tab => {
        const active = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('NutritionCard', {
          food: item,
          date: selectedDate,
          meal: selectedMeal
        })
      }
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.thumb} />
      ) : (
        <View style={styles.thumbPlaceholder} />
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.detail}>{item.calories} kcal • {item.unit}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderTabs()}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color="#FF7043" />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FFF' },
  backBtn: { width: 40, alignItems: 'center' },
  backText: { fontSize: 28, color: '#FF7043' },
  searchInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: '#333'
  },
  tabs: { flexDirection: 'row', backgroundColor: '#FFF', marginTop: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#FF7043' },
  tabText: { color: '#888' },
  tabTextActive: { color: '#333', fontWeight: '600' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  thumb: { width: 60, height: 60 },
  thumbPlaceholder: { width: 60, height: 60, backgroundColor: '#EEE' },
  info: { flex: 1, padding: 12, justifyContent: 'center' },
  name: { fontSize: 16, color: '#333', fontWeight: '500' },
  detail: { fontSize: 12, color: '#888', marginTop: 4 }
});
