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
  Box,
  TextField,
  Link as MaterialLink,
  Checkbox,
} from '@material-ui/core';

import axiosInstance from '../axiosApi';


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
  const [priceList, setPriceList] = useState(null);
  const [cardInputError, setCardInputError] = useState('');
  const [code, setCode] = useState('');


  useEffect(() => {
    getPlans();
  }, []);

  const getPlans = async () => {
    try {
      const priceResponse = await axiosInstance.get('/yoyaku/stripe-prices/');
      setPriceList(priceResponse.data.data.sort((a, b) => {
        return a.product.name.length - b.product.name.length;
      }));
      props.setSelectedPrice(priceResponse.data.data[0].id);
    } catch(err) {
      console.error(err.stack);
      props.setError('サブスクリプションプランを読み込みできませんでした。');
      props.setErrorSnackbarOpen(true);
    }
  }

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

  const preschoolPriceDisabled = (productName) => {
    const classCodes = ['ENBE１', 'HNPNEE１', 'HEPE１', 'HNPNEE２', 'HNPNEE３', 'ENBE1', 'HNPNEE1', 'HEPE1', 'HNPNEE2', 'HNPNEE3'];
    return productName.includes('未就学児') && !classCodes.includes(code);
  }

  return (
    <div id='stripeSubscriptionCheckout' className={classes.sectionEnd}>
      {priceList === null ? 
        <Grid container justify='center'>
          <CircularProgress color="primary" />
        </Grid> :
        <div>
          <TextField id='code' name='code' className={classes.sectionEnd} type='text' label='クラス番号' helperText='未就学児クラスのみ' value={code} 
          onChange={e => setCode(e.target.value)} fullWidth variant='outlined' size='small' />
          <FormControl component='fieldset'>
            <FormLabel component='legend'>プランを選択して下さい</FormLabel>
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
                  disabled={preschoolPriceDisabled(price.product.name)}
                />
              )}
            </RadioGroup>
          </FormControl> 
          <Grid id='legalSection' container justify='flex-start' spacing={2}>
            <Grid item>
              <MaterialLink 
                href='http://mercy-education.com/FREE/cn2/2020-07-14-3.html'
                target='_blank'
                rel='noopener noreferrer'
                color='secondary'
              >
                プランのご説明
              </MaterialLink>
            </Grid>
            <Grid item>
              <MaterialLink 
                href='http://mercy-education.com/FREE/cn2/2020-08-18.html'
                target='_blank'
                rel='noopener noreferrer'
                color='secondary'
              >
                お支払いのご案内
              </MaterialLink>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                value="end"
                control={<Checkbox color="primary" checked={props.agreed} onChange={e => props.setAgreed(e.target.checked)} color='secondary' />}
                label="同意します"
                labelPlacement="end"
              />
            </Grid>
          </Grid>
          <Grid id='cardSection' container justify='center' spacing={1}>
            <Grid item xs={12}>
              <CardElement className={classes.cardSection} options={CARD_ELEMENT_OPTIONS} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Typography variant='caption' color='error' display='block' align='center'>{cardInputError}</Typography>
            </Grid>
          </Grid>
        </div>
      }
    </div>
  );
}


