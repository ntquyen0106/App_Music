import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity  } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigation = useNavigation();
  

  const handleLogin = () => {
    const mockAPI = {
      users: [
        {
          id: "1",
          email: "quyen@gmail.com",
          userName: "Thanh Quyen",
          password: "123",
        },
      ],
    };

    const user = mockAPI.users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      setError('');
      navigation.navigate('Tabs');
    } else {
      setError('Email hoặc mật khẩu không chính xác!');
    }
  };
  return (
    <LinearGradient
      colors={['#4e54c8', '#8f94fb']}
      style={styles.container}
    >
      <Text style={styles.title}>Music Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Đăng Nhập</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    color: '#000',
  },
  error: {
    color: '#ff4d4d',
    marginBottom: 15,
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#6a11cb',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;