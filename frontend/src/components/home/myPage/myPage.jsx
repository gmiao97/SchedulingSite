import React, { Component, useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { styled, makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Person, CreditCard, LocationOn } from '@material-ui/icons';
import { Alert, Autocomplete } from '@material-ui/lab'
import {  
  Paper,
  Box,
  Tabs,
  Tab,
  Snackbar,
} from '@material-ui/core';

import axiosInstance from '../../../axiosApi';
import { gradeMappings, timeZoneNames, getUserIdFromToken } from '../../../util';
import StudentProfile, { Subscription } from './studentPage';


const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  multiline: {
    whiteSpace: 'pre-line',
  },
}));


export default function MyPage(props) {
  const [activeTab, setActiveTab] = React.useState(0);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSnackbarClose = (event, reason) => {
    setSuccessSnackbarOpen(false);
  }

  return(
    <div>
      <Paper elevation={24}>
        <Tabs value={activeTab} indicatorColor='primary' textColor='primary' onChange={(event, value) => setActiveTab(value)}>
          <Tab label='プロフィール' icon={<Person />} />
          <Tab label='サブスクリプション' icon={<CreditCard />} />
        </Tabs>
        <Box p={3}>
          {activeTab === 0 ?
            <StudentProfile 
              currentUser={props.currentUser} 
              setReload={props.setReload} 
              setSuccessMessage={setSuccessMessage}
              setSuccessSnackbarOpen={setSuccessSnackbarOpen}
            /> :
            <Subscription 
              stripeCustomerId={props.currentUser.stripeCustomerId} 
              currentSubscription={props.currentSubscription} 
              currentProduct={props.currentProduct}
            />
          }
        </Box>
      </Paper>
      <Snackbar open={successSnackbarOpen} onClose={handleSnackbarClose}>
        <Alert severity='success' variant='filled' onClose={handleSnackbarClose}>
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}