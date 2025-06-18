import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. On crée le contexte
export const MealContext = createContext();

// 2. On fournit un provider qui encapsule l'app
export function MealProvider({ children }) {
  // Structure : { 'Jun 18': { Breakfast: [...], Lunch: [...], Dinner: [...] }, ... }
  const [meals, setMeals] = useState({});

  // Au démarrage, on recharge depuis le stockage local
  useEffect(() => {
    AsyncStorage.getItem('meals').then(json => {
      if (json) setMeals(JSON.parse(json));
    });
  }, []);

  // Fonction pour ajouter un repas
  const addMeal = ({ date, type, food, quantity = 1 }) => {
    setMeals(prev => {
      const day = prev[date] || { Breakfast: [], Lunch: [], Dinner: [] };
      const updated = {
        ...prev,
        [date]: {
          ...day,
          [type]: [...day[type], { ...food, quantity }]
        }
      };
      // On persiste la nouvelle liste
      AsyncStorage.setItem('meals', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <MealContext.Provider value={{ meals, addMeal }}>
      {children}
    </MealContext.Provider>
  );
}
