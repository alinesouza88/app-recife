import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// CAMINHOS CORRIGIDOS: Apontando para os arquivos dentro de src
import LoginScreen from './src/LoginScreen';
import EcoestacoesScreen from './src/EcoestacoesScreen';
import HistoricoScreen from './src/HistoricoScreen';

// IP fixado do seu backend rodando na rede local
const BACKEND_URL = 'http://192.168.1.203:3000/api/historico';

const Tab = createBottomTabNavigator();

export default function App() {
  const [usuario, setUsuario] = useState(null);

  // Função chamada ao clicar em "Sair"
  const handleLogoutDoUsuario = async () => {
    try {
      // 🚀 Dispara a requisição DELETE para esvaziar o database.json no servidor
      await fetch(BACKEND_URL, { method: 'DELETE' });
      console.log('Histórico limpo no servidor com sucesso!');
    } catch (e) {
      console.log('Erro ao limpar backend ao sair:', e);
    }

    // Desloga o usuário no aplicativo e volta para a tela de Login
    setUsuario(null);
  };

  if (!usuario) {
    return <LoginScreen onLogin={(nome) => setUsuario(nome)} />;
  }

  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
        <Tab.Screen name="Ecoestações">
          {() => (
            <EcoestacoesScreen
              usuarioLogado={usuario}
              onLogout={handleLogoutDoUsuario} // Passa a função de logout com limpeza
            />
          )}
        </Tab.Screen>

        <Tab.Screen name="Histórico">
          {() => (
            <HistoricoScreen usuarioLogado={usuario} />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}