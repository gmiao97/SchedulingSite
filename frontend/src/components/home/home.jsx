import React, { Component, useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import Panda from '../../static/avatars/panda.png';
import { Switch, Route, Link, } from "react-router-dom";
import {  
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
  Backdrop,
  CircularProgress,
  Paper,
  Link as MaterialLink,
} from '@material-ui/core';
import { 
  Menu as MenuIcon,
} from '@material-ui/icons';

import MyPage from './myPage/myPage';
import Calendar from './calendar';
import axiosInstance from '../../axiosApi';
import { getUserIdFromToken } from '../../util';
import Logo from '../../static/success.academy.logo.png';


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
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundImage: `url(${Panda})`,
    backgroundSize: "cover",
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
    },
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  logo: {
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundColor: 'white',
    backgroundImage: `url(${Logo})`,
    backgroundSize: 'cover',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function Home(props) {
  const classes = useStyles();
  const [desktopMenuAnchorEl, setDesktopMenuAnchorEl] = useState(null);
  const desktopMenuOpen = Boolean(desktopMenuAnchorEl);
  const [mobileMenuAnchorEl, setMobileMenuAnchorEl] = useState(null);
  const mobileMenuOpen = Boolean(mobileMenuAnchorEl);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [reload, setReload] = useState(false);
  const handleLogout = props.handleLogout;

  useEffect(() => {
    getCurrentUser();
    setReload(false);
  }, [reload]);

  const getCurrentUser = async () => {
    let userResponse = await axiosInstance.get(`/yoyaku/users/${getUserIdFromToken()}/`);
    setCurrentUser(userResponse.data);

    if (userResponse.data.stripeSubscriptionId && userResponse.data.stripeProductId) {
      let subscriptionResponse = await axiosInstance.get('/yoyaku/stripe-subscription/', {
        params: {
          subscriptionId: userResponse.data.stripeSubscriptionId,
        },
      });
      let productResponse = await axiosInstance.get('/yoyaku/stripe-product/', {
        params: {
          productId: userResponse.data.stripeProductId,
        },
      });
      setCurrentSubscription(subscriptionResponse.data);
      setCurrentProduct(productResponse.data);
    } else {
      setCurrentSubscription({error: 'サブスクリプションがありません'});
      setCurrentProduct({error: 'サブスクリプションがありません'});
    }
  }

  const isLoaded = () => {
    return currentUser && currentSubscription && currentProduct;
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
      <MenuItem onClick={handleMobileMenuClose} component={Link} to="/class-info">
        クラス情報（ズーム）
      </MenuItem>
      <MenuItem onClick={handleMobileMenuClose} component={Link} to="/announce">
        指導報告
      </MenuItem>
      <MenuItem onClick={handleMobileMenuClose} component={Link} to="/my-page">
        マイページ
      </MenuItem>
      {/* <MenuItem onClick={handleMobileMenuClose} component={Link} to="/calendar">
        Calendar
      </MenuItem> */}
      <MenuItem onClick={handleLogout} component={Link} to="/">
        <Typography color='error' className={classes.iconMargin}>
          ログアウト
        </Typography>
        {/* <ExitToApp color="secondary" /> */}
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
      <MenuItem onClick={handleLogout} component={Link} to="/">
        <Typography　color='error' className={classes.iconMargin}>
          ログアウト
        </Typography>
        {/* <ExitToApp color="secondary" /> */}
      </MenuItem>
    </Menu>
  );

  return(
    !isLoaded() ? 
    <Backdrop className={classes.backdrop} open>
      <CircularProgress color="inherit" />
    </Backdrop> :
      <div id='home'>
        <Box className={classes.root} clone>
          <AppBar position="static" color="primary">
            <Toolbar>
              <IconButton edge="start" className={classes.iconMargin} color="inherit" component={Link} to="/class-info">
                <Avatar className={classes.logo}> </Avatar>
              </IconButton>
              <Typography variant="h6" className={classes.title}>
                Success Academy
              </Typography>
              <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/class-info">クラス情報（ズーム）</Button>
              <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/announce">指導報告</Button>
              <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/my-page">マイページ</Button>
              {/* <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/calendar">Calendar</Button> */}
              <div className={`${classes.sectionDesktop} ${classes.menu}`}>
                <IconButton
                  onClick={handleDesktopMenuOpen}
                  color="inherit"
                >
                  <Avatar className={classes.purple}>{`${currentUser.last_name[0]}`.toUpperCase()}</Avatar>
                  {/* <Avatar className={classes.avatar}> </Avatar> */}
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
          <Route exact path="/my-page">
            <Box mx='auto' width='75%' my={5} minWidth={400}>
              <MyPage 
                currentUser={currentUser} 
                currentSubscription={currentSubscription} 
                currentProduct={currentProduct}
                setReload={setReload}
              />
            </Box>
          </Route>
          <Route exact path="/class-info">
            <Box mx='auto' width='90%' my={5} minWidth={400}>
              <ClassInfo currentUser={currentUser} />
            </Box>
          </Route>
          <Route exact path="/announce">
            <Box mx='auto' width='90%' my={5} minWidth={400}>
              <Announce />
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

export function ClassInfo(props) {
  return(
    <Grid container spacing={2}>
      <Paper elevation={24}>
        <Box p={3}>
          ズームID（９月のクラスは９月１日から９月３０日までです）
        </Box>
      </Paper>
    </Grid>
  );
}

export function Announce(props) {
  return(
    <Grid container spacing={2}>
      <Paper elevation={24}>
        <Box p={3}>
          <MaterialLink href='http://staffvoice.mercy-education.com' target='_blank' rel='noopener noreferrer' color='secondary'>
            指導報告へ
          </MaterialLink>
        </Box>
      </Paper>
    </Grid>
  );
}