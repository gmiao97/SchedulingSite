import React, { Component, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import Panda from '../../static/avatars/panda.png';
import {
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
  Menu,
  MenuItem,
  Avatar,
} from '@material-ui/core';
import { 
  Menu as MenuIcon,
  MoreVert,
  ExitToApp,
  AccountCircle,
  School,
} from '@material-ui/icons';

import Profile from './profile';
import EditProfile from './editProfile';
import Calendar from './calendar';
import axiosInstance from '../../axiosApi';
import { getUserIdFromToken } from '../../util';


const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  iconMargin: {
    marginRight: theme.spacing(2),
  },
  title: {
    marginRight: theme.spacing(3),
    // flexGrow: 1,
  },
  menu: {
    marginLeft: "auto",
  },
  orange: {
    color: theme.palette.getContrastText(deepOrange[500]),
    backgroundColor: deepOrange[500],
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  avatar: {
    width: theme.spacing(5),
    height: theme.spacing(5),
    backgroundImage: `url(${Panda})`,
    backgroundSize: "cover",
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
}));

export default function Home(props) {
  const [desktopMenuAnchorEl, setDesktopMenuAnchorEl] = useState(null);
  const desktopMenuOpen = Boolean(desktopMenuAnchorEl);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const mobileMenuOpen = Boolean(mobileMenuAnchorEl);
  const [currentUser, setCurrentUser] = useState(null);
  const handleLogout = props.handleLogout;

  useEffect(() => {
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    let response = await axiosInstance.get(`/yoyaku/users/${getUserIdFromToken()}/`);
    setCurrentUser(response.data);
  }

  const handleDesktopMenuOpen = (event) => {
    setDesktopMenuAnchorEl(event.currentTarget);
  }

  const handleDesktopMenuClose = () => {
    setDesktopMenuAnchorEl(null);
  }

  const handleMobileMenuOpen = (event) => {
    setMobileMenuAnchorEl(event.currentTarget);
  }

  const handleMobileMenuClose = () => {
    setMobileMenuAnchorEl(null);
  }


  const classes = useStyles();

  const mobileMenu = (
    <Menu
      anchorEl={mobileMenuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={mobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleMobileMenuClose} component={Link} to="/calendar">
        Calendar
      </MenuItem>
      <MenuItem onClick={handleMobileMenuClose} component={Link} to="/profile">
        Profile
      </MenuItem>
      <MenuItem onClick={handleLogout} component={Link} to="/">
        <Typography className={classes.iconMargin}>
          Logout
        </Typography>
        <ExitToApp color="secondary" />
      </MenuItem>
    </Menu>
  );

  const desktopMenu = (
    <Menu
      anchorEl={desktopMenuAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={desktopMenuOpen}
      onClose={handleDesktopMenuClose}
    >
      <MenuItem onClick={handleDesktopMenuClose} component={Link} to="/profile">
        Profile
      </MenuItem>
      <MenuItem onClick={handleLogout} component={Link} to="/">
        <Typography className={classes.iconMargin}>
          Logout
        </Typography>
        <ExitToApp color="secondary" />
      </MenuItem>
    </Menu>
  );

  return(
    !currentUser ? 
      null :
      <div id='home'>
        <Box classname={classes.root} clone>
          <AppBar position="static" color="transparent">
            <Toolbar>
              <IconButton edge="start" className={classes.iconMargin} color="inherit" component={Link} to="/calendar">
                <School />
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Success Academy
              </Typography>
              <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/calendar">Calendar</Button>
              <div className={`${classes.sectionDesktop} ${classes.menu}`}>
                <IconButton
                  onClick={handleDesktopMenuOpen}
                  color="inherit"
                >
                  {/* <Avatar className={classes.purple}>{`${currentUser.first_name[0]}${currentUser.last_name[0]}`}</Avatar> */}
                  <Avatar className={classes.avatar}> </Avatar>
                </IconButton>
              </div>
              {desktopMenu}
              <div className={`${classes.sectionMobile} ${classes.menu}`}>
                <IconButton onClick={handleMobileMenuOpen} color="inherit">
                  <MenuIcon />
                </IconButton>
              </div>
              {mobileMenu}
            </Toolbar>
          </AppBar>
        </Box>

        <Switch>
          <Route exact path="/profile">
            <Box mx='auto' minWidth={700}>
              <Profile currentUser={currentUser} />
            </Box>
          </Route>
          <Route exact path="/calendar">
            <Box mx='auto' my={5} minWidth={700}>
              <Calendar />
            </Box>
          </Route>
        </Switch>
      </div>
  );
}

