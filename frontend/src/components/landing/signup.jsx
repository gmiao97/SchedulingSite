import React, { Component, useState } from 'react';
import { useHistory, Prompt } from "react-router-dom"
import moment from 'moment-timezone';
import { styled, makeStyles } from '@material-ui/core/styles';
import { DatePicker } from '@material-ui/pickers';
import Alert from '@material-ui/lab/Alert';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Snackbar,
  Backdrop,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tooltip,
} from '@material-ui/core';

import axiosInstance from '../../axiosApi';
import StripeSubscriptionCheckout from '../stripeSubscriptionCheckout';
import { 
  gradeMappings, 
  timeZoneNames, 
  AccountRegistrationError, 
  CreatePaymentMethodError,
  CreateSubscriptionError,
  RequiresActionError,
  RequiresPaymentMethodError,
} from '../../util';


const MyGrid = styled(Grid)({
  alignItems: "flex-end",
});

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  stepContent: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));


export default function Signup(props) {
  const classes = useStyles();
  const history = useHistory();
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [warningSnackbarOpen, setWarningSnackbarOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [passwordMatch, setPasswordMatch] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [cardEntered, setCardEntered] = useState(false);
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    user_type: 'STUDENT',
    time_zone: 'America/New_York',
    phone_number: '',
    birthday: moment().format('YYYY-MM-DD'),
    student_profile: {
      school_name: '',
      school_grade: '-1',
    },
    teacher_profile: {
      association: '',
    },
  });
  const [newUserInfo, setNewUserInfo] = useState({
    email: "",
  });
  const studentSteps = ['ユーザータイプを選択', 'プロフィール設定', '支払い情報'];
  const teacherSteps = ['ユーザータイプを選択', 'プロフィール設定', '確認'];
  const steps = signupForm.user_type === "STUDENT" ? studentSteps : teacherSteps;

  const handleChange = event => {
    setSignupForm({
      ...signupForm,
      [event.target.name]: event.target.value,
    });
  }


  const handleSnackbarClose = (event, reason) => {
    setSuccessSnackbarOpen(false);
    setErrorSnackbarOpen(false);
    setWarningSnackbarOpen(false);
  }

  const handleNextStep = (event) => {
    event.preventDefault();
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  };

  const handlePrevStep = () => {
    setActiveStep(prevActiveStep => prevActiveStep - 1);
  };

  const handleStepReset = () => {
    setActiveStep(0);
  };

  const handleDateChange = (name, date) => {
    setSignupForm({
      ...signupForm,
      [name]: moment(date).format('YYYY-MM-DD'),
    });
  }

  const handleChangeStudentProfile = event => {
    setSignupForm({
      ...signupForm,
      student_profile: {
        ...signupForm.student_profile,
        [event.target.name]: event.target.value,
      },
    });
  }

  const handleChangeTeacherProfile = event => {
    setSignupForm({
      ...signupForm,
      teacher_profile: {
        ...signupForm.teacher_profile,
        [event.target.name]: event.target.value,
      },
    });
  }

  // TODO error handling and validation
  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }
    
    if (signupForm.user_type === 'STUDENT') {
      delete signupForm.teacher_profile;
    } else {
      delete signupForm.student_profile;
    }

    if (!signupForm.password) { 
      delete signupForm.password; 
    }
    if (!signupForm.username) { 
      delete signupForm.username; 
    }

    setBackdropOpen(true);
    try {
      const response = await axiosInstance.post('/yoyaku/users/', signupForm);
      if (response.data.error) {
        throw new AccountRegistrationError(response.data.error);
      }
      setNewUserInfo({
        ...newUserInfo,
        email: signupForm.email.slice(),
      });

      if (signupForm.user_type === 'STUDENT') {
        await handleStripeSubmit(response.data.stripeCustomerId);
      }

      setActiveStep(prevActiveStep => prevActiveStep + 1);
      setSuccessSnackbarOpen(true);
    } catch(err) {
      if (err instanceof AccountRegistrationError) {
        console.error('[AccountRegistrationError]', err);
        handleStepReset();
        setError(err.message);
        setErrorSnackbarOpen(true);
      } else if (err instanceof CreatePaymentMethodError) {
        console.error('[CreatePaymentMethodError]', err);
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        setWarning(err.message);
        setWarningSnackbarOpen(true);
      } else if (err instanceof CreateSubscriptionError) {
        console.error('[CreateSubscriptionError]', err);
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        setWarning(err.message);
        setWarningSnackbarOpen(true);
      } else if (err instanceof RequiresActionError) {
        console.error('[RequiresActionError]', err);
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        setWarning(err.message);
        setWarningSnackbarOpen(true);
      } else if (err instanceof RequiresPaymentMethodError) {
        console.error('[RequiresPaymentMethodError]', err);
        setActiveStep(prevActiveStep => prevActiveStep + 1);
        setWarning(err.message);
        setWarningSnackbarOpen(true);
      } else {
        handleStepReset();
        setError("登録できませんでした。ウェブサイトのアドミンに連絡して下さい。");
        setErrorSnackbarOpen(true);
      }
    } finally {
      setBackdropOpen(false);
      setSignupForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        user_type: 'STUDENT',
        time_zone: 'America/New_York',
        phone_number: '',
        birthday: moment().format('YYYY-MM-DD'),
        student_profile: {
          school_name: '',
          school_grade: '-1',
        },
        teacher_profile: {
          association: '',
        },
      });
      setPasswordMatch('');
    }
  }

  const handleStripeSubmit = async (customerId) => {
    const cardElement = elements.getElement(CardElement);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      throw new CreatePaymentMethodError('Account created successfully but payment method failed. Please try again after logging in.');
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      const paymentMethodId = paymentMethod.id;
      await createSubscription(customerId, paymentMethodId, selectedPrice);
    }
  };

  const createSubscription = async (customerId, paymentMethodId, priceId) => {
    const response = await axiosInstance.post('/yoyaku/stripe-subscription/', {
      customerId: customerId,
      paymentMethodId: paymentMethodId,
      priceId: priceId,
    });

    if (response.data.error) {
      throw new CreateSubscriptionError('Account created successfully but subscription failed with error: ' + response.data.error);
    }
    const subscription = response.data;
    
    console.log(subscription);
    
    // handle requires_action and requires_payment_method
    const {pending_setup_intent} = subscription;
    if (pending_setup_intent) {
      const {client_secret, status} = subscription.pending_setup_intent;
      if (status === 'requires_action') {
        const response = await stripe.confirmCardSetup(client_secret);
          if (response.error) {
            throw new RequiresActionError('Payment could not be authenticated. Please update payment method in account settings.');
          } else {
            console.log('requires_action succeeded');
          }
      } else if (status === 'requires_payment_method') {
        throw new RequiresPaymentMethodError('Payment declined. Please update payment method in account settings.')
      }
    }
  }

  // const retryWithNewPayment = async (customerId, paymentMethodId, priceId) => {
   
  // }

  const getStepContent = stepIndex => {
    switch (stepIndex) {
      case 0:
        return(
          <FormControl component="fieldset">
            <FormLabel component="legend">ユーザータイプを選択して下さい</FormLabel>
            <RadioGroup id="user_type" name="user_type" value={signupForm.user_type} onChange={handleChange}>
              <FormControlLabel value="STUDENT" control={<Radio />} label="生徒" />
              <FormControlLabel value="TEACHER" control={<Radio />} label="先生" />
            </RadioGroup>
          </FormControl>
        );
      case 1:
        return(
          <form id="signupForm" onSubmit={handleNextStep}>
            <GeneralSignup 
              state={signupForm}
              passwordMatch={passwordMatch}
              setPasswordMatch={setPasswordMatch}
              onChange={handleChange}
              onDateChange={handleDateChange}
            />
            {signupForm.user_type === "STUDENT" ? 
              <StudentProfileSignup
                state={signupForm.student_profile} 
                onChange={handleChangeStudentProfile}
              /> :
              <TeacherProfileSignup
                state={signupForm.teacher_profile} 
                onChange={handleChangeTeacherProfile}
              />
            }
          </form>
        );
      case 2:
        return(
          signupForm.user_type === "STUDENT" ?
            <StripeSubscriptionCheckout 
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              setError={setError}
              setErrorSnackbarOpen={setErrorSnackbarOpen}
              setCardEntered={setCardEntered}
            /> :
            <Typography className={classes.stepContent} color="secondary" component='div'>
              Please confirm<Typography display="inline" color="primary"> teacher </Typography>profile information and complete registration.
            </Typography>
        );
      default:
        return 'Unknown stepIndex';
    }
  }

  const getStepButton = stepIndex => {
    switch (stepIndex) {
      case 0:
        return(
          <Button variant="contained" color="primary" type="button" onClick={handleNextStep}>
            次へ
          </Button>
        );
      case 1:
        let nextDisabled = false;
        let tooltipMessage = '';
        if (signupForm.password !== passwordMatch) {
          nextDisabled = true;
          tooltipMessage = 'Passwords do not match';
        }
        if (signupForm.password.length < 8) {
          nextDisabled = true;
          tooltipMessage = 'Password must be at least 8 characters';
        }
        return(
          <Tooltip title={tooltipMessage}>
            <span>
              <Button variant="contained" color="primary" type="submit" form="signupForm" disabled={nextDisabled}>
                次へ
              </Button>
            </span>
          </Tooltip>
        );
      case 2:
        return(
          <Button variant="contained" color="primary" type="button" onClick={handleSubmit} disabled={signupForm.user_type === 'STUDENT' && !cardEntered}>
            登録
          </Button>
        );
      default:
        return 'Unknown stepIndex';
    }
  }

  return(
    <div>
      <Paper elevation={24}>
        <Box p={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          {activeStep === steps.length ?
            <div>
              <Typography className={classes.stepContent} component='div'>
                Registration Complete! An confirmation email has been sent to <Typography display="inline" color="secondary">{newUserInfo.email}</Typography>.
                Welcome to Success Academy! 
                </Typography>
              <Button variant="contained" color="primary" onClick={() => history.push("/")}>Login</Button>
            </div> :
            <div>
              <div>
                {getStepContent(activeStep)}
              </div>
              <Button disabled={activeStep === 0} onClick={handlePrevStep} className={classes.backButton}>
                戻る
              </Button>
              {getStepButton(activeStep)}
            </div>
          }
        </Box>
        <Snackbar open={successSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="success" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            登録完了。Success Academyへようこそ！ 
          </Alert>
        </Snackbar>
        <Snackbar open={errorSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="error" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            {error}
          </Alert>
        </Snackbar>
        <Snackbar open={warningSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="warning" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            {warning}
          </Alert>
        </Snackbar>
      </Paper>
      <Backdrop className={classes.backdrop} open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}       


export function GeneralSignup(props) {
  return(
      <MyGrid container spacing={3}>
          <MyGrid item xs={12}>
            <TextField id='username' name='username' type='text' label='ユーザーID' value={props.state.username} onChange={props.onChange} required fullWidth variant='filled' />
          </MyGrid>
          <MyGrid item xs={12} sm={6}>
            <TextField id='password' name='password' type='password' label='パスワード' value={props.state.password} onChange={props.onChange} required fullWidth variant='filled' />
          </MyGrid>
          <MyGrid item xs={12} sm={6}>
            <TextField id='confirmPassword' name='confirmPassword' type='password' label='パスワード確認' value={props.passwordMatch} 
            onChange={e => props.setPasswordMatch(e.target.value)} required fullWidth variant='filled' error={props.passwordMatch !== props.state.password} />
          </MyGrid>
          <MyGrid item xs={12} sm={6}>
            <TextField id='first_name' name='first_name' type='text' label='名' value={props.state.first_name} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item xs={12} sm={6}>
            <TextField id='last_name' name='last_name' type='text' label='姓' value={props.state.last_name} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item xs={12} sm={6}>
            <TextField id='email' name='email' type='email' label='メールアドレス' value={props.state.email} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item xs={12} sm={6}>
            <TextField id='phone_number' name='phone_number' type='text' label='電話番号' value={props.state.phone_number} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item xs={6}>
            <DatePicker
              id='birthday'
              name='birthday'
              label="生年月日"
              value={props.state.birthday}
              onChange={date => props.onDateChange('birthday', date)}
              format='YYYY-MM-DD'
            />
          </MyGrid>
          <MyGrid item xs={6}>
            <InputLabel id="time-zone-label">
              <Typography variant="caption">時間帯</Typography>
            </InputLabel>
            <Select
              id="time_zone"
              name="time_zone"
              labelId="time-zone-label"
              value={props.state.time_zone}
              onChange={props.onChange}
            >
              {timeZoneNames.map((value, index) => 
                <MenuItem key={index} value={value}>{value}</MenuItem>
              )}
            </Select>
          </MyGrid>
      </MyGrid>
  );
}


export function StudentProfileSignup(props) {
  const classes = useStyles();
  const schoolGrades = [];
  for (let grade of gradeMappings) {
    schoolGrades.push(grade);
  }

  return(
    <MyGrid className={classes.sectionEnd} container spacing={3}>
      <MyGrid item xs={12} sm={6}>
        <TextField id='school_name' name='school_name' type='text' label='学校名' value={props.state.school_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <InputLabel id="school-grade-label">
          <Typography variant="caption">学年</Typography>
        </InputLabel>
        <Select
          id="school_grade"
          name="school_grade"
          labelId="school-grade-label"
          value={props.state.school_grade}
          onChange={props.onChange}
        >
          {schoolGrades.map((value, index) => 
            <MenuItem key={index} value={value[0]}>{value[1]}</MenuItem>
          )}
        </Select>
      </MyGrid>
      <MyGrid item xs={12}>
      </MyGrid>
    </MyGrid>
  );
}


export function TeacherProfileSignup(props) {
  const classes = useStyles();
  return(
    <MyGrid className={classes.sectionEnd} container spacing={3}>
      <MyGrid item xs={12} sm={6}>
        <TextField id='association' name='association' type='text' label='所属' value={props.state.association} onChange={props.onChange} required fullWidth />
      </MyGrid>
    </MyGrid>
  );
}
