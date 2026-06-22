import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import styles from '../styles'; 

const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';

export default function HistoricoScreen({ usuarioLogado }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); 

      const carregarHistorico = async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          
          const res = await fetch(BACKEND_URL, { signal: controller.signal });
          clearTimeout(timeoutId); 

          const data = await res.json();

          if (!data || !Array.isArray(data)) {
            if (isMounted) {
              setHistorico([]);
              setLoading(false);
            }
            return;
          }

          const dados = await Promise.all(
            data.map(async (item) => {
              if (status === 'granted' && item.userLatitude && item.userLongitude) {
                try {
                  const geo = await Location.reverseGeocodeAsync({
                    latitude: Number(item.userLatitude),
                    longitude: Number(item.userLongitude),
                  });
                  item.enderecoFormatado = geo[0] 
                    ? `${geo[0].street || 'Rua s/n'}, ${geo[0].district || item.ecoestacaoBairro || ''}`
                    : 'Local não identificado';
                } catch {
                  item.enderecoFormatado = 'Não foi possível obter endereço';
                }
              } else {
                item.enderecoFormatado = 'Sem permissão de GPS';
              }
              return item;
            })
          );

          if (isMounted) {
            setHistorico(dados);
            setLoading(false);
          }
        } catch (error) {
          clearTimeout(timeoutId);
          console.log('Erro ao carregar histórico:', error);
          
          if (isMounted) {
            setLoading(false);
            setHistorico([]); 
            Alert.alert('Erro de Conexão ⚠️', 'O histórico não pôde ser carregado.');
          }
        }
      };

      carregarHistorico();

      return () => {
        isMounted = false;
        controller.abort();
      };
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#008000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={{ marginBottom: 10, fontWeight: 'bold', color: '#333' }}>
        📋 Histórico de {usuarioLogado}
      </Text>

      <FlatList
        data={historico}
        keyExtractor={(item, idx) => idx.toString()}
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>
            Nenhum check-in disponível ou falha ao conectar com o servidor.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.cardHistorico}>
            <Text style={styles.title}>{item.ecoestacaoNome}</Text>
            
            <Text style={styles.text}>
              <Text style={{ fontWeight: 'bold' }}>Bairro:</Text> {item.ecoestacaoBairro}
            </Text>
            
            {/* ✅ CORRIGIDO: Tags JSX devidamente fechadas sem quebras de token */}
            <Text style={styles.text}>
              <Text style={{ fontWeight: 'bold' }}>Sua Localização:</Text> {item.enderecoFormatado || 'Carregando...'}
            </Text>
            
            <Text style={{ fontSize: 11, color: '#666', marginTop: 3 }}>
              📍 Lat: {Number(item.userLatitude).toFixed(4)} | Long: {Number(item.userLongitude).toFixed(4)}
            </Text>
            
            <Text style={styles.date}>
              {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
            </Text>
          </View>
        )}
      />
    </View>
  );
}