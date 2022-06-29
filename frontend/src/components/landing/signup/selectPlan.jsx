import React, { useState, useEffect } from 'react';
import { styled, makeStyles } from '@material-ui/core/styles';
import { green } from '@material-ui/core/colors';
import { Check } from '@material-ui/icons';
import { Autocomplete } from '@material-ui/lab';
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
  TextField,
} from '@material-ui/core';

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

  const handlePlanChange = event => {
    if (event.target.name === 'weekend') {
      props.setWeekend(event.target.checked);
    } else if (event.target.name === 'preschool') {
      props.setPreschool(event.target.checked);
    }
  }

  return(
    <div>
      <MyGrid container spacing={3} className={classes.sectionEnd}>
        <MyGrid item xs={12}>
          <Typography variant='subtitle1' color='textPrimary'>月会費（ミニマムコース）・$40</Typography>
        </MyGrid>
        <MyGrid item xs={12}>
          <FormControl component="fieldset" className={classes.formControl} fullWidth>
            <FormLabel component="legend">追加クラスを選んでください</FormLabel>
            <FormGroup>
              {/* <FormControlLabel
                control={<Checkbox checked={props.weekend} onChange={handlePlanChange} name="weekend" />}
                label={
                  <Typography variant='subtitle2' color='textSecondary'>土日クラス・+$10</Typography>
                }
              /> */}
              <MyGrid container spacing={3} className={classes.sectionEnd}>
                <MyGrid item xs={6}>
                  <FormControlLabel
                    control={<Checkbox checked={props.preschool} onChange={handlePlanChange} name="preschool" />}
                    label={
                      <Typography variant='subtitle2' color='textSecondary'>未就学児クラス・+$10</Typography>
                    }
                  />
                </MyGrid>
                <MyGrid item xs={6}>
                  <Autocomplete
                    id='preschool'
                    name='preschool'
                    options={props.preschoolInfo}
                    getOptionLabel={(option) => option.size < option.limit ? `${option.name}（空席${option.limit-option.size}名様）` : `${option.name}（満員）`}
                    value={props.preschoolId}
                    onChange={(event, value) => {
                      props.setPreschoolId(value);
                    }}
                    renderInput={params => <TextField {...params} label="参加したい時間帯" />}
                    disableClearable
                    disabled={!props.preschool}
                    getOptionDisabled={option => option.size >= option.limit}
                  />
                </MyGrid>
              </MyGrid>
            </FormGroup>
            <Divider />
            <FormHelperText>
              <Typography variant='subtitle1' color='textSecondary'>請求詳細</Typography>
              <Typography variant='body2' color='textPrimary'>本日</Typography>
              <Typography variant='body2' color='textSecondary'>・$0（30日間の無料トライアル）</Typography>
              <Typography variant='body2' color='textPrimary'>
                30日後
              </Typography>
              <Typography variant='body2' color='textSecondary' className={props.signupFeeStatus !== 'pay_full' ? classes.strikethrough : null}>
                ・入会費（$100）
              </Typography>
              {props.signupFeeStatus === 'referral' ?
                <Typography variant='caption' color='textSecondary'>
                  <Check color='secondary' fontSize='small' style={{ color: green[500] }} />
                  紹介
                </Typography> :
                null
              }
              {props.signupFeeStatus === 'pay_10' ?
                <Typography variant='caption' color='textSecondary'>
                  <Check color='secondary' fontSize='small' style={{ color: green[500] }} />
                  $10（アンバサダー）
                </Typography> :
                null
              }
              <Typography variant='body2' color='textSecondary'>
                {props.weekend && props.preschool ? 
                  <Typography variant='body2' color='textSecondary' display='inline'>・$50</Typography> :
                  !(props.weekend || props.preschool) ?
                    <Typography variant='body2' color='textSecondary' display='inline'>・$40</Typography> :
                    <Typography variant='body2' color='textSecondary' display='inline'>・$50</Typography>
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
            control={<Checkbox color="primary" checked={props.agreed} onChange={e => props.setAgreed(e.target.checked)} />}
            label="利用規約に同意します"
            labelPlacement="end"
          />
        </Grid>
      </Grid>
    </div>
  );
}