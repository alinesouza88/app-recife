# 📱 EcoRecife - Aplicativo Mobile (React Native)

O **EcoRecife** é um aplicativo mobile desenvolvido em **React Native** com **Expo** focado em sustentabilidade urbana. Ele consome dados reais da Prefeitura do Recife para mapear pontos de coleta seletiva e gerencia o registro de visitas (check-ins) dos usuários capturando as coordenadas exatas do GPS.

---

## 📋 Critérios de Avaliação Atendidos

* **Interface e Navegação por Abas (React Native):** Telas organizadas e fluidas utilizando o `createBottomTabNavigator` para separar os mapas do histórico.
* **Integração com API Externa (Dados Recife):** Consumo assíncrono direto do portal governamental.
* **Uso de Localização (Hardware GPS):** Captura em tempo real da latitude e longitude do dispositivo móvel através do `expo-location`.
* **Persistência Integrada com Backend:** Fluxo completo de envio (`POST`), leitura (`GET`) e exclusão física (`DELETE`) ao deslogar.

---

## 🛠️ Tecnologias Utilizadas

* **React Native** & **Expo Go**
* **React Navigation / Bottom Tabs** (Navegação por abas)
* **Expo Location** (Acesso nativo ao GPS e Geocodificação Reversa)
* **Fetch API** (Comunicação HTTP assíncrona)

---

## 🔍 Estrutura do Código e Mapeamento de Linhas (`App.js`)

Para facilitar a auditoria do código, os principais blocos e componentes de engenharia de software estão localizados nas seguintes linhas do arquivo principal:

### 1. Troca de Telas por Estado Local (Login Isolda)
* **Linhas 163 a 165:** O aplicativo verifica se o estado `usuario` está vazio (`if (!usuario)`). Se estiver nulo, barra a navegação e renderiza em primeiro plano apenas a tela de identificação (`LoginScreen`). Quando o usuário digita o nome, o React atualiza o estado e chaveia automaticamente para a dashboard interna.

### 2. Integração Assíncrona com API Dados Recife
* **Linhas 53 a 57:** Uso do hook `useEffect` acoplado ao método `fetch(DADOS_RECIFE_URL)`. A busca roda em segundo plano logo na inicialização do app sem travar a interface do usuário. Assim que a promessa é resolvida, os registros alimentam o estado local que renderiza a lista na tela.

### 3. Gerenciamento de Hardware (Sensores de GPS)
* **Linhas 76 a 81:** Localizado dentro do método `handleCheckIn`. A linha 76 dispara a janela nativa pedindo permissão de privacidade para o sistema operacional (`requestForegroundPermissionsAsync`). Com o status concedido, a linha 80 aciona diretamente o chip de GPS do dispositivo (`getCurrentPositionAsync`) para ler o posicionamento geográfico do usuário no momento do check-in.

### 4. Sincronização HTTP POST (Envio ao Servidor)
* **Linhas 89 a 96:** Cria o payload contendo o nome do usuário ativo e as coordenadas coletadas pelo hardware do GPS, disparando uma requisição assíncrona via método `POST` para o endereço do nosso servidor local.

### 5. Mecanismo de Reset de Sessão (Logout Seguro + DELETE)
* **Linhas 152 a 157:** Função `handleLogoutDoUsuario`. Quando o botão "Sair" é pressionado na interface, o aplicativo faz uma chamada usando o verbo HTTP `DELETE` para instruir o backend a esvaziar o histórico em disco rígido por questões de privacidade e, em seguida, redefine o estado do usuário para nulo, forçando o retorno seguro para a tela de login.

---

## 🚀 Como Executar o Projeto Mobile

1. Instale as dependências na raiz do projeto mobile:
   ```bash
   npm install
Certifique-se de configurar o IP correto da sua máquina na linha 7 do App.js:

JavaScript
const BACKEND_URL = 'http://SEU_IP_LOCAL:3000/api/historico';
Inicie o bundler do Metro limpando o cache acumulado:

Bash
npx expo start --clear
Abra o aplicativo Expo Go no celular e escaneie o QR Code gerado no terminal.