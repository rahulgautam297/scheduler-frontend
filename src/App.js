import React, { Component } from 'react';
import './App.css';
import Scheduler from './components/Scheduler';
import WebFontLoader from 'webfontloader';

WebFontLoader.load({
  google: {
    families: ['Roboto:300,400,500,700', 'Material Icons'],
  },
});
class App extends Component {
  render() {
    return (
      <div className="App">
        <Scheduler />
      </div>
    );
  }
}

export default App;
