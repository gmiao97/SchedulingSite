import React, { Component, useState, useEffect } from 'react';
import { useHistory, Prompt } from "react-router-dom"
import moment from 'moment-timezone';
import { styled, makeStyles } from '@material-ui/core/styles';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Autocomplete, Alert } from '@material-ui/lab'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link as MaterialLink,
  Checkbox,
} from '@material-ui/core';

import axiosInstance from '../../axiosApi';
import StripeSubscriptionCheckout from '../stripeSubscriptionCheckout';
import { 
  gradeMappings, 
  timeZoneNames, 
  AccountRegistrationError, 
  CardError,
  SetupIntentError,
} from '../../util';


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
  const [agreed, setAgreed] = useState(false);
  const [dateError, setDateError] = useState(false);
  const [usernameList, setUsernameList] = useState([]);
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
    student_profile: {
      school_name: '',
      school_grade: -1,
      referrer: '',
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


  useEffect(() => {
    getUsernameList();
  }, [signupForm.username]);

  const getUsernameList = async () => {
    const response = await axiosInstance.get('/yoyaku/users/username_list/');
    setUsernameList(response.data);
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
        student_profile: {
          school_name: '',
          school_grade: '-1',
        },
        teacher_profile: {
          association: '',
        },
      });
      setPasswordMatch('');
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
          <FormControl component="fieldset">
            <FormLabel component="legend">ユーザータイプを選択して下さい</FormLabel>
            <RadioGroup id="user_type" name="user_type" value={signupForm.user_type} onChange={handleChange}>
              <FormControlLabel value="STUDENT" control={<Radio />} label="生徒" />
              <FormControlLabel value="TEACHER" control={<Radio />} label="先生" disabled />
            </RadioGroup>
          </FormControl>
        );
      case 1:
        return(
          <form id="signupForm" onSubmit={handleNextStep}>
            {signupForm.user_type === "STUDENT" ? 
              <StudentSignup 
                state={signupForm}
                usernameList={usernameList}
                passwordMatch={passwordMatch}
                setPasswordMatch={setPasswordMatch}
                onChange={handleChange}
                onStudentChange={handleChangeStudentProfile}
                signupForm={signupForm}
                setSignupForm={setSignupForm}
                onDateChange={handleDateChange}
              /> :
              <TeacherSignup
                state={signupForm}
                usernameList={usernameList}
                passwordMatch={passwordMatch}
                setPasswordMatch={setPasswordMatch}
                onChange={handleChange}
                onTeacherChange={handleChangeTeacherProfile}
                signupForm={signupForm}
                setSignupForm={setSignupForm}
                onDateChange={handleDateChange}
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
              agreed={agreed}
              setAgreed={setAgreed}
            /> :
            <Typography className={classes.stepContent} color="textSecondary" component='div'>
              プロフィール情報を確認して<Typography display="inline" color="secondary">先生</Typography>として登録
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
          tooltipMessage = 'そのユーザーIDがすでに使われています';
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
          <Button variant="contained" color="primary" type="button" onClick={handleSubmit} disabled={!agreed || (signupForm.user_type === 'STUDENT' && !cardEntered)}>
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
  const schoolGrades = [];
  for (let grade of gradeMappings) {
    schoolGrades.push(grade);
  }

  const [dialogOpen, setDialogOpen] = useState(false);

  return(
    <MyGrid container spacing={3} className={classes.sectionEnd}>
      <MyGrid item xs={12}>
        <div>
          <Button variant="outlined" color="secondary" size='small' onClick={() => setDialogOpen(true)}>
            未就学児クラスご希望の方はこちらをクリックして下さい
          </Button>
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
            <DialogTitle>未就学児クラス希望の方</DialogTitle>
            <DialogContent>
              <DialogContentText>
                許可されたクラス番号をお持ちですか？お持ちでない方は下記のフォームから申請して下さい。
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <MaterialLink 
                href='https://docs.google.com/forms/d/e/1FAIpQLSejTfHCqYgJSySdlYnb6I_xTJpyAEl8B0MUAq5WqEPDpbl3OQ/viewform'
                target='_blank'
                rel='noopener noreferrer'
                color='secondary'
              >
                未就学児クラス希望フォームへ
              </MaterialLink>
            </DialogActions>
          </Dialog>
        </div>
      </MyGrid>
      <MyGrid item xs={12}>
        <TextField id='username' name='username' type='text' label='ユーザーID' value={props.state.username} onChange={props.onChange} required fullWidth variant='filled' 
        error={props.usernameList.includes(props.state.username)} helperText={props.usernameList.includes(props.state.username) ? 'そのユーザーIDがすでに使われています' : '半角英数・記号'} />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='password' name='password' type='password' label='パスワード' value={props.state.password} onChange={props.onChange} required fullWidth variant='filled' 
        helperText='半角英数・記号（e.g. !@#%*.）７文字以上' />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='confirmPassword' name='confirmPassword' type='password' label='パスワード確認' value={props.passwordMatch} 
        onChange={e => props.setPasswordMatch(e.target.value)} required fullWidth variant='filled' error={props.passwordMatch !== props.state.password} />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='last_name' name='last_name' type='text' label='生徒姓' value={props.state.last_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='first_name' name='first_name' type='text' label='生徒名' value={props.state.first_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={5}>
        <TextField id='school_name' name='school_name' type='text' label='生徒学校名' value={props.state.student_profile.school_name} onChange={props.onStudentChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={6} sm={3}>
        <Autocomplete
          id='school_grade'
          name='school_grade'
          options={schoolGrades}
          getOptionLabel={option => option[1]}
          getOptionSelected={(option, value) => option[1] === value[1]}
          // defaultValue={schoolGrades[0]}
          value={[props.state.student_profile.school_grade, gradeMappings.get(props.state.student_profile.school_grade)]}
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
          value={props.state.birthday}
          onChange={date => props.onDateChange('birthday', date)}
          format='YYYY-MM-DD'
          invalidDateMessage='正しい日にちを入力して下さい'
          maxDateMessage='正しい日にちを入力して下さい'
          minDateMessage='正しい日にちを入力して下さい'
        />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='email' name='email' type='email' label='保護者メールアド' value={props.state.email} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='phone_number' name='phone_number' type='text' label='保護者電話番号' value={props.state.phone_number} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item item xs={12} sm={6}>
        <Autocomplete
          id='time_zone'
          name='time_zone'
          options={timeZoneNames}
          value={props.state.time_zone}
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
      <MyGrid item xs={12} sm={6}>
        <TextField id='referrer' name='referrer' type='text' label='紹介者' value={props.state.student_profile.referrer} onChange={props.onStudentChange} fullWidth />
      </MyGrid>
    </MyGrid>
  );
}


export function TeacherSignup(props) {
  const classes = useStyles();
  
  return(
    <MyGrid container spacing={3} className={classes.sectionEnd}>
      <MyGrid item xs={12}>
        <TextField id='username' name='username' type='text' label='ユーザーID' value={props.state.username} onChange={props.onChange} required fullWidth variant='filled' 
        error={props.usernameList.includes(props.state.username)} helperText={props.usernameList.includes(props.state.username) ? 'そのユーザーIDはすでに使われています' : '半角英数・記号'} />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='password' name='password' type='password' label='パスワード' value={props.state.password} onChange={props.onChange} required fullWidth variant='filled'
        helperText='半角英数・記号（e.g. !@#%*.）７文字以上' />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='confirmPassword' name='confirmPassword' type='password' label='パスワード確認' value={props.passwordMatch} 
        onChange={e => props.setPasswordMatch(e.target.value)} required fullWidth variant='filled' error={props.passwordMatch !== props.state.password} />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='last_name' name='last_name' type='text' label='姓' value={props.state.last_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='first_name' name='first_name' type='text' label='名' value={props.state.first_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <KeyboardDatePicker
          id='birthday'
          name='birthday'
          variant='inline'
          label="生年月日"
          value={props.state.birthday}
          onChange={date => props.onDateChange('birthday', date)}
          format='YYYY-MM-DD'
          invalidDateMessage='正しい日にちを入力して下さい'
          maxDateMessage='正しい日にちを入力して下さい'
          minDateMessage='正しい日にちを入力して下さい'
        />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='email' name='email' type='email' label='メールアドレス' value={props.state.email} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='phone_number' name='phone_number' type='text' label='電話番号' value={props.state.phone_number} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <TextField id='association' name='association' type='text' label='所属' value={props.state.teacher_profile.association} onChange={props.onTeacherChange} required fullWidth />
      </MyGrid>
      <MyGrid item xs={12} sm={6}>
        <Autocomplete
          id='time_zone'
          name='time_zone'
          options={timeZoneNames}
          value={props.state.time_zone}
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
