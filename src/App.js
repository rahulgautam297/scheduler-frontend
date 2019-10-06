import React, { Component } from 'react';
import './App.css';
import Scheduler from './components/Scheduler';
import WebFontLoader from 'webfontloader';

// Code for server side rendering.
// if(typeof(window) !== 'undefined') {
//   import('WebFontLoader').then((webFontLoader) => {
//     WebFontLoader.load({
//       google: {
//         families: ['Roboto:300,400,500,700', 'Material Icons']
//       },
//     });
//   });
// }

WebFontLoader.load({
  google: {
    families: ['Roboto:300,400,500,700', 'Material Icons']
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
