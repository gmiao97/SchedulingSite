import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
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
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <App/>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  </BrowserRouter>
), document.getElementById('root'));
