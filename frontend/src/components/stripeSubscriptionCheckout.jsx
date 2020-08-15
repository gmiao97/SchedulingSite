import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CardElement } from '@stripe/react-stripe-js';
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
  const [priceList, setPriceList] = useState(null);
  const [cardInputError, setCardInputError] = useState('');

  const getPlans = async () => {
    try {
      const priceResponse = await axiosInstance.get('/yoyaku/stripe-prices/');
      setPriceList(priceResponse.data.data);
      props.setSelectedPrice(priceResponse.data.data[0].id);
    } catch(err) {
      console.error(err.stack);
      props.setError('Unable to load subscription plans.');
      props.setErrorSnackbarOpen(true);
    }
  }

  useEffect(() => {
    getPlans();
  }, []);

  const handleChange = (event) => {
    if (event.complete) {
      props.setCardEntered(true);
      setCardInputError('');
    } else if (event.error) {
      props.setCardEntered(false);
      setCardInputError(event.error.message);
    }
  }

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
              <CardElement className={classes.cardSection} options={CARD_ELEMENT_OPTIONS} onChange={handleChange} />
              <Typography variant='caption' color='textSecondary'>{cardInputError}</Typography>
          </Grid>
        </div>
      }
    </div>
  );
}


