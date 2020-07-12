import React, { useState } from 'react';
import { styled, makeStyles } from '@material-ui/core/styles';
import { useHistory, Link } from "react-router-dom"
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Button,
  TextField,
  Snackbar,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import axiosInstance from '../../axiosApi';


const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(3),
  },
}));

export default function Login(props) {
  const [state, setState] = useState({
    username: "",
    password: "",
    errorSnackbarOpen: false,
  });
  const handleLogin = props.handleLogin;
  const history = useHistory();

  const handleChange = event => {
    setState({
      ...state,
      [event.target.name]: event.target.value
    });
  }

  const handleSnackbarClose = (event, reason) => {
    setState({
      ...state,
      successSnackbarOpen: false,
      errorSnackbarOpen: false,
    });
  }

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/token/obtain/', {
        username: state.username,
        password: state.password,
      });
      axiosInstance.defaults.headers['Authorization'] = 'Bearer ' + response.data.access;
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      handleLogin();
      return response;
    } catch (error) {
      console.log(error.stack);
      setState({
        ...state,
        errorSnackbarOpen: true,
      });
    }
  }

  const classes = useStyles();
  return (
    <Paper elevation={24}>
      <Box p={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs="12">
              <TextField id='username' name='username' type='text' label='User Id' value={state.username} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs="12">
              <TextField id='password' name='password' className={classes.sectionEnd} type='password' label='Password' value={state.password} onChange={handleChange} required fullWidth />
            </Grid>
          </Grid>
          <Grid container spacing={3} justify="space-between">
            <Grid item>
              <Button type="submit" variant="contained" color="primary">Login</Button>
            </Grid>
            <Grid item>
              <Button type="submit" color="default" size="small" component={Link} to="/signup">New User? Sign up here</Button>
            </Grid>
          </Grid>
          
        </form>
        
      </Box>
      <Snackbar open={state.errorSnackbarOpen} onClose={handleSnackbarClose}>
        <Alert severity="error" variant="filled" elevation={24} onClose={handleSnackbarClose}>
          Incorrect User Id or Password
        </Alert>
      </Snackbar>
    </Paper>
  );
}