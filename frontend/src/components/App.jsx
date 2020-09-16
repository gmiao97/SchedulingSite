import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom'

import Landing from './landing/landing';
import Home from './home/home';
import axiosInstance from '../axiosApi';


export default function App(props) {
  const [authenticated, setAuthenticated] = useState(null);
  const history = useHistory();

  const isAuthenticated = async () => {
    try {
      await axiosInstance.get('/yoyaku/validate-token/');
      setAuthenticated(true);
    } 
    catch (error) {
      handleLogout();
    }
  }

  useEffect(() => {
    isAuthenticated();
  }, []);

  const handleLogin = () => {
    history.push('/class-info');
    setAuthenticated(true);
  }

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post('/yoyaku/blacklist/', {
        'refresh_token': localStorage.getItem('refresh_token')
      });
      return response;
    }
    catch(err) {
      console.error(err);
    } finally {
      axiosInstance.defaults.headers['Authorization'] = null;
      setAuthenticated(false);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }


  if (authenticated === null) {
    return null;
  } else {
    return(
      authenticated ? 
        <Home handleLogout={handleLogout} /> : 
        <Landing handleLogin={handleLogin} />
    )
  }
}
