import { Link, Route, Router } from "wouter";
// eslint-disable-next-line import/no-unresolved
import { useHashLocation } from "wouter/use-hash-location";

// Componentes de exemplo
const Home = () => (
  <>
    <h1>Home</h1>
    <Link to="/about">about</Link>
  </>
);
const About = () => (
  <>
    <h1>About</h1>
    <Link to="/">home</Link>
  </>
);

const App = () => (
  <Router hook={useHashLocation}>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    {/* Adicione mais rotas aqui */}
  </Router>
);

export default App;
