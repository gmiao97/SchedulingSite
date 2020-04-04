import React, { Component } from 'react';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import {
  Container,
  Button, 
} from 'reactstrap';

import axiosInstance from '../../axiosApi';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleLogin = props.handleLogin;
  }

  handleChange(event) {
    this.setState( {[event.target.name]: event.target.value} );
  }

  async handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/token/obtain/', {
        email: this.state.email,
        password: this.state.password,
      });
      axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      this.handleLogin();
      return response;
    } catch (error) {
      alert(error);
    }
  }

  render() {
    return (
      <Container>
        <AvForm onValidSubmit={this.handleSubmit}>
          <AvField type='email' label='Email' name='email' value={this.state.email} onChange={this.handleChange} validate={{
            required: {value: true, errorMessage: 'Please enter an email'},
            email: {value: true, errorMessage: 'Please enter a valid email address (e.g. example@website.com)'},
          }}/>
          <AvField type='password' label='Password' name='password' value={this.state.password} onChange={this.handleChange} validate={{
            required: {value: true, errorMessage: 'Please enter a password'},
          }}/>
          <Button outline color='info'>Submit</Button>
        </AvForm>
      </Container>
    );
  }
}

export default Login;