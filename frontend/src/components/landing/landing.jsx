import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Switch, Route, Link, } from "react-router-dom";
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
  iconButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function Landing(props) {
  const classes = useStyles();

  return (
    <div id='landing'>
      <Box className={classes.root} clone>
        <AppBar position="static" color="transparent">
          <Toolbar>
            <IconButton edge="start" className={classes.iconButton} color="inherit" component={Link} to="/">
              <School />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              Success Academy
            </Typography>
            <Button color="inherit" component={Link} to="/signup">Signup</Button>
            <Button color="inherit" component={Link} to="/">Login</Button>
          </Toolbar>
        </AppBar>
      </Box>

      <Switch>
        <Route exact path="/">
          <Box mx='auto' my={5} width="40%" minWidth={300}>
            <Login handleLogin={props.handleLogin} />
          </Box>
        </Route>
        <Route exact path="/signup">
          <Box mx='auto' my={5} width="40%" minWidth={400}>
            <Signup />
          </Box>
        </Route>
      </Switch>
    </div>
  );
}
