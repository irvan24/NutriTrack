import React, { useState, useContext } from 'react';
import { 
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { MealContext } from '../context/MealContext';

export default function NutritionDetailScreen({ route, navigation }) {
  const { food, date, meal } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const { addMeal } = useContext(MealContext);

  if (!food) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No food data available</Text>
      </SafeAreaView>
    );
  }

  const adjustQuantity = change => {
    const newQuantity = Math.max(0.5, quantity + change);
    setQuantity(Math.round(newQuantity * 2) / 2);
  };

  const getAdjustedValue = value => Math.round(value * quantity);

  const onAddMeal = () => {
    addMeal({ date, type: meal, food: { ...food, calories: getAdjustedValue(food.calories), protein: getAdjustedValue(food.protein), carbs: getAdjustedValue(food.carbs), fat: getAdjustedValue(food.fat) }, quantity });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Back */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Food Info */}
        <View style={styles.mainCard}>
          <View style={styles.foodHeader}>
            <View style={styles.iconContainer}>
              {food.image ? (
                <Image source={{ uri: food.image }} style={styles.foodImageDetail} />
              ) : (
                <Text style={styles.foodIcon}>{food.icon || '🍽️'}</Text>
              )}
            </View>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.baseUnit}>{food.unit} base serving</Text>
            </View>
          </View>

          {/* Quantity */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(-0.5)}>
                <Text style={styles.quantityButtonText}>−</Text>
              </TouchableOpacity>
              <View style={styles.quantityDisplay}>
                <Text style={styles.quantityText}>{quantity}x</Text>
                <Text style={styles.quantityUnit}>( {quantity} × {food.unit} )</Text>
              </View>
              <TouchableOpacity style={styles.quantityButton} onPress={() => adjustQuantity(0.5)}>
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Calories */}
          <View style={styles.caloriesCard}>
            <Text style={styles.caloriesLabel}>Total Calories</Text>
            <Text style={styles.caloriesValue}>🔥 {getAdjustedValue(food.calories)} kcal</Text>
          </View>

          {/* Macros */}
          <View style={styles.macrosSection}>
            <Text style={styles.sectionTitle}>Macronutrients</Text>
            <View style={styles.macrosGrid}>
              {['protein', 'carbs', 'fat'].map((key, idx) => {
                const colors = ['#4CAF50','#FFC107','#9C27B0'];
                const labels = ['Protein','Carbs','Fat'];
                const value = getAdjustedValue(food[key]);
                return (
                  <View style={styles.macroCard} key={key}>
                    <View style={styles.macroHeader}>
                      <View style={[styles.macroIndicator, { backgroundColor: colors[idx] }]} />
                      <Text style={styles.macroLabel}>{labels[idx]}</Text>
                    </View>
                    <Text style={styles.macroValue}>{value}g</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Nutrition Facts */}
          <View style={styles.factsSection}>
            <Text style={styles.sectionTitle}>Nutrition Facts</Text>
            <View style={styles.factsCard}>
              <View style={styles.factRow}>
                <Text style={styles.factLabel}>Serving Size</Text>
                <Text style={styles.factValue}>{food.unit}</Text>
              </View>
              <View style={styles.factRow}>
                <Text style={styles.factLabel}>Servings</Text>
                <Text style={styles.factValue}>{quantity}</Text>
              </View>
              <View style={[styles.factRow, styles.factRowBold]}>
                <Text style={styles.factLabelBold}>Calories per serving</Text>
                <Text style={styles.factValueBold}>{food.calories}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.addButton} onPress={onAddMeal}>
              <Text style={styles.addButtonText}>Add to Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.favoriteButton}>
              <Text style={styles.favoriteText}>⭐ Favorite</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },
  header: { paddingTop: 5, paddingHorizontal: 20, paddingBottom: 10 },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#FF7043', fontWeight: '600' },
  mainCard: { backgroundColor: '#FFF', margin: 20, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  foodHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconContainer: { width: 80, height: 80, backgroundColor: '#F5F5F5', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  foodIcon: { fontSize: 40 },
  foodImageDetail: { width: 80, height: 80, borderRadius: 40 },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 24, fontWeight: '700', color: '#333', marginBottom: 4 },
  baseUnit: { fontSize: 14, color: '#888' },
  quantitySection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 12 },
  quantityControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F8F8', borderRadius: 15, padding: 8 },
  quantityButton: { width: 44, height: 44, backgroundColor: '#FFF', borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  quantityButtonText: { fontSize: 20, fontWeight: '600', color: '#FF7043' },
  quantityDisplay: { alignItems: 'center', marginHorizontal: 32 },
  quantityText: { fontSize: 24, fontWeight: '700', color: '#333' },
  quantityUnit: { fontSize: 12, color: '#888', marginTop: 2 },
  caloriesCard: { backgroundColor: '#FFF5F2', borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#FFE0D6' },
  caloriesLabel: { fontSize: 14, color: '#FF7043', marginBottom: 4 },
  caloriesValue: { fontSize: 28, fontWeight: '700', color: '#FF5722' },
  macrosSection: { marginBottom: 24 },
  macrosGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  macroCard: { flex: 1, backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16, marginHorizontal: 4, alignItems: 'center' },
  macroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  macroIndicator: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  macroLabel: { fontSize: 12, color: '#666' },
  macroValue: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 2 },
  factsSection: { marginBottom: 8 },
  factsCard: { backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16 },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  factRowBold: { borderBottomWidth: 2, borderBottomColor: '#FF7043', marginTop: 8 },
  factLabel: { fontSize: 14, color: '#666' },
  factValue: { fontSize: 14, color: '#333', fontWeight: '500' },
  factLabelBold: { fontSize: 14, color: '#333', fontWeight: '600' },
  factValueBold: { fontSize: 14, color: '#FF7043', fontWeight: '700' },
  actionButtons: { flexDirection: 'row', paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  addButton: { flex: 2, backgroundColor: '#FF7043', borderRadius: 25, paddingVertical: 16, alignItems: 'center' },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  favoriteButton: { flex: 1, backgroundColor: '#FFF', borderRadius: 25, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  favoriteText: { fontSize: 14, color: '#666' }
});
