import React, { useState, useEffect } from 'react';
import { useHistory } from "react-router-dom"
import moment from 'moment-timezone';
import { styled, makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Autocomplete, Alert } from '@material-ui/lab'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { green } from '@material-ui/core/colors';
import { Check } from '@material-ui/icons';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Snackbar,
  Backdrop,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
} from '@material-ui/core';

import axiosInstance from '../../../axiosApi';
import StripeSubscriptionCheckout from '../../stripeSubscriptionCheckout';
import SelectPlan from './selectPlan';
import { MyAvatar } from '../../home/home';
import { 
  gradeMappings, 
  timeZoneNames, 
  avatarMapping,
  AccountRegistrationError, 
  CardError,
  SetupIntentError,
} from '../../../util';


const MyGrid = styled(Grid)({
  alignItems: 'flex-start',
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
  strikethrough: {
    textDecoration: 'line-through',
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
  const [referralCode, setReferralCode] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [cardEntered, setCardEntered] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [usernameList, setUsernameList] = useState([]);
  const [referralCodeList, setReferralCodeList] = useState([]);
  const [weekend, setWeekend] = useState(false);
  const [preschool, setPreschool] = useState(false);
  const [stripePrices, setStripePrices] = useState({});
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    user_type: 'STUDENT',
    time_zone: 'America/New York',
    phone_number: '',
    birthday: moment().format('YYYY-MM-DD'),
    avatar: 'bear',
    student_profile: {
      school_name: '',
      school_grade: -1,
      referrer: '',
      should_pay_signup_fee: true,
    },
  });
  const [newUserInfo, setNewUserInfo] = useState({
    email: "",
  });

  const steps = ['プロフィール設定', '紹介コード確認', 'プラン選択', '支払い情報'];


  useEffect(() => {
    getUsernameList();
  }, [signupForm.username]);

  useEffect(() => {
    getReferralCodeList();
    getPlans();
  }, []);

  useEffect(() => {
    if (weekend && preschool) {
      setSelectedPrice(stripePrices['mpw']);
    } else if (weekend) {
      setSelectedPrice(stripePrices['mw']);
    } else if (preschool) {
      setSelectedPrice(stripePrices['mp']);
    } else {
      setSelectedPrice(stripePrices['m']);
    }
  }, [weekend, preschool, stripePrices]);

  const getPlans = async () => {
    try {
      const priceResponse = await axiosInstance.get('/yoyaku/stripe-prices/');
      var stripePriceMap = {};
      for (const price of priceResponse.data.data) {
        stripePriceMap[price.metadata.identifier] = price.id;
      }
      setStripePrices(stripePriceMap);
    } catch(err) {
      console.error(err.stack);
      setError('サブスクリプションプランの読み込みできませんでした。アドミンに連絡してください。');
      setErrorSnackbarOpen(true);
    }
  }

  const getUsernameList = async () => {
    const response = await axiosInstance.get('/yoyaku/users/username_list/');
    setUsernameList(response.data);
  }

  const getReferralCodeList = async () => {
    const response = await axiosInstance.get('/yoyaku/users/referral_code_list/');
    setReferralCodeList(response.data);
  }

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
    setDateError(!date || !date.isValid());
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

  // TODO error handling and validation
  const handleSubmit = async () => {
    if (!stripe || !elements) {
      return;
    }

    if (!signupForm.password) { 
      delete signupForm.password; 
    }
    if (!signupForm.username) { 
      delete signupForm.username; 
    }

    setBackdropOpen(true);
    try {
      let response = null;
      if (signupForm.user_type === 'STUDENT') {
        const paymentMethodId = await handleStripeSubmit();
        response = await axiosInstance.post('/yoyaku/users/', {
          ...signupForm,
          time_zone: signupForm.time_zone.replace(' ', '_'),
          paymentMethodId: paymentMethodId,
          priceId: selectedPrice,
        });
      } else {
        response = await axiosInstance.post('/yoyaku/users/', {
          ...signupForm,
          time_zone: signupForm.time_zone.replace(' ', '_'),
        });
      }

      if (response.data.error) {
        throw new AccountRegistrationError(response.data.error);
      }
      setNewUserInfo({
        ...newUserInfo,
        email: signupForm.email.slice(),
      });

      setActiveStep(prevActiveStep => prevActiveStep + 1);
      setSuccessSnackbarOpen(true);
      setSignupForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        user_type: 'STUDENT',
        time_zone: 'America/New York',
        phone_number: '',
        birthday: moment().format('YYYY-MM-DD'),
        avatar: 'bear',
        student_profile: {
          school_name: '',
          school_grade: '-1',
          referrer: '',
          should_pay_signup_fee: true,
        },
      });
      setPasswordMatch('');
      setReferralCode('');
    } catch(err) {
      if (err instanceof SetupIntentError) {
        console.error('[SetupIntentError]', err);
        setError(err.message);
        setErrorSnackbarOpen(true);
      } else if (err instanceof AccountRegistrationError) {
        console.error('[AccountRegistrationError]', err);
        setError(err.message);
        setErrorSnackbarOpen(true);
      } else if (err instanceof CardError) {
        console.error('[CardError]', err);
        setWarning(err.message);
        setWarningSnackbarOpen(true);
      } else {
        console.log(err);
        setError("登録できませんでした。サポートに連絡して下さい。");
        setErrorSnackbarOpen(true);
      }
    } finally {
      setBackdropOpen(false);
    }
  }

  const handleStripeSubmit = async () => {
    const cardElement = elements.getElement(CardElement);

    const setupResponse = await axiosInstance.get('/yoyaku/stripe-setup-intent/');
    if (setupResponse.data.error) {
      throw new SetupIntentError(setupResponse.data.error);
    }

    const confirmResponse = await stripe.confirmCardSetup(setupResponse.data.client_secret, {
      payment_method: {
        type: 'card',
        card: cardElement,
      },
    });
    if (confirmResponse.error) {
      console.error(confirmResponse.error);
      throw new CardError(confirmResponse.error.message);
    } else {
      return confirmResponse.setupIntent.payment_method;
    }
  }

  const getStepContent = stepIndex => {
    switch (stepIndex) {
      case 0:
        return(
          <form id="signupForm" onSubmit={handleNextStep}>
            <StudentSignup 
              usernameList={usernameList}
              referralCodeList={referralCodeList}
              passwordMatch={passwordMatch}
              setPasswordMatch={setPasswordMatch}
              referralCode={referralCode}
              setReferralCode={setReferralCode}
              onChange={handleChange}
              onStudentChange={handleChangeStudentProfile}
              signupForm={signupForm}
              setSignupForm={setSignupForm}
              onDateChange={handleDateChange}
            />
          </form>
        );
      case 1:
        return (
          <MyGrid container spacing={3} className={classes.sectionEnd}>
            <MyGrid item xs={12}>
              <Typography color='textSecondary' variant='subtitle1'>紹介コードをお持ちですか？紹介された方は入会費（$100）が無料になります</Typography>
            </MyGrid>
            <MyGrid item xs={12} sm={6}>
              <TextField id='referrer' name='referrer' type='text' label='紹介者' value={signupForm.student_profile.referrer} onChange={handleChangeStudentProfile} fullWidth />
            </MyGrid>
            <MyGrid item xs={12} sm={6}>
              <TextField 
                id='received_referral_code' 
                name='received_referral_code' 
                type='text' 
                label='紹介コード' 
                value={referralCode} 
                error={referralCode.length !== 0 && !referralCodeList.includes(referralCode)}
                helperText={referralCode.length !== 0 && !referralCodeList.includes(referralCode) ? 'そのコード見つかりませんでした' : null}
                onChange={e => {
                  setReferralCode(e.target.value);
                  setSignupForm({
                    ...signupForm,
                    student_profile: {
                      ...signupForm.student_profile,
                      should_pay_signup_fee: !referralCodeList.includes(e.target.value),
                    },
                  });
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {referralCodeList.includes(referralCode) ? <Check color='secondary' style={{ color: green[500] }} /> : null}
                    </InputAdornment>
                  ),
                }}
              />
            </MyGrid>
          </MyGrid>
        );
      case 2:
        return(
          <SelectPlan 
            setSelectedPrice={setSelectedPrice}
            isReferral={referralCodeList.includes(referralCode)}
            setError={setError}
            setErrorSnackbarOpen={setErrorSnackbarOpen}
            agreed={agreed}
            setAgreed={setAgreed}
            weekend={weekend}
            setWeekend={setWeekend}
            preschool={preschool}
            setPreschool={setPreschool}
          />
        );
      case 3:
        return(
          <StripeSubscriptionCheckout 
            selectedPrice={selectedPrice}
            setCardEntered={setCardEntered}
          /> 
        );
      default:
        return 'Unknown stepIndex';
    }
  }

  const getStepButton = stepIndex => {
    switch (stepIndex) {
      case 0:
        let nextDisabled = false;
        let tooltipMessage = '';
        if (dateError) {
          nextDisabled = true;
          tooltipMessage = '生年月日を入力して下さい';
        }
        if (signupForm.password !== passwordMatch) {
          nextDisabled = true;
          tooltipMessage = 'パスワードが一致していません';
        }
        if (signupForm.password.length < 8) {
          nextDisabled = true;
          tooltipMessage = 'パスワードは７文字以上入力して下さい';
        }
        if (usernameList.includes(signupForm.username)) {
          nextDisabled = true;
          tooltipMessage = 'そのユーザー名はすでに使われています';
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
      case 1:
        return(
          <Button variant="contained" color="primary" type="button" onClick={handleNextStep}>
            次へ
          </Button>
        );
      case 2:
        return(
          <Button variant="contained" color="primary" type="button" onClick={handleNextStep} disabled={!agreed}>
            次へ
          </Button>
        );
      case 3:
        return(
          <Button variant="contained" color="primary" type="button" onClick={handleSubmit} disabled={!cardEntered}>
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
                登録完了！確認メールが<Typography display="inline" color="secondary">{newUserInfo.email}</Typography>に送信されました。
                Success Academyへようこそ！
                </Typography>
              <Button variant="contained" color="primary" onClick={() => history.push("/")}>ログイン</Button>
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


export function StudentSignup(props) {
  const classes = useStyles();
  const schoolGrades = Array.from(gradeMappings.entries());
  const avatars = Array.from(avatarMapping.keys());

  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);

  return(
    <MyGrid container spacing={3} className={classes.sectionEnd}>
      <MyGrid item xs={12} sm={2}>
        <IconButton onClick={() => setAvatarDialogOpen(true)}>
          <MyAvatar avatar={props.signupForm.avatar} />
        </IconButton>
        <Dialog open={avatarDialogOpen} onClose={() => setAvatarDialogOpen(false)}>
          <DialogTitle>アバター選択</DialogTitle>
          <DialogContent>
            {avatars.map(avatar => 
              <IconButton 
                onClick={() => {
                  props.setSignupForm({...props.signupForm, avatar: avatar});
                  setAvatarDialogOpen(false);
                }}
                key={avatar}
              >
                <MyAvatar avatar={avatar} />
              </IconButton>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarDialogOpen(false)} color="primary">
              キャンセル
            </Button>
          </DialogActions>
        </Dialog>
      </MyGrid>
      <MyGrid item xs={12} sm={10}>
        <TextField id='username' name='username' type='text' label='ユーザー名' value={props.signupForm.username} onChange={props.onChange} required fullWidth variant='filled' 
        error={props.usernameList.includes(props.signupForm.username)} helperText={props.usernameList.includes(props.signupForm.username) ? 'そのユーザー名はすでに使われています' : '半角英数・記号'} />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='password' name='password' type='password' label='パスワード' value={props.signupForm.password} onChange={props.onChange} required fullWidth variant='filled' 
        helperText='半角英数・記号（e.g. !@#%*.）７文字以上' />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='confirmPassword' name='confirmPassword' type='password' label='パスワード確認' value={props.passwordMatch} 
        onChange={e => props.setPasswordMatch(e.target.value)} required fullWidth variant='filled' error={props.passwordMatch !== props.signupForm.password} />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='last_name' name='last_name' type='text' label='生徒姓' value={props.signupForm.last_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='first_name' name='first_name' type='text' label='生徒名' value={props.signupForm.first_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={5}>
        <TextField id='school_name' name='school_name' type='text' label='生徒学校名' value={props.signupForm.student_profile.school_name} onChange={props.onStudentChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={6} sm={3}>
        <Autocomplete
          id='school_grade'
          name='school_grade'
          options={schoolGrades}
          getOptionLabel={option => option[1]}
          getOptionSelected={(option, value) => option[1] === value[1]}
          // defaultValue={schoolGrades[0]}
          value={[props.signupForm.student_profile.school_grade, gradeMappings.get(props.signupForm.student_profile.school_grade)]}
          onChange={(event, value) => {
            props.setSignupForm({
              ...props.signupForm,
              student_profile: {
                ...props.signupForm.student_profile,
                school_grade: value[0],
              },
            });
          }}
          renderInput={(params) => <TextField {...params} label="生徒学年" />}
          disableClearable
        />
      </MyGrid>
      <MyGrid item xs={6} sm={4}>
        <KeyboardDatePicker
          id='birthday'
          name='birthday'
          variant='inline'
          label="生徒生年月日"
          value={props.signupForm.birthday}
          onChange={date => props.onDateChange('birthday', date)}
          format='YYYY-MM-DD'
          invalidDateMessage='正しい日にちを入力して下さい'
          maxDateMessage='正しい日にちを入力して下さい'
          minDateMessage='正しい日にちを入力して下さい'
        />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='email' name='email' type='email' label='保護者メールアド' value={props.signupForm.email} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='phone_number' name='phone_number' type='text' label='保護者電話番号' value={props.signupForm.phone_number} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item item xs={12} sm={6}>
        <Autocomplete
          id='time_zone'
          name='time_zone'
          options={timeZoneNames}
          value={props.signupForm.time_zone}
          onChange={(event, value) => {
            props.setSignupForm({
              ...props.signupForm,
              time_zone: value,
            });
          }}
          renderInput={(params) => <TextField {...params} label="地域/タイムゾーン" />}
          disableClearable
        />
      </MyGrid>
    </MyGrid>
  );
}

