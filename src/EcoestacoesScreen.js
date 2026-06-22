import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import styles from '../styles'; 

const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';
const DADOS_RECIFE_URL =
  'https://dados.recife.pe.gov.br/api/3/action/datastore_search?resource_id=bab62397-be40-436a-bc9c-fe7c7bacc0c6&limit=15';

export default function EcoestacoesScreen({ usuarioLogado, onLogout }) {
  const [loading, setLoading] = useState(true);
  const [locais, setLocais] = useState([]);

  useEffect(() => {
    fetch(DADOS_RECIFE_URL)
      .then((res) => res.json())
      .then((json) => {
        if (json?.result?.records) {
          setLocais(json.result.records);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCheckIn = async (item) => {
    let latitude = -8.05;
    let longitude = -34.88;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getLastKnownPositionAsync({});
        
        if (!loc) {
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
        }

        if (loc) {
          latitude = loc.coords.latitude;
          longitude = loc.coords.longitude;
        }
      }
    } catch (e) {
      console.log('Erro ao obter GPS rápido:', e);
    }

    // Monta o endereço completo que será enviado e salvo no banco de dados
    const enderecoCompletoEstacao = `${item.endereco || item.localizacao || 'Sem endereço'} - ${item.bairro || 'Recife'}, Recife - PE`;

    try {
      console.log('Enviando check-in...');
      
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: usuarioLogado,
          userLatitude: latitude,
          userLongitude: longitude,
          ecoestacaoNome: enderecoCompletoEstacao, // 🚀 Envia o endereço completo montado
          ecoestacaoBairro: item.bairro || 'Não informado'
        })
      });

      if (response.ok) {
        Alert.alert('Sucesso 🎉', `Check-in realizado com sucesso em: ${item.bairro}!`);
      } else {
        Alert.alert('Erro', 'O servidor recusou o check-in.');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Falha de Rede ❌', 'Não foi possível conectar ao servidor backend.');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text>👤 {usuarioLogado}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={locais}
        keyExtractor={(item, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>📍 Bairro: {item.bairro || 'Não Informado'}</Text>
            
            {/* 🗺️ Exibição do Endereço Completo no Card da Estação */}
            <Text style={[styles.text, { marginVertical: 6 }]}>
              <Text style={{ fontWeight: 'bold' }}>Endereço Completo:</Text>{' '}
              {`${item.endereco || item.localizacao || 'Não informado'} - ${item.bairro || ''}, Recife - PE`}
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 11, color: '#666' }}>
                <Text style={{ fontWeight: 'bold' }}>Lat:</Text> {item.latitude || '-8.05'}
              </Text>
              <Text style={{ fontSize: 11, color: '#666' }}>
                <Text style={{ fontWeight: 'bold' }}>Long:</Text> {item.longitude || '-34.88'}
              </Text>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={() => handleCheckIn(item)}>
              <Text style={styles.buttonText}>Check-in</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}