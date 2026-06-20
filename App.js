import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';

const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';
const DADOS_RECIFE_URL = 'https://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=bab62397-be40-436a-bc9c-fe7c7bacc0c6&limit=15';

const Tab = createBottomTabNavigator();

// =========================================================================
// 🔑 TELA DE LOGIN INTEGRADA (Nativa no App.js)
// =========================================================================
function LoginScreen({ onLogin }) {
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

// =========================================================================
// TELA 1: PONTOS DE COLETA (Consome API + GPS + Envio de Check-in + Logout)
// =========================================================================
function EcoestacoesScreen({ usuarioLogado, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [locais, setLocais] = useState([]);

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
        if (currentLocation && currentLocation.coords) {
          latitude = currentLocation.coords.latitude;
          longitude = currentLocation.coords.longitude;
        }
      }
    } catch (gpsError) {
      console.log("Usando localização padrão:", gpsError);
    }

    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuarioLogado, 
          userLatitude: latitude,
          userLongitude: longitude,
          ecoestacaoNome: item.endereco || 'Ponto sem endereço', 
          ecoestacaoBairro: item.bairro || 'Recife'
        })
      });

      if (response.ok) {
        Alert.alert('Sucesso!', `${usuarioLogado}, seu check-in foi salvo no ponto: ${item.bairro}`);
      } else {
        Alert.alert('Erro', 'O servidor backend rejeitou o salvamento.');
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
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeBadgeRow}>
          <Text style={styles.welcomeText}>👤 Conectado como: <Text style={{fontWeight: 'bold'}}>{usuarioLogado}</Text></Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>🚪 Sair</Text>
        </TouchableOpacity>
      </View>

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
// TELA 2: HISTÓRICO (Lista os check-ins normalmente sem apagar)
// =========================================================================
function HistoricoScreen({ usuarioLogado }) {
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoadingHistorico(true);

      // 🔄 Apenas faz o GET para buscar e renderizar o histórico na tela
      fetch(BACKEND_URL)
        .then((response) => response.json())
        .then(async (data) => {
          const historicoComEndereco = await Promise.all(
            data.map(async (item) => {
              try {
                let resultado = await Location.reverseGeocodeAsync({
                  latitude: Number(item.userLatitude),
                  longitude: Number(item.userLongitude),
                });
                if (resultado && resultado.length > 0) {
                  const local = resultado[0];
                  item.enderecoFormatado = `${local.street || 'Rua não identificada'}, ${local.streetNumber || 'S/N'} - ${local.district || ''}`;
                } else {
                  item.enderecoFormatado = 'Endereço não localizado pelo GPS';
                }
              } catch (e) {
                item.enderecoFormatado = `Lat: ${item.userLatitude} | Lon: ${item.userLongitude}`;
              }
              return item;
            })
          );
          setHistorico(historicoComEndereco);
          setLoadingHistorico(false);
        })
        .catch((err) => {
          console.log("Erro ao buscar histórico:", err);
          setLoadingHistorico(false);
        });
    }, [])
  );

  if (loadingHistorico) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008000" />
        <Text style={{ marginTop: 10 }}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.welcomeBadge, { backgroundColor: '#e2f0d9', borderColor: '#008000' }]}>
        <Text style={[styles.welcomeText, { color: '#008000', fontWeight: '600' }]}>📋 Histórico de de visitas: {usuarioLogado}</Text>
      </View>

      {historico.length === 0 ? (
        <View style={styles.center}>
          <Text>Nenhum check-in registrado neste histórico.</Text>
        </View>
      ) : (
        <FlatList
          data={historico}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.cardHistorico}>
              <Text style={styles.titleHistorico}>Local: {item.ecoestacaoNome}</Text>
              <Text style={styles.text}>Bairro do Ponto: {item.ecoestacaoBairro}</Text>
              <Text style={[styles.text, { fontWeight: '600', color: '#555' }]}>👤 Por: {item.usuario || usuarioLogado}</Text>
              
              <Text style={[styles.text, { fontWeight: 'bold', color: '#008000', marginTop: 4 }]}>
                📍 Onde estava: {item.enderecoFormatado}
              </Text>
              <Text style={styles.date}>{new Date(item.timestamp).toLocaleString('pt-BR')}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

// =========================================================================
// 🚀 ORQUESTRADOR PRINCIPAL NATIVO BLINDADO (Gerencia o Logout + DELETE)
// =========================================================================
export default function App() {
  const [usuario, setUsuario] = useState(null);

  // 🚪 Função unificada que limpa o banco e volta para o login
  const handleLogoutDoUsuario = async () => {
    try {
      // 🧹 Envia o comando DELETE para esvaziar o JSON do backend
      await fetch(BACKEND_URL, { method: 'DELETE' });
    } catch (e) {
      console.log("Erro ao limpar banco no logout, mas deslogando assim mesmo:", e);
    }
    // 👤 Desloga o usuário e volta para a tela de login
    setUsuario(null);
  };

  if (!usuario) {
    return <LoginScreen onLogin={(nome) => setUsuario(nome)} />;
  }

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
        <Tab.Screen name="Ecoestações" options={{ title: 'Pontos de Coleta' }}>
          {() => <EcoestacoesScreen usuarioLogado={usuario} onLogout={handleLogoutDoUsuario} />}
        </Tab.Screen>
        
        <Tab.Screen name="Histórico" options={{ title: 'Histórico de Visitas' }}>
          {() => <HistoricoScreen usuarioLogado={usuario} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  welcomeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  welcomeBadgeRow: { backgroundColor: '#fff', padding: 10, borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0', flex: 1, marginRight: 8, elevation: 1 },
  welcomeBadge: { backgroundColor: '#fff', padding: 10, borderRadius: 6, marginBottom: 12, borderWidth: 1, borderColor: '#e0e0e0', elevation: 1 },
  welcomeText: { fontSize: 13, color: '#008000', textAlign: 'center' },
  logoutButton: { backgroundColor: '#d9534f', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 6, elevation: 1, justifyContent: 'center', alignItems: 'center' },
  logoutButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
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