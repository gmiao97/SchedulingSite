import React, { useState } from 'react';
import { Person, CreditCard, InfoOutlined } from '@material-ui/icons';
import { Alert } from '@material-ui/lab'
import {  
  Paper,
  Box,
  Tabs,
  Tab,
  Snackbar,
  Typography,
} from '@material-ui/core';

import StudentProfile, { Subscription } from './studentPage';


export default function MyPage(props) {
  const [activeTab, setActiveTab] = React.useState(0);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSnackbarClose = (event, reason) => {
    setSuccessSnackbarOpen(false);
  }

  if (props.currentUser.user_type === 'STUDENT') {
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
  } else if (props.currentUser.user_type === 'TEACHER') {
    return(
      <Typography>建設中</Typography>
    );
  } else if (props.currentUser.user_type === 'ADMIN') {
    return(
      <Typography>建設中</Typography>
    );
  }
}