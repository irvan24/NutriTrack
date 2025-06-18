// src/screens/ChatScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
//import { OPENAI_API_KEY } from '@env';
import Constants from 'expo-constants';


export default function ChatScreen({ navigation }) {
  // Prompt système pour guider l'IA
  const OPENAI_API_KEY = Constants.expoConfig.extra.OPENAI_API_KEY;

  const systemPrompt =
    "Tu es NutriBot, un assistant nutritionnel amical et précis. Aide l'utilisateur à atteindre ses objectifs caloriques, suggère des repas et répond clairement aux questions liées à la nutrition.";

  const [messages, setMessages] = useState([
    { id: "system", text: systemPrompt, from: "system" },
    {
      id: "1",
      text: "Salut ! Je suis NutriBot, comment puis-je t'aider aujourd'hui ?",
      from: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const sendMessage = async () => {
    if (!input.trim()) return;
    // if (!OPENAI_API_KEY) {
    //   Alert.alert(
    //     "Erreur",
    //     "Clé OpenAI manquante : vérifie tes variables d’environnement."
    //   );
    //   return;
    // }
    const userMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      from: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Prépare l'historique pour l'IA, en excluant le message système de l'affichage
      const chatHistory = messages
        .filter((m) => m.from !== "system")
        .map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatHistory,
            { role: "user", content: userMsg.text },
          ],
        }),
      });

      const data = await res.json();
      const botText = data.choices[0].message.content.trim();
      const botMsg = {
        id: Date.now().toString() + "_bot",
        text: botText,
        from: "bot",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        id: Date.now().toString() + "_err",
        text: "Désolé, la réponse n’a pas pu arriver.",
        from: "bot",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.from === "user" ? styles.userBubble : styles.botBubble,
      ]}
    >
      <Text style={item.from === "user" ? styles.userText : styles.botText}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.appBarIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>NutriBot</Text>
        <View style={styles.appBarSpacer} />
      </View>

      {/* Chat List */}
      <FlatList
        data={messages.filter((m) => m.from !== "system")}
        keyExtractor={(m) => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.chatList}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF7043" />
        </View>
      )}

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Écris un message…"
          placeholderTextColor="#AAA"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>→</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#EEE",
  },
  appBarIcon: { fontSize: 24, color: "#FF7043" },
  appBarTitle: { fontSize: 20, fontWeight: "700", color: "#333" },
  appBarSpacer: { width: 24 },
  chatList: { padding: 20, paddingBottom: 80 },
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  userBubble: {
    backgroundColor: "#FF7043",
    alignSelf: "flex-end",
    borderBottomRightRadius: 0,
  },
  botBubble: {
    backgroundColor: "#F1F1F1",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 0,
  },
  userText: { color: "#FFF", fontSize: 16 },
  botText: { color: "#333", fontSize: 16 },
  inputRow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 16,
    color: "#333",
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#FF7043",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "#FFF", fontSize: 18 },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
});
