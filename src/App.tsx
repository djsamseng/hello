import React from 'react';
import logo from './logo.svg';
import './App.css';

import Audio from "./Audio";
import Chatroom from "./chatroom/Chatroom";
import Visualizer from "./Visualizer";

const App: React.FC = () => {
  return (
    <div className="App">
      <header className="App-header">
        <Visualizer />
        <Audio />
        <Chatroom />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
