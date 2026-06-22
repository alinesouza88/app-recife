import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles';

export default function LoginScreen({ onLogin }) {
  const [inputNome, setInputNome] = useState('');

  const handleAcessar = () => {
    if (inputNome.trim() === '') {
      Alert.alert('Atenção', 'Por favor, insira seu nome.');
      return;
    }

    onLogin(inputNome.trim());
  };

  return (
    <View style={styles.loginContainer}>
      <View style={styles.loginCard}>
        <Text style={{ fontSize: 38, textAlign: 'center' }}>♻️</Text>

        <Text style={styles.loginTitle}>EcoRecife</Text>

        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          Digite seu nome para acessar
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex: Aline Souza"
          value={inputNome}
          onChangeText={setInputNome}
        />

        <TouchableOpacity style={styles.button} onPress={handleAcessar}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}