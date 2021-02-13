import React, { useState, useEffect } from 'react';
import { styled, makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { Check } from '@material-ui/icons';
import {
  Grid,
  Typography,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  FormGroup,
  FormHelperText,
  Divider,
  Link as MaterialLink,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
} from '@material-ui/core';

import axiosInstance from '../../../axiosApi';
import { userAgreement } from '../../../util';


const MyGrid = styled(Grid)({
  alignItems: 'flex-start',
});

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  strikethrough: {
    textDecoration: 'line-through',
  },
}));


export default function SelectPlan(props) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stripePrices, setStripePrices] = useState({});
  const [weekend, setWeekend] = useState(false);
  const [preschool, setPreschool] = useState(false);

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    if (weekend && preschool) {
      props.setSelectedPrice(stripePrices['mpw']);
    } else if (weekend) {
      props.setSelectedPrice(stripePrices['mw']);
    } else if (preschool) {
      props.setSelectedPrice(stripePrices['mp']);
    } else {
      props.setSelectedPrice(stripePrices['m']);
    }
  }, [weekend, preschool]);

  const getPlans = async () => {
    try {
      const priceResponse = await axiosInstance.get('/yoyaku/stripe-prices/');
      var stripePriceMap = {};
      for (const price of priceResponse.data.data) {
        stripePriceMap[price.metadata.identifier] = price.id;
      }
      setStripePrices(stripePriceMap);
      props.setSelectedPrice(stripePriceMap['m']);
    } catch(err) {
      console.error(err.stack);
      props.setError('サブスクリプションプランの読み込みできませんでした。アドミンに連絡してください。');
      props.setErrorSnackbarOpen(true);
    }
  }


  const handlePlanChange = event => {
    if (event.target.name === 'weekend') {
      setWeekend(event.target.checked);
    } else if (event.target.name === 'preschool') {
      setPreschool(event.target.checked);
    }
  }

  return(
    <div>
      <MyGrid container spacing={3} className={classes.sectionEnd}>
        <MyGrid item xs={12}>
          <Typography variant='subtitle1' color='textPrimary'>月会費（ミニマムコース）・$30</Typography>
        </MyGrid>
        <MyGrid item xs={12}>
          <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">追加クラスを選んでください</FormLabel>
            <FormGroup>
              <FormControlLabel
                control={<Checkbox checked={weekend} onChange={handlePlanChange} name="weekend" />}
                label={
                  <Typography variant='subtitle2' color='textSecondary'>土日クラス・+$10</Typography>
                }
              />
              <FormControlLabel
                control={<Checkbox checked={preschool} onChange={handlePlanChange} name="preschool" />}
                label={
                  <Typography variant='subtitle2' color='textSecondary'>未就学児クラス・+$10</Typography>
                }
              />
            </FormGroup>
            <Divider />
            <FormHelperText>
              <Typography variant='subtitle1' color='textSecondary'>請求詳細</Typography>
              <Typography variant='body2' color='textPrimary'>今日</Typography>
              <Typography variant='body2' color='textSecondary'>・$0（30日間の無料トライアル）</Typography>
              <Typography variant='body2' color='textPrimary'>
                30日後
              </Typography>
              <Typography variant='body2' color='textSecondary' className={props.isReferral ? classes.strikethrough : null}>
                ・入会費（$100）
              </Typography>
              {props.isReferral ?
                <Typography variant='caption' color='textSecondary'>
                  <Check color='secondary' fontSize='small' style={{ color: green[500] }} />
                  紹介
                </Typography> :
                null
              }
              <Typography variant='body2' color='textSecondary'>
                {weekend && preschool ? 
                  <Typography variant='body2' color='textSecondary' display='inline'>・$50</Typography> :
                  !(weekend || preschool) ?
                    <Typography variant='body2' color='textSecondary' display='inline'>・$30</Typography> :
                    <Typography variant='body2' color='textSecondary' display='inline'>・$40</Typography>
                }
                の月額（日割り）
              </Typography>
          
            </FormHelperText>
          </FormControl>
        </MyGrid>
      </MyGrid>

      <Grid id='legalSection' container justify='flex-start' spacing={1}>
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
          <Button variant='outlined' color='secondary' size='small' onClick={() => setDialogOpen(true)}>
            利用規約
          </Button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>サクセス・アカデミー利用規約</DialogTitle>
            <DialogContent>
              <DialogContentText>
                {userAgreement.map(line =>
                  <Typography>
                    {line}
                  </Typography>
                )}
              </DialogContentText>
            </DialogContent>
          </Dialog>
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            value="end"
            control={<Checkbox color="primary" checked={props.agreed} onChange={e => props.setAgreed(e.target.checked)} color='secondary' />}
            label="利用規約に同意します"
            labelPlacement="end"
          />
        </Grid>
      </Grid>
    </div>

    
  );
}