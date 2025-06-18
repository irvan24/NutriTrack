import React, { useContext, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Alert
} from 'react-native';
import { MealContext } from '../context/MealContext';

const { width } = Dimensions.get('window');

export default function SummaryScreen({ route, navigation }) {
  const { selectedDate } = route.params;
  const { meals } = useContext(MealContext);

  // State pour objectif calories
  const [goal, setGoal] = useState(2000);

  // Récupère tous les repas du jour
  const dayMeals = meals[selectedDate] || { Breakfast: [], Lunch: [], Dinner: [] };
  const allItems = [...dayMeals.Breakfast, ...dayMeals.Lunch, ...dayMeals.Dinner];

  // Totaux
  const totals = allItems.reduce(
    (acc, f) => ({
      calories: acc.calories + f.calories * (f.quantity || 1),
      protein: acc.protein + f.protein * (f.quantity || 1),
      carbs: acc.carbs + f.carbs * (f.quantity || 1),
      fat: acc.fat + f.fat * (f.quantity || 1)
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const eaten = totals.calories;
  const remaining = Math.max(0, goal - eaten);

  const promptGoal = () => {
    Alert.prompt(
      'Set Calorie Goal',
      'Enter your daily calorie goal:',
      value => {
        const num = parseInt(value, 10);
        if (!isNaN(num) && num > 0) {
          setGoal(num);
        } else {
          Alert.alert('Invalid value', 'Please enter a positive number.');
        }
      },
      'plain-text',
      String(goal),
      'number-pad'
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemCard}
      onPress={() => navigation.navigate('NutritionCard', { food: item, date: selectedDate, meal: item.mealType })}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemThumb} />
      ) : (
        <View style={styles.itemThumbPlaceholder} />
      )}
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.name} x{item.quantity || 1}</Text>
        <Text style={styles.itemValue}>{item.calories * (item.quantity || 1)} kcal</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDate === new Date().toDateString() ? 'Today' : selectedDate}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('addMeal', { selectedDate })}>
            <Text style={styles.addIcon}>＋</Text>
          </TouchableOpacity>
        </View>

        {/* Calories Summary Card */}
        <View style={styles.cardContainer}>
          <Text style={styles.subTitle}>Remaining Calories</Text>
          <Text style={styles.remaining}>{remaining} kcal</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min((eaten / goal) * 100, 100)}%` }]} />
          </View>
          <View style={styles.progressInfoRow}>
            <Text style={styles.eatenText}>{eaten} eaten</Text>
            <View style={styles.goalRow}>
              <Text style={styles.goalText}>{goal} goal</Text>
              <TouchableOpacity onPress={promptGoal} style={styles.editBtn}>
                <Text style={styles.editIcon}>✎</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Macros Row */}
        <View style={styles.macrosContainer}>
          {['Protein', 'Carbs', 'Fat'].map((label, idx) => {
            const value = [totals.protein, totals.carbs, totals.fat][idx];
            return (
              <View key={label} style={styles.macroCard}>
                <Text style={styles.macroLabel}>{label}</Text>
                <Text style={styles.macroValue}>{value}g</Text>
              </View>
            );
          })}
        </View>

        {/* Liste complète des aliments */}
        <Text style={styles.sectionTitle}>All Meals Items</Text>
        {allItems.length === 0 ? (
          <Text style={styles.empty}>No items added</Text>
        ) : (
          <FlatList
            data={allItems.map(item => ({ ...item, mealType: item.mealType || 'Unknown' }))}
            keyExtractor={(i, idx) => `${i.id}_${idx}`}
            renderItem={renderItem}
            scrollEnabled={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backIcon: { fontSize: 28, color: '#FF7043' },
  addIcon: { fontSize: 28, color: '#FF7043' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 28, fontWeight: '700', color: '#333' },
  cardContainer: { backgroundColor: '#FFF5F2', padding: 20, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#FFE0D6' },
  subTitle: { fontSize: 14, color: '#888', marginBottom: 4 },
  remaining: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 12 },
  progressBarBg: { width: '100%', height: 10, backgroundColor: '#EEE', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: 10, backgroundColor: '#FF7043' },
  progressInfoRow: { marginTop: 8 },
  eatenText: { fontSize: 12, color: '#333' },
  goalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' },
  goalText: { fontSize: 12, color: '#333' },
  editBtn: { marginLeft: 8, padding: 4 },
  editIcon: { fontSize: 16, color: '#FF7043' },
  macrosContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  macroCard: { flex: 1, backgroundColor: '#FFF', padding: 12, marginHorizontal: 4, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  macroLabel: { fontSize: 12, color: '#888' },
  macroValue: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 12 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 12, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  itemThumb: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  itemThumbPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEE', marginRight: 12 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, color: '#333' },
  itemValue: { fontSize: 14, color: '#888', marginTop: 4 },
  empty: { textAlign: 'center', color: '#888', marginTop: 32 }
});
