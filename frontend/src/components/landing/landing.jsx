import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route, Link, } from "react-router-dom";
import {  
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
} from '@material-ui/core';

import Login, { PasswordReset } from './login';
import Signup from './signup/signup';
import Logo from '../../static/success.academy.logo.png';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  iconButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  logo: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    backgroundColor: 'white',
    backgroundImage: `url(${Logo})`,
    backgroundSize: 'cover',
  },
}));

export default function Landing(props) {
  const classes = useStyles();

  return (
    <div id='landing'>
      <Box className={classes.root} clone>
        <AppBar position="static" color="primary">
          <Toolbar>
            <IconButton edge="start" className={classes.iconButton} color="inherit" component={Link} to="/">
              <Avatar className={classes.logo}> </Avatar>
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Success Academy
            </Typography>
            <Button color="inherit" component={Link} href="https://success-j-academy.com/#/sign-in">登録</Button>
            <Button color="inherit" component={Link} to="/">ログイン</Button>
          </Toolbar>
        </AppBar>
      </Box>

      <Switch>
        <Route exact path="/">
          <Box mx='auto' py={5} width="50%" minWidth={300}>
            <Login handleLogin={props.handleLogin} />
          </Box>
        </Route>
        <Route exact path="/password-reset">
          <Box mx='auto' py={5} width="50%" minWidth={300}>
            <PasswordReset />
          </Box>
        </Route>
        <Route exact path="/signup">
          <Box mx='auto' py={5} width="50%" minWidth={400}>
            <Signup />
          </Box>
        </Route>
      </Switch>
    </div>
  );
}
