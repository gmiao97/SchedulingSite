import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { Done } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
}));

export default function PayPalButton(props) {
  const classes = useStyles();
  const [error, setError] = useState(null);
  const paypalRef = useRef();

  useEffect(() => {
    window.paypal
      .Buttons({
        style: {
          shape:  'pill',
          height: 40
        },
        createSubscription: (data, actions) => {
          return actions.subscription.create({
            'plan_id': 'P-16G699664V806364PL4GJRSQ' // Creates the subscription
          });
        },
        onApprove: async (data, actions) => {
          props.setPaidFor(true);
          // alert('You have successfully created subscription ' + data.subscriptionID);
        },
        onError: err => {
          setError(err);
          console.error(err);
        },
      })
      .render(paypalRef.current);
  }, []);

  return(
    <div id="payPalButton">
      {props.paidFor ? 
        <Typography color="primary" className={classes.sectionEnd}>
          <Done />
          Subscription Payment Completed. Please complete <Typography display="inline" color="secondary">student</Typography> registration.
        </Typography> :
        <div ref={paypalRef} />
      }
    </div>
  );
}

