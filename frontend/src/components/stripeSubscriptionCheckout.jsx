import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { CardElement } from '@stripe/react-stripe-js';
import { 
  Typography,
  Grid,
} from '@material-ui/core';


const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  cardSection: {
    maxWidth: 500,
    margin: 'auto',
  },
}));

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: 'Meiryo, Hiragino Mincho',
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
  const [cardInputError, setCardInputError] = useState('');  

  const handleChange = (event) => {
    setCardInputError('');
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
        <div>
          <Grid id='cardSection' container justify='center' spacing={1}>
            <Grid item xs={12}>
              <CardElement className={classes.cardSection} options={CARD_ELEMENT_OPTIONS} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Typography color='warning' display='block' align='center'>JCBは使えません</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption' color='error' display='block' align='center'>{cardInputError}</Typography>
            </Grid>
          </Grid>
        </div>
    </div>
  );
}


