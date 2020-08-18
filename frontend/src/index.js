import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import MomentUtils from '@date-io/moment';
import {
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import 'fontsource-roboto';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import './main.scss'; // webpack must be configured to do this
import App from './components/App';


const theme = createMuiTheme({
  palette: {
    type: 'light',
    primary: {
      main: '#EEAF4D',
    },
    secondary: {
      main: '#0074D4',
    },
  },
});

const stripePromise = loadStripe('pk_test_51HEGgQK9gCxRnlEi11v8HnbNn5nfVFgN7ruFIFzKPiogRgdCJKT05QlmOi0rlEcsQdopTd9kFCqYI7roSbb3jgLd00SfWRRCoX', {
  locale: 'ja',
});

if (process.env.NODE_ENV === 'production') {
  stripePromise = loadStripe('pk_test_51HEGgQK9gCxRnlEi11v8HnbNn5nfVFgN7ruFIFzKPiogRgdCJKT05QlmOi0rlEcsQdopTd9kFCqYI7roSbb3jgLd00SfWRRCoX', {
    locale: 'ja',
  });
}

ReactDOM.render((
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <MuiPickersUtilsProvider utils={MomentUtils}>
        <Elements stripe={stripePromise}>
          <App/>
        </Elements>
      </MuiPickersUtilsProvider>
    </ThemeProvider>
  </BrowserRouter>
), document.getElementById('root'));
