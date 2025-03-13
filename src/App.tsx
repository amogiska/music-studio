import React from 'react';
import './App.css';
import TabContainer from './components/TabContainer';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Music Studio</h1>
      </header>
      <main>
        <TabContainer />
      </main>
      <footer>
        <p>Play piano or drum pads using your keyboard or mouse</p>
      </footer>
    </div>
  );
}

export default App;
