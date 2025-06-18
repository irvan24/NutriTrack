import React from 'react';
import { FlatList, Text, View, StyleSheet } from 'react-native';

export default function HistoryList({ data }) {
  if (data.length === 0) return null;
  return (
    <View style={{ flex:1 }}>
      <Text style={s.title}>Historique</Text>
      <FlatList
        data={data}
        keyExtractor={(_,i) => i.toString()}
        renderItem={({ item }) => (
          <View style={s.item}>
            <Text>✔️ {item.name} – {item.calories} kcal</Text>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontSize:18, marginTop:10, marginBottom:5 },
  item: { padding:8, backgroundColor:'#FFF', borderRadius:8, marginBottom:5 }
});
