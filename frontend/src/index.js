import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import 'fontsource-roboto';
// import Moment from 'moment';
// import momentLocalizer from 'react-widgets-moment';
import 'bootstrap/dist/css/bootstrap.min.css';

import './main.scss'; // webpack must be configured to do this
import App from './components/App';

// Moment.locale('en');
// momentLocalizer();

const theme = createMuiTheme({
  palette: {
    type: 'light',
    // primary: {
    //   main: '#fbc02d',
    // },
    // secondary: {
    //   main: '#81d4fa',
    // },
  },
});


ReactDOM.render((
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <App/>
    </ThemeProvider>
  </BrowserRouter>
), document.getElementById('root'));
