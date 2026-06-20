# 📱 App Recife - Ecoestações e Econúcleos

Este é o aplicativo mobile que desenvolvi para a avaliação final da disciplina de Desenvolvimento de App Mobile Individual. A ideia do projeto é ajudar os moradores de Recife a encontrarem pontos de descarte ecológico (Ecoestações e Econúcleos) e conseguirem registrar suas visitas usando o GPS do próprio celular.

---

## 🧑‍💻 Autor
- **Nome Completo:** Aline Souza Silva
- **Status:** Finalizado e rodando direitinho!

---

## 🎯 O que o aplicativo faz?

O app foi feito usando navegação por abas (aqueles botões no menu inferior) e está dividido em duas partes principais:

1. **Aba ♻️ Ecoestações:**
   - Mostra uma lista de vários pontos de coleta espalhados por Recife (bairro, endereço e o que cada local aceita de material reciclável).
   - Tem um botão chamado **📍 Registrar Visita / Check-in**. Quando você clica nele, o app pede permissão para usar o GPS do seu celular, pega a sua latitude e longitude exatas daquele momento e envia esses dados direto para o nosso servidor (backend) para ficarem salvos.

2. **Aba 📜 Histórico de Visitas:**
   - Essa tela puxa os dados do nosso servidor local e mostra na tela todas as visitas que você já registrou, com o nome do lugar, a sua localização por coordenada e o dia/hora certinho que você fez o check-in.

---

## 🚀 Tecnologias que usei

- **React Native** com **Expo** (para conseguir testar direto no meu celular físico)
- **React Navigation (Bottom Tabs)** (para fazer o menu de abas de baixo)
- **Expo Location** (para conseguir ativar e ler o GPS do celular)

---

## 📁 Estrutura de pastas do projeto

```text
app-recife/
├── ecoestacoes.json      # Arquivo local com os dados das estações de Recife
├── App.js                # Arquivo principal onde juntei as duas telas e a lógica do GPS
├── app.json              # Configurações padrões do Expo
├── package.json          # Onde ficam listadas as bibliotecas que instalei
└── README.md             # Esta documentação do projeto