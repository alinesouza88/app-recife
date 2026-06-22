import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5'
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // LOGIN
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef5ed'
  },

  loginCard: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3
  },

  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#008000',
    textAlign: 'center',
    marginBottom: 10
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 6
  },

  button: {
    backgroundColor: '#008000',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold'
  },

  // CARDS
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2
  },

  cardHistorico: {
    backgroundColor: '#e2f0d9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#008000'
  },

  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },

  text: {
    fontSize: 13,
    color: '#444'
  },

  date: {
    fontSize: 11,
    color: '#777',
    marginTop: 5,
    textAlign: 'right'
  },

  // HEADER
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },

  logoutButton: {
    backgroundColor: '#d9534f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6
  },

  logoutText: {
    color: '#fff',
    fontWeight: 'bold'
  }
});