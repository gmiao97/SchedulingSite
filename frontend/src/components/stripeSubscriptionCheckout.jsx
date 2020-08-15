import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { 
  Typography,
  Button,
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
  cardSection: {
    maxWidth: 500,
  },
}));

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

export default function StripeSubscriptionCheckout(props) {
  const classes = useStyles();
  // const stripe = useStripe();
  // const elements = useElements();

  const [priceList, setPriceList] = useState(null);

  const getPlans = async () => {
    try {
      const priceResponse = await axiosInstance.get('/yoyaku/stripe-prices/');
      setPriceList(priceResponse.data.data);
      props.setSelectedPrice(priceResponse.data.data[0].id);
    } catch(err) {
      props.setError('Unable to load subscription plans.');
      console.error(err.stack);
      props.setErrorSnackbarOpen(true);
    }
  }

  useEffect(() => {
    getPlans();
  }, []);

  // const handleSubmit = async (event) => {
  //   event.preventDefault();

  //   if (!stripe || !elements) {
  //     return;
  //   }

  //   // Get a reference to a mounted CardElement. Elements knows how
  //   // to find your CardElement because there can only ever be one of
  //   // each type of element.
  //   const cardElement = elements.getElement(CardElement);

  //   // If a previous payment was attempted, get the latest invoice
  //   const latestInvoicePaymentIntentStatus = localStorage.getItem(
  //     'latestInvoicePaymentIntentStatus'
  //   );

  //   const { error, paymentMethod } = await stripe.createPaymentMethod({
  //     type: 'card',
  //     card: cardElement,
  //   });

  //   if (error) {
  //     console.error('[createPaymentMethod error]', error);
  //   } else {
  //     console.log('[PaymentMethod]', paymentMethod);
  //     const paymentMethodId = paymentMethod.id;
  //     if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
  //       // Update the payment method and retry invoice payment
  //       const invoiceId = localStorage.getItem('latestInvoiceId');
  //       retryInvoiceWithNewPaymentMethod({
  //         customerId,
  //         paymentMethodId,
  //         invoiceId,
  //         priceId,
  //       });
  //     } else {
  //       // Create the subscription
  //       createSubscription({ customerId, paymentMethodId, priceId });
  //     }
  //   }
  // };

  return (
    <div id='stripeSubscriptionCheckout' className={classes.sectionEnd}>

      {priceList === null ? 
        <Grid container justify='center'>
          <CircularProgress color="primary" />
        </Grid> :
        <div>
          <FormControl component='fieldset'>
            <FormLabel component='legend'>Select your subscription plan</FormLabel>
            <RadioGroup id='selectedPrice' name="selectedPrice" value={props.selectedPrice} onChange={e => {props.setSelectedPrice(e.target.value)}}>
              {priceList.map(price => 
                <FormControlLabel 
                  key={price.id}
                  value={price.id} 
                  control={<Radio />} 
                  label={
                    <div>
                      <Typography color='textPrimary'>{price.product.name}</Typography>
                      <Typography variant='caption' color='textSecondary'>{price.nickname}</Typography>
                    </div>
                  } 
                />
              )}
            </RadioGroup>
          </FormControl> 
          <Grid id='cardSection' container justify='center'>
              {/* <Typography>Card details</Typography> */}
              <CardElement className={classes.cardSection} options={CARD_ELEMENT_OPTIONS} />
          </Grid>
        </div>
      }
    </div>
  );
}


