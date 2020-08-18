import React, { Component, useState, useEffect } from 'react';
import {  
  Typography,
  Button,
  Paper,
} from '@material-ui/core';

import axiosInstance from '../../axiosApi';


export default function Subscription(props) {

  const handleStripeCustomerPortalRedirect = async () => {
    const response = await axiosInstance.post('/yoyaku/stripe-customer-portal/', {
      customerId: props.currentUser.stripeCustomerId,
    });
    console.log(response.data.url);
    window.location.assign(response.data.url);
  }

  return(
    <div>
      <Typography variant="h5" display='block'>
        サブスクリプション管理
      </Typography>
      <Button variant="contained" color="primary" type="button" onClick={handleStripeCustomerPortalRedirect}>
        Register
      </Button>
    </div>
  );
}