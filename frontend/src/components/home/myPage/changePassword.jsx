import React, { Component, useState, useEffect } from 'react';
import moment from 'moment-timezone';
import { styled, makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Person, CreditCard, LocationOn } from '@material-ui/icons';
import { Alert, Autocomplete } from '@material-ui/lab'
import {  
  Button,
  Grid,
  Snackbar,
  TextField,
} from '@material-ui/core';

import axiosInstance from '../../../axiosApi';
import { gradeMappings, timeZoneNames, getUserIdFromToken } from '../../../util';
import StudentProfile, { Subscription } from './studentPage';


const MyGrid = styled(Grid)({
  alignItems: 'flex-start',
});

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
}));


export default function ChangePassword(props) {
  const classes = useStyles();
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axiosInstance.post(`/yoyaku/users/${getUserIdFromToken()}/change_password/`, {
      newPassword: newPassword,
    });
    props.setSuccessMessage('パスワードを変更されました。')
    props.setSuccessSnackbarOpen(true);
    props.setChangePassword(false);
  }

  return(
    <div>
      <form onSubmit={handleSubmit}>
        <MyGrid container spacing={3} className={classes.sectionEnd}>
          <MyGrid item xs={12}>
            <TextField id='newPassword' name='newPassword' type='password' label='新しいパスワード' value={newPassword} onChange={e => setNewPassword(e.target.value)} 
            helperText='半角英数・記号（e.g. !@#%*.）７文字以上' required fullWidth />
          </MyGrid>
          <MyGrid item xs={12}>
            <TextField id='newPasswordConfirm' name='newPasswordConfirm' type='password' label='新しいパスワードを確認' value={confirmNewPassword} error={newPassword !== confirmNewPassword}
            onChange={e => setConfirmNewPassword(e.target.value)} required fullWidth />
          </MyGrid>
        </MyGrid>
        <Button type='button' onClick={() => {props.setChangePassword(false)}} className={classes.backButton}>
          戻る
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={newPassword.length < 8 || confirmNewPassword !== newPassword}>
          パスワードを変更
        </Button>
      </form>
    </div>
  );
}