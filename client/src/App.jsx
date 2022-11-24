import { EthProvider } from "./contexts/EthContext";

import Demo from "./components/Demo";

import "./App.css";

function App() {
  return (
    <EthProvider>
      <div>
        <div className="container">
          <Demo />
        </div>
      </div>
    </EthProvider>
  );
}

export default App;
