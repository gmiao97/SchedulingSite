import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom"
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Snackbar,
  Backdrop,
  CircularProgress,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import axiosInstance from '../../axiosApi';


const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(3),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function Login(props) {
  const classes = useStyles();
  const [state, setState] = useState({
    username: "",
    password: "",
    errorSnackbarOpen: false,
  });
  const handleLogin = props.handleLogin;

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
    } catch (err) {
      console.error(err.stack);
      setState({
        ...state,
        errorSnackbarOpen: true,
      });
    }
  }

  return (
    <Paper elevation={24}>
      <Box p={3}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField id='username' name='username' type='text' label='ユーザー名' value={state.username} onChange={handleChange} required fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField id='password' name='password' className={classes.sectionEnd} type='password' label='パスワード' value={state.password} onChange={handleChange} required fullWidth />
            </Grid>
          </Grid>
          <Grid container spacing={3} justify="space-between" alignItems='flex-end'>
            <Grid item>
              <Box>
                <Button type="submit" variant="contained" color="primary">ログイン</Button>
              </Box>
              <Button color="default" size="small" component={Link} to="/password-reset">パスワードお忘れですか？</Button>
            </Grid>
            <Grid item>
              <Box>
                <Button color="default" size="small" target='_blank' rel='noopener noreferrer' href="https://success-j-academy.com/#/sign-in">新規登録はこちらへ</Button>
              </Box>
              <Typography variant='caption' color='textSecondary'>2023年1月から登録サイトが新しくなりました。</Typography>
            </Grid>
          </Grid>
        </form> 
      </Box>
      <Snackbar open={state.errorSnackbarOpen} onClose={handleSnackbarClose}>
        <Alert severity="error" variant="filled" elevation={24} onClose={handleSnackbarClose}>
          ユーザー名またはパスワードが間違っています。
        </Alert>
      </Snackbar>
    </Paper>
  );
}

export function PasswordReset(props) {
  const classes = useStyles();
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [error, setError] = useState('');
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [state, setState] = useState({
    username: '',
  });

  const handleChange = event => {
    setState({
      ...state,
      [event.target.name]: event.target.value
    });
  }

  const handleSnackbarClose = () => {
    setSuccessSnackbarOpen(false);
    setErrorSnackbarOpen(false);
  }

  const handleSubmit = async event => {
    event.preventDefault();
    setBackdropOpen(true);
    const response = await axiosInstance.post('/yoyaku/password-reset/', {
      username: state.username,
    });
    setBackdropOpen(false);

    if (response.data.error) {
      setError(response.data.error);
      setErrorSnackbarOpen(true);
    } else {
      setSuccessSnackbarOpen(true);
    }
  }

  return (
    <div>
      <Paper elevation={24}>
        <Box p={3}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField id='username' name='username' type='text' label='ユーザー名' value={state.username} onChange={handleChange} required fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">パスワードをリセット</Button>
              </Grid>
            </Grid>
          </form>
        </Box>
        <Snackbar open={successSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="success" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            臨時パスワードをお使いのメールアドレスに送信しました。
          </Alert>
        </Snackbar>
        <Snackbar open={errorSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="error" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            そのユーザー見つかりませんでした。
          </Alert>
        </Snackbar>
      </Paper>
      <Backdrop className={classes.backdrop} open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}