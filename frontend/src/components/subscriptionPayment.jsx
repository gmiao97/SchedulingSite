import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Done } from '@material-ui/icons';
import { 
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Grid,
} from '@material-ui/core';

import axiosInstance from '../axiosApi';

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
}));

export default function SubscriptionPayment(props) {
  const classes = useStyles();
  const paypalRef = useRef();
  const [plans, setPlans] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const getPlans = async () => {
    try {
      const response = await axiosInstance.get('/yoyaku/subscription-plan/');
      setPlans(response.data.plans);
      setSelectedPlan(response.data.plans[0].id);
    } catch(err) {
      props.setError('Unable to load subscription plans.');
      console.error(err.stack);
      props.setErrorSnackbarOpen(true);
    }
  }

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    document.getElementById('paypalButton').innerHTML = '';

    window.paypal
      .Buttons({
        style: {
          shape:  'pill',
          height: 40
        },
        createSubscription: (data, actions) => {
          return actions.subscription.create({
            'plan_id': selectedPlan // Creates the subscription
          });
        },
        onApprove: async (data, actions) => {
          props.onSubmit();
          // alert('You have successfully created subscription ' + data.subscriptionID);
        },
        onError: err => {
          props.setError('Failed to complete subscription payment.');
          console.error(err.stack);
          props.setErrorSnackbarOpen(true);
        },
      })
      .render(paypalRef.current);
  }, [selectedPlan]);

  const handlePlanChange = event => {
    setSelectedPlan(event.target.value);
  }

  return(
    <div id='subscriptionPayment'>
      {plans === null ? 
        <Grid container justify='center' className={classes.sectionEnd}>
          <CircularProgress color="primary" />
        </Grid> :
        <FormControl component='fieldset'>
          <FormLabel component='legend'>Select your subscription plan</FormLabel>
          <RadioGroup id='selectedPlan' name="selectedPlan" value={selectedPlan} onChange={handlePlanChange}>
            {plans.filter(plan => plan.status === 'ACTIVE').map(plan => 
              <FormControlLabel 
                key={plan.id}
                value={plan.id} 
                control={<Radio />} 
                label={
                  <div>
                    <Typography color='textPrimary'>{plan.name}</Typography>
                    <Typography variant='caption' color='textSecondary'>{plan.description}</Typography>
                  </div>
                } 
              />
            )}
          </RadioGroup>
        </FormControl> 
      }
      <div id='paypalButton' ref={paypalRef} style={{display: plans === null ? 'none' : 'block' }} />
    </div>
  );
}

