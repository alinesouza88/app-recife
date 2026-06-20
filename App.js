import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';

// Importa os dados das ecoestações diretamente do arquivo local que você criou
import dadosLocais from './ecoestacoes.json';

// Endereço do seu backend local (usando o seu IP correto do Wi-Fi)
const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';

const Tab = createBottomTabNavigator();

// =========================================================================
// TELA 1: ECOESTAÇÕES (Dados Locais + GPS + Envio via POST)
// =========================================================================
function EcoestacoesScreen() {
  const [loading, setLoading] = useState(true);
  const [locais, setLocais] = useState([]);

  // Carrega os dados locais instantaneamente sem depender da internet da prefeitura
  useEffect(() => {
    setLocais(dadosLocais);
    setLoading(false);
  }, []);

  // Captura a localização atual via GPS e envia para o seu backend
  const handleCheckIn = async (item) => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos do acesso à geolocalização para realizar o check-in.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = currentLocation.coords;

    // Envia o relacionamento do usuário com o ponto escolhido para o backend
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLatitude: latitude,
          userLongitude: longitude,
          ecoestacaoNome: item.nome,
          ecoestacaoBairro: item.bairro
        })
      });

      if (response.ok) {
        Alert.alert('Sucesso!', `Check-in salvo na estação: ${item.nome}`);
      } else {
        Alert.alert('Erro', 'O servidor rejeitou o salvamento dos dados.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Verifique se o seu backend está ativo e rodando no terminal.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008000" />
        <Text style={{ marginTop: 10 }}>Carregando Ecoestações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={locais}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.nome}</Text>
            <Text style={styles.subtitle}>Bairro: {item.bairro}</Text>
            <Text style={styles.text}>Endereço: {item.localizacao}</Text>
            <Text style={styles.text}>Aceita Reciclável: {item.resíduo_reciclavel}</Text>
            
            <TouchableOpacity style={styles.button} onPress={() => handleCheckIn(item)}>
              <Text style={styles.buttonText}>📍 Registrar Visita / Check-in</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

// =========================================================================
// TELA 2: HISTÓRICO (Consome o seu próprio Backend via GET)
// =========================================================================
function HistoricoScreen({ navigation }) {
  const [historico, setHistorico] = useState([]);

  // Recarrega o histórico do backend local sempre que o usuário focar nesta aba
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetch(BACKEND_URL)
        .then((response) => response.json())
        .then((data) => setHistorico(data))
        .catch((err) => console.log(err));
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {historico.length === 0 ? (
        <View style={styles.center}>
          <Text>Nenhum check-in registrado no histórico.</Text>
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardHistorico}>
              <Text style={styles.titleHistorico}>Estação: {item.ecoestacaoNome}</Text>
              <Text style={styles.text}>Sua Lat: {item.userLatitude}</Text>
              <Text style={styles.text}>Sua Lon: {item.userLongitude}</Text>
              <Text style={styles.date}>{new Date(item.timestamp).toLocaleString('pt-BR')}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// =========================================================================
// NAVEGAÇÃO POR ABAS
// =========================================================================
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#008000', headerTitleAlign: 'center' }}>
        <Tab.Screen name="Ecoestações" component={EcoestacoesScreen} options={{ title: '♻️ Ecoestações' }} />
        <Tab.Screen name="Histórico" component={HistoricoScreen} options={{ title: '📜 Histórico de Visitas' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHistorico: { backgroundColor: '#e2f0d9', padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#008000' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  titleHistorico: { fontSize: 16, fontWeight: 'bold', color: '#008000' },
  subtitle: { fontSize: 14, color: '#666', marginVertical: 4, fontWeight: '600' },
  text: { fontSize: 13, color: '#444' },
  date: { fontSize: 11, color: '#777', marginTop: 5, textAlign: 'right' },
  button: { backgroundColor: '#008000', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});