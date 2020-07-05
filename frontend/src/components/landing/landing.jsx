import React, { useState } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import {  
  Container, 
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
} from '@material-ui/core';
import { 
  School,
} from '@material-ui/icons';

import Login from './login';
import Signup from './signup';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function Landing(props) {
  const classes = useStyles();

  return (
    <div id='landing'>
      <Router>
        <Box classname={classes.root} color="text.secondary" clone>
          <AppBar position="static" color="transparent">
            <Toolbar>
              <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                <School />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Success Academy
              </Typography>
              <Button color="inherit" component={Link} to="/">Signup</Button>
              <Button color="inherit" component={Link} to="/login">Login</Button>
            </Toolbar>
          </AppBar>
        </Box>

        <Switch>
          <Route exact path="/">
            <Box mx='auto' my={5} width="50%" minWidth={200}>
              <Signup />
            </Box>
          </Route>
          <Route path="/login">
            <Box mx='auto' my={5} width="40%" minWidth={200}>
              <Login handleLogin={props.handleLogin}/>
            </Box>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default Landing;