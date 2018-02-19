import * as React from 'react';
import './App.css';

import logoSvg from 'src/assets/logo/logo.svg';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">Project Voldemort</h1>
        </header>
        <img src={logoSvg} alt="Linode Logo"/>
      </div>
    );
  }
}

export default App;
