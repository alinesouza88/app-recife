import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

export default function LoginScreen({ onLogin }) {
  const [inputNome, setInputNome] = useState('');

  const handleAcessar = () => {
    if (inputNome.trim() === '') {
      Alert.alert('Atenção', 'Por favor, insira seu nome para acessar o aplicativo.');
      return;
    }
    onLogin(inputNome.trim());
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eef5ed', padding: 20 }}>
      <View style={{ width: '100%', maxWidth: 340, backgroundColor: '#fff', padding: 25, borderRadius: 12, elevation: 4 }}>
        <Text style={{ fontSize: 38, textAlign: 'center', marginBottom: 10 }}>♻️</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#008000', textAlign: 'center', marginBottom: 4 }}>EcoRecife</Text>
        <Text style={{ fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 20 }}>Insira seu nome para acessar o aplicativo:</Text>
        
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#444', marginBottom: 6 }}>Seu Nome:</Text>
        <TextInput
          style={{ height: 44, backgroundColor: '#f9f9f9', borderRadius: 6, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ccc', fontSize: 16, color: '#333', marginBottom: 20 }}
          placeholder="Ex: Aline Souza"
          placeholderTextColor="#999"
          value={inputNome}
          onChangeText={setInputNome}
        />

        <TouchableOpacity 
          style={{ backgroundColor: '#008000', paddingVertical: 12, borderRadius: 6, alignItems: 'center' }} 
          onPress={handleAcessar}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Entrar no Aplicativo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}