import React, { Component } from 'react';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLanguage, faUser, faSchool } from '@fortawesome/free-solid-svg-icons'

import Landing from './landing/landing';
import Home from './home/home';
import axiosInstance from '../axiosApi';

library.add(faLanguage, faUser, faSchool);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isAuthenticated: null,
    };

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.isAuthenticated();
  }

  async isAuthenticated() {
    try {
      await axiosInstance.get('/yoyaku/validate-token/');
      this.setState({
        isAuthenticated: true,
      });
    } 
    catch (error) {
      this.setState({
        isAuthenticated: false,
      });
      this.handleLogout()
    }
  }

  handleLogin() {
    this.setState({
      isAuthenticated: true,
    });
  }

  async handleLogout() {
    try {
      const response = await axiosInstance.post('/yoyaku/blacklist/', {
        'refresh_token': localStorage.getItem('refresh_token')
      });
      return response;
    }
    catch(e) {
      console.log(e);
    } finally {
      this.setState({
        isAuthenticated: false,
      });
      axiosInstance.defaults.headers['Authorization'] = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  render() {
    let renderComponent;
    if (this.state.isAuthenticated == null) {
      renderComponent = null;
    } else {
      renderComponent = (this.state.isAuthenticated) ? 
      <Home handleLogout={this.handleLogout}/> : 
      <Landing handleLogin={this.handleLogin}/>
    }
    return (
      <div id='app'>
        {renderComponent}
      </div>   
    );
  }
}

export default App;
