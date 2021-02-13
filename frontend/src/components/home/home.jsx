import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import { Switch, Route, Link, } from "react-router-dom";
import { Menu as MenuIcon} from '@material-ui/icons';
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

import MyPage from './myPage/myPage';
import Calendar from './calendar';
import ManageUsers from './manageUsers';
import ClassInfo from './classInfo';
import axiosInstance from '../../axiosApi';
import { getUserIdFromToken, avatarMapping } from '../../util';
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
    width: theme.spacing(6),
    height: theme.spacing(6),
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
  avatar: props => ({
    width: theme.spacing(6),
    height: theme.spacing(6),
    backgroundImage: `url(${avatarMapping.get(props.avatar)})`,
    backgroundSize: "cover",
  }),
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
    getUserData();
    setReload(false);
  }, [reload]);

  const getUserData = async () => {
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
      setCurrentSubscription({});
      setCurrentProduct({});
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
      {currentUser && currentUser.user_type === 'ADMIN' ?
        <MenuItem onClick={handleMobileMenuClose} component={Link} to="/manage-users">
          ユーザー管理
        </MenuItem> :
        null
      }
      {/* <MenuItem onClick={handleMobileMenuClose} component={Link} to="/calendar">
        Calendar
      </MenuItem> */}
      <MenuItem onClick={handleLogout} component={Link} to="/">
        <Typography color='error' className={classes.iconMargin}>
          ログアウト
        </Typography>
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
              {currentUser.user_type === 'ADMIN' ?
                <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/manage-users">ユーザー管理</Button> :
                null
              }
              {/* <Button className={classes.sectionDesktop} color="inherit" component={Link} to="/calendar">Calendar</Button> */}
              <div className={`${classes.sectionDesktop} ${classes.menu}`}>
                <IconButton
                  onClick={handleDesktopMenuOpen}
                  color="inherit"
                >
                  <MyAvatar avatar={currentUser.avatar} initial={currentUser.last_name[0].toUpperCase()} />
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
            <Box mx='auto' width='75%' py={5} minWidth={400}>
              <MyPage 
                currentUser={currentUser} 
                currentSubscription={currentSubscription} 
                currentProduct={currentProduct}
                setReload={setReload}
              />
            </Box>
          </Route>
          <Route exact path="/class-info">
            <Box mx='auto' width='90%' py={5} minWidth={400}>
              <ClassInfo 
                currentUser={currentUser}
                currentProduct={currentProduct}
              />
            </Box>
          </Route>
          <Route exact path="/announce">
            <Box mx='auto' width='90%' py={5} minWidth={400}>
              <Announce />
            </Box>
          </Route>
          <Route exact path="/calendar">
            <Box mx='auto' py={5} minWidth={700}>
              <Calendar />
            </Box>
          </Route>
          {currentUser.user_type === 'ADMIN' ? 
            <Route exact path="/manage-users">
              <Box mx='auto' width='90%' py={5} minWidth={400}>
                <ManageUsers />
              </Box>
            </Route> :
            null
          }
        </Switch>
      </div>
  );
}

export function MyAvatar(props) {
  const classes = useStyles(props);

  return(
    props.avatar ?
    <Avatar className={classes.avatar}> </Avatar> :
    <Avatar className={classes.purple}>{props.initial}</Avatar>
  );
}

export function Announce(props) {
  return(
    <Paper elevation={24}>
      <Box p={3}>
        <Button variant='outlined' color='secondary' target='_blank' rel='noopener noreferrer' href='http://staffvoice.mercy-education.com' fullWidth>
          指導報告へ
        </Button>
      </Box>
    </Paper>
  );
}