import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';

// Endereço do seu backend local
const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';

// 🌐 Nova API Real, Ativa e Conectada direto com a Prefeitura de Recife!
const DADOS_RECIFE_URL = 'https://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=bab62397-be40-436a-bc9c-fe7c7bacc0c6&limit=15';

const Tab = createBottomTabNavigator();

function EcoestacoesScreen() {
  const [loading, setLoading] = useState(true);
  const [locais, setLocais] = useState([]);

  // Busca dados dinâmicos da API da Prefeitura
  useEffect(() => {
    fetch(DADOS_RECIFE_URL)
      .then((response) => response.json())
      .then((json) => {
        if (json && json.result && json.result.records) {
          setLocais(json.result.records);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível conectar com o servidor do Dados Recife.');
        setLoading(false);
      });
  }, []);

  const handleCheckIn = async (item) => {
    let latitude = -8.05428; 
    let longitude = -34.8813;

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let currentLocation = await Location.getLastKnownPositionAsync({});
        if (!currentLocation) {
          currentLocation = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest });
        }
        if (currentLocation) {
          latitude = currentLocation.coords.latitude;
          longitude = currentLocation.coords.longitude;
        }
      }
    } catch (e) {
      console.log("Usando localização padrão de Recife.");
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLatitude: latitude,
          userLongitude: longitude,
          ecoestacaoNome: item.endereco, // Usando o campo de endereço como identificador do local
          ecoestacaoBairro: item.bairro
        })
      });

      if (response.ok) {
        Alert.alert('Sucesso!', `Check-in salvo no ponto: ${item.bairro}`);
      } else {
        Alert.alert('Erro', 'O servidor backend rejeitou os dados.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Verifique se o seu backend está ativo.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008000" />
        <Text style={{ marginTop: 10 }}>Buscando pontos no Dados Recife...</Text>
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
            <Text style={styles.title}>Ponto Seletivo: {item.bairro}</Text>
            <Text style={styles.subtitle}>Endereço: {item.endereco}</Text>
            <Text style={styles.text}>Materiais: {item.tiporesiduo}</Text>
            {item.observacao ? <Text style={styles.text}>Obs: {item.observacao}</Text> : null}
            
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
// TELA 2: HISTÓRICO
// =========================================================================
function HistoricoScreen({ navigation }) {
  const [historico, setHistorico] = useState([]);

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
              <Text style={styles.titleHistorico}>Local: {item.ecoestacaoNome}</Text>
              <Text style={styles.text}>Bairro: {item.ecoestacaoBairro}</Text>
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
// NAVEGAÇÃO
// =========================================================================
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#008000', 
          tabBarInactiveTintColor: '#777',
          headerTitleAlign: 'center',
          tabBarIcon: ({ size }) => {
            let iconName = route.name === 'Ecoestações' ? '♻️' : '📜';
            return <Text style={{ fontSize: size }}>iconName</Text>;
          }
        })}
      >
        <Tab.Screen name="Ecoestações" component={EcoestacoesScreen} options={{ title: 'Pontos de Coleta' }} />
        <Tab.Screen name="Histórico" component={HistoricoScreen} options={{ title: 'Histórico de Visitas' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 12, elevation: 2 },
  cardHistorico: { backgroundColor: '#e2f0d9', padding: 15, borderRadius: 8, marginBottom: 12, borderLeftWidth: 5, borderLeftColor: '#008000' },
  title: { fontSize: 17, fontWeight: 'bold', color: '#333' },
  titleHistorico: { fontSize: 15, fontWeight: 'bold', color: '#008000' },
  subtitle: { fontSize: 13, color: '#666', marginVertical: 4, fontWeight: '600' },
  text: { fontSize: 13, color: '#444' },
  date: { fontSize: 11, color: '#777', marginTop: 5, textAlign: 'right' },
  button: { backgroundColor: '#008000', padding: 10, borderRadius: 5, marginTop: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});