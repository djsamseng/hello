import React from 'react';
import logo from './logo.svg';
import './App.css';

import Audio from "./Audio";
import Chatroom from "./chatroom/Chatroom";
import Visualizer from "./Visualizer";

const App: React.FC = () => {
  return (
    <div className="App">
      <aside className="sidebar left-sidebar">Left</aside>
      <section className="chat-screen" >
        <header className="chat-header">
          Hello
        </header>
        <Visualizer />
        <Audio />
        <Chatroom />
      </section>
      <aside className="sidebar right-sidebar">Right</aside>
    </div>
  );
}

export default App;
