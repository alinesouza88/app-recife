import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';

// Endereço do seu backend local (mantenha o seu IP correto do Wi-Fi)
const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';

// 🌐 API Oficial e ativa conectada direto com o portal Dados Recife
const DADOS_RECIFE_URL = 'https://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=bab62397-be40-436a-bc9c-fe7c7bacc0c6&limit=15';

const Tab = createBottomTabNavigator();

// =========================================================================
// TELA 1: PONTOS DE COLETA (Consome API União Recife + GPS + POST)
// =========================================================================
function EcoestacoesScreen() {
  const [loading, setLoading] = useState(true);
  const [locais, setLocais] = useState([]);

  // Busca os dados em tempo real da Prefeitura de Recife
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

  // Realiza o processo de geolocalização e envia os dados para o Backend
  const handleCheckIn = async (item) => {
    let latitude = -8.05428; // Coordenadas de backup (Recife Centro) caso o GPS falhe dentro de casa
    let longitude = -34.8813;

    try {
      // Pede permissão para acessar a localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Tenta pegar a última posição conhecida (rápido e não trava)
        let currentLocation = await Location.getLastKnownPositionAsync({});
        
        // Se não houver posição recente, tenta ler o sensor de forma rápida
        if (!currentLocation) {
          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Lowest,
          });
        }

        if (currentLocation && currentLocation.coords) {
          latitude = currentLocation.coords.latitude;
          longitude = currentLocation.coords.longitude;
        }
      }
    } catch (gpsError) {
      console.log("Usando localização padrão de teste:", gpsError);
    }

    // Dispara o POST para o seu servidor local
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userLatitude: latitude,
          userLongitude: longitude,
          ecoestacaoNome: item.endereco || 'Ponto sem endereço', 
          ecoestacaoBairro: item.bairro || 'Recife'
        })
      });

      if (response.ok) {
        Alert.alert('Sucesso!', `Check-in salvo no ponto: ${item.bairro}`);
      } else {
        Alert.alert('Erro', 'O servidor backend rejeitou o salvamento dos dados.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro de Conexão', 'Verifique se o seu backend está rodando no terminal.');
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
// TELA 2: HISTÓRICO (Consome seu Backend via GET)
// =========================================================================
function HistoricoScreen({ navigation }) {
  const [historico, setHistorico] = useState([]);

  // Recarrega os registros salvos toda vez que o usuário abre a aba
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
// NAVEGAÇÃO POR ABAS CORRIGIDA (Utiliza Emojis nativos para evitar quebra)
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
            return <Text style={{ fontSize: size }}>{iconName}</Text>;
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