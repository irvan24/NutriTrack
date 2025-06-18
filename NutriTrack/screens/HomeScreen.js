import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Image
} from 'react-native';

const { width } = Dimensions.get('window');

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    dates.push(`${month} ${day}`);
  }
  return dates;
};
const dates = generateDates();
const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];
const mealSearchTerms = {
  Breakfast: 'oatmeal',
  Lunch: 'caesar salad',
  Dinner: 'grilled salmon'
};

export default function HomeScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedMeal, setSelectedMeal] = useState(mealTypes[0]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFoods = async () => {
      setLoading(true);
      try {
        const query = mealSearchTerms[selectedMeal];
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
          query
        )}&search_simple=1&action=process&json=1&page_size=10`;
        const response = await fetch(url);
        const data = await response.json();
        const items = (data.products || []).map((p, idx) => ({
          id: p.code || `${selectedMeal}_${idx}`,
          name: p.product_name || 'Unknown',
          calories: p.nutriments?.energy_100g
            ? Math.round(p.nutriments.energy_100g / 4.184)
            : 0,
          protein: Math.round(p.nutriments?.proteins_100g || 0),
          carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
          fat: Math.round(p.nutriments?.fat_100g || 0),
          unit: '100g',
          image: p.image_front_small_url || p.image_thumb_url || null
        }));
        setFoods(items);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, [selectedMeal]);

  const renderDate = (date, index) => {
    const isActive = date === selectedDate;
    const isToday = index === 0;
    return (
      <TouchableOpacity
        key={date}
        onPress={() => setSelectedDate(date)}
        style={[styles.dateItem, isActive && styles.dateItemActive, isToday && styles.todayItem]}
      >
        <Text style={[styles.dateText, isActive && styles.dateTextActive]}>
          {isToday ? 'Today' : date}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderMealType = (type) => {
    const isActive = type === selectedMeal;
    return (
      <TouchableOpacity
        key={type}
        onPress={() => setSelectedMeal(type)}
        style={[styles.mealItem, isActive && styles.mealItemActive]}
      >
        <Text style={[styles.mealText, isActive && styles.mealTextActive]}>
          {type}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFoodCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('NutritionCard', { food: item, date: selectedDate, meal: selectedMeal })}
    >
      <View style={styles.cardLeft}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.foodImage} />
        ) : (
          <View style={styles.foodPlaceholder} />
        )}
      </View>
      <View style={styles.cardCenter}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={styles.cardInfoRow}>
          <Text style={styles.flame}>🔥 {item.calories} kcal</Text>
          <Text style={styles.unit}> • {item.unit}</Text>
        </View>
        <View style={styles.macrosRow}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: '#4CAF50' }]}>{item.protein}g</Text>
            <Text style={styles.macroLabel}>Protein</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: '#FFC107' }]}>{item.carbs}g</Text>
            <Text style={styles.macroLabel}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: '#9C27B0' }]}>{item.fat}g</Text>
            <Text style={styles.macroLabel}>Fat</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Text style={styles.moreText}>⋯</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
       <View style={styles.headerRow}>
      <Text style={styles.headerTitle}>Daily Nutritions</Text>
      <View style={styles.headerIcons}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() =>
            navigation.navigate('SummaryScreen', { selectedDate, selectedMeal })
          }
        >
          <Text style={styles.iconText}>📊</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate('AiChat')}
        >
          <Text style={styles.iconText}>📋</Text>
        </TouchableOpacity>
      </View>
    </View>

      <View style={styles.mealTypesRow}>{mealTypes.map(renderMealType)}</View>

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 40 }} color="#FF7043" />
      ) : (
        <FlatList
          data={foods}
          keyExtractor={(item) => item.id}
          renderItem={renderFoodCard}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('addMeal', { selectedDate, selectedMeal })}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingTop: 50, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  historyBtn: { backgroundColor: '#FFF', borderRadius: 12, padding: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 2 },
  iconText: { fontSize: 18 },
  datesScroll: { marginBottom: 16, maxHeight: 32 },
  datesContent: { paddingVertical: 2 },
  dateItem: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#FFF', borderRadius: 8, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  dateItemActive: { backgroundColor: '#FF7043' },
  todayItem: { borderWidth: 1, borderColor: '#FF7043' },
  dateText: { fontSize: 12, color: '#555' },
  dateTextActive: { color: '#FFF', fontWeight: '600' },
  mealTypesRow: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 2 },
  mealItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  mealItemActive: { backgroundColor: '#FFF', borderBottomWidth: 2, borderBottomColor: '#FF7043' },
  mealText: { fontSize: 14, color: '#555' },
  mealTextActive: { color: '#000', fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3.84, elevation: 2 },
  cardLeft: { marginRight: 16, width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  foodImage: { width: 48, height: 48, borderRadius: 24 },
  foodPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EEE' },
  cardCenter: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  cardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  flame: { fontSize: 12, color: '#FF5722' },
  unit: { fontSize: 12, color: '#888' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 4 },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: 14, fontWeight: '600' },
  macroLabel: { fontSize: 10, color: '#888', marginTop: 2 },
  moreButton: { marginLeft: 12, padding: 8 },
  moreText: { fontSize: 18, color: '#999' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF7043',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: { color: '#FFF', fontSize: 32, lineHeight: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  headerIcons: {
    flexDirection: 'row'
  },
  iconBtn: {
    marginLeft: 12,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 8,
    // ombre…
  },
  iconText: {
    fontSize: 18
  },
});
