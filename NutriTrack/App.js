// App.js
import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./screens/HomeScreen";
import NutritionCard from "./screens/NutritionCard";
import AddMealScreen from "./screens/addMeal";
import SummaryScreen from "./screens/SummaryScreen";
import AiChat from "./screens/AIChat";
import { MealProvider } from './context/MealContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <MealProvider>

    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="NutritionCard"
          component={NutritionCard}
          initialParams={{ food: null, date: null, meal: null }}
        />
         <Stack.Screen
          name="addMeal"
          component={AddMealScreen}
          initialParams={{ selectedDate: null, selectedMeal: null }}
        />
         <Stack.Screen
          name="SummaryScreen"
          component={SummaryScreen}
          initialParams={{ selectedDate: null, selectedMeal: null }}
        />
          <Stack.Screen
          name="AiChat"
          component={AiChat}
          initialParams={{ selectedDate: null, selectedMeal: null }}
        />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
    </MealProvider>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
});
