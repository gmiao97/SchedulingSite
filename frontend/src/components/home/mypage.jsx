import React, { Component, useState, useEffect } from 'react';
import {  
  Typography,
  Button,
  Paper,
  Box,
  Grid,
} from '@material-ui/core';

import axiosInstance from '../../axiosApi';


export default function MyPage(props) {

  const handleStripeCustomerPortalRedirect = async () => {
    const response = await axiosInstance.post('/yoyaku/stripe-customer-portal/', {
      customerId: props.currentUser.stripeCustomerId,
    });
    console.log(response.data.url);
    window.location.assign(response.data.url);
  }

  if (props.currentProduct.error || props.currentSubscription.error) {
    return(
      <Grid container spacing={2}>
      <Grid item xs={5}>
        <Typography variant='h3' color='textPrimary'>{props.currentUser.first_name} 様</Typography>
      </Grid>
      <Grid item xs={7}>
        <Paper elevation={24}>
          <Box p={3}>
            <Typography variant='h4' color='textSecondary' display='block' gutterBottom>
              サブスクリプション情報
            </Typography>
            <Typography variant='h5' color='textSecondary' display='block' gutterBottom>
              現在のプラン <Typography color='secondary' display='inline'>サブスクリプションありません</Typography>
            </Typography>
            <Typography variant='h5' color='textSecondary' display='block' gutterBottom>
              値段
            </Typography>
            <Button variant='contained' color='secondary' type='button' onClick={handleStripeCustomerPortalRedirect}>
              プラン管理
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
    )
  }

  return(
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <Typography variant='h3' color='textPrimary'>{props.currentUser.first_name} 様</Typography>
      </Grid>
      <Grid item xs={12} md={7}>
        <Paper elevation={24}>
          <Box p={3}>
            <Typography variant='h4' color='textSecondary' display='block' gutterBottom>
              サブスクリプション情報
            </Typography>
            <Typography variant='h5' color='textSecondary' display='block' gutterBottom>
              現在のプラン <Typography color='secondary' display='inline'>{props.currentProduct.name}</Typography>
            </Typography>
            <Typography variant='h5' color='textSecondary' display='block' gutterBottom>
              値段 <Typography color='secondary' display='inline'>{props.currentSubscription.items.data[0].price.nickname}</Typography>
            </Typography>
            <Button variant='contained' color='secondary' type='button' onClick={handleStripeCustomerPortalRedirect}>
              プラン管理
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}