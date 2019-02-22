import React, { Component ,Fragment} from 'react';

import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route

} from 'react-router-dom'
import Home from './components/Home';
import List from './components/List';


const Root = () => (
  <Router>
    <Fragment>
     
    <Switch>
    <Route path="/" exact  component={Home} />
    <Route path="/:owner/:repository" exact  component={List} />
 
  <Redirect to="/" />
    </Switch>
    </Fragment>
  </Router>
);
// pages


class App extends Component {
  render() {
    return (
      <div id="app">
      <div className="container">
  
      <Root />
      </div>
  </div>
    );
  }
}

export default App;
