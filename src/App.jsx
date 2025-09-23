import './App.css';
import Login from './components/Login';

function App() {
  // Dejamos que el componente Login ocupe todo el espacio de #root
  // para que los estilos de centrado de App.css funcionen.
  return (
    <Login />
  );
}

export default App;