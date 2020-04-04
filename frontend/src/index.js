import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Moment from 'moment';
import momentLocalizer from 'react-widgets-moment';
import 'bootstrap/dist/css/bootstrap.min.css';

import './main.scss'; // webpack must be configured to do this
import App from './components/App';

Moment.locale('en');
momentLocalizer();

ReactDOM.render((
  <BrowserRouter>
    <App/>
  </BrowserRouter>
), document.getElementById('root'));
