import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null); // Sử dụng useRef

  const sendMessageToAI = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { sender: "user", text: inputMessage };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "https://api.cohere.ai/v1/generate",
        {
          prompt: inputMessage,
          model: "command",
          max_tokens: 300,
          temperature: 0.3,
          k: 0,
          p: 0.9,
          stop_sequences: ["\n"],
          return_likelihoods: "NONE",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer z8ixT9lmYVtacIVkvneTWekiaxNz96KMC5VMX1vT`, // API Key
          },
        }
      );

      const aiResponse =
        response.data.generations[0].text.trim() || "Sorry, I didn't get that.";
      setMessages((prevMessages) => [...prevMessages, { sender: "ai", text: aiResponse }]);

      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (error) {
      console.error("Error sending message to AI:", error.response?.data || error.message);
      const errorMessage = {
        sender: "ai",
        text: "Unable to connect to AI. Please try again later.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Giao diện khung chat */}
      <FlatList
        ref={flatListRef} // Sử dụng ref từ useRef
        data={messages}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageBubble,
              item.sender === "user" ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
      />

      {/* Input gửi tin nhắn */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={inputMessage}
          onChangeText={setInputMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessageToAI}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatList: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: "flex-end", // Đẩy tin nhắn xuống dưới cùng
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#D1E7DD",
  },
  aiBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#F8D7DA",
  },
  messageText: {
    color: "#000",
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  sendButton: {
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ChatScreen;