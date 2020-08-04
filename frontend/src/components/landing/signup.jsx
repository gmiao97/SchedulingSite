import React, { Component, useState } from 'react';
import { useHistory } from "react-router-dom"
import moment from 'moment-timezone';
import { styled, makeStyles } from '@material-ui/core/styles';
import MomentUtils from "@date-io/moment";
import {
  MuiPickersUtilsProvider,
  DatePicker,
} from '@material-ui/pickers';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
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
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import axiosInstance from '../../axiosApi';
import { gradeMappings, timeZoneNames } from '../../util';
import PayPalButton from "../payPalButton";


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
  const [paidFor, setPaidFor] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [errorSnackbarOpen, setErrorSnackbarOpen] = useState(false);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const steps = ['Select user type', 'Create profile', 'Subscription payment'];
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

  const handleChange = event => {
    setSignupForm({
      ...signupForm,
      [event.target.name]: event.target.value,
    });
  }


  const handleSnackbarClose = (event, reason) => {
    setSuccessSnackbarOpen(false);
    setErrorSnackbarOpen(false);
  }

  const handleNextStep = () => {
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
  const handleSubmit = async event => {
    event.preventDefault();
    switch (signupForm.user_type) {
      case 'STUDENT':
        delete signupForm.teacher_profile;
        break;
      case 'TEACHER':
        delete signupForm.student_profile;
        break;
      default:
    }
    if (!signupForm.password) {
      delete signupForm.password;
    }
    if (!signupForm.username) {
      delete signupForm.username;
    }

    try {
      setBackdropOpen(true);
      const response = await axiosInstance.post('/yoyaku/users/', signupForm);
      setNewUserInfo({
        ...newUserInfo,
        email: signupForm.email.slice(),
      })
      handleNextStep();
      setSuccessSnackbarOpen(true);
      return response;
    } catch(err) {
      console.error(err.stack);
      handleStepReset();
      setErrorSnackbarOpen(true);
    } finally {
      setBackdropOpen(false);
      setSignupForm({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
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
    }
  }

  const getStepContent = stepIndex => {
    switch (stepIndex) {
      case 0:
        return(
          <FormControl component="fieldset">
            <FormLabel component="legend">I am registering as a</FormLabel>
            <RadioGroup id="user_type" name="user_type" value={signupForm.user_type} onChange={handleChange}>
              <FormControlLabel value="STUDENT" control={<Radio />} label="Student" />
              <FormControlLabel value="TEACHER" control={<Radio />} label="Teacher" />
            </RadioGroup>
          </FormControl>
        );
      case 1:
        return(
          <form id="signupForm" onSubmit={handleNextStep}>
            <GeneralSignup 
              state={signupForm}
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
        return(<PayPalButton />);
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
              <Typography className={classes.stepContent}>
                Registration Complete! An confirmation email has been sent to <Typography display="inline" color="primary">{newUserInfo.email}</Typography>.
                Welcome to Success Academy! 
                </Typography>
              <Button variant="contained" color="primary" onClick={() => history.push("/")}>Login</Button>
            </div> :
            <div>
              <div>
                {getStepContent(activeStep)}
              </div>
              <Button disabled={activeStep === 0} onClick={handlePrevStep} className={classes.backButton}>
                Back
              </Button>
              {activeStep === 0 ?
                <Button variant="contained" color="primary" type="button" onClick={handleNextStep}>
                  Next
                </Button> :
                (activeStep === 1 ?
                  <Button variant="contained" color="primary" type="submit" form="signupForm">
                    Next
                  </Button> :
                  <Button variant="contained" color="primary" type="button" onClick={handleSubmit}>
                    Register
                  </Button>)             
              }
            </div>
          }
        </Box>
        <Snackbar open={successSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="success" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            Registration successful! Welcome to Success Academy! 
          </Alert>
        </Snackbar>
        <Snackbar open={errorSnackbarOpen} onClose={handleSnackbarClose}>
          <Alert severity="error" variant="filled" elevation={24} onClose={handleSnackbarClose}>
            Registration failed. Please contact the administrator. 
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
          <MyGrid item sm={12} md={6}>
            <TextField id='first_name' name='first_name' type='text' label='First Name' value={props.state.first_name} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm={12} md={6}>
            <TextField id='last_name' name='last_name' type='text' label='Last Name' value={props.state.last_name} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm={12} md={6}>
            <TextField id='email' name='email' type='email' label='Email' value={props.state.email} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm={12} md={6}>
            <TextField id='phone_number' name='phone_number' type='text' label='Phone Number' value={props.state.phone_number} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm={12} md={6}>
            <DatePicker
              id='birthday'
              name='birthday'
              label="Date of Birth"
              value={props.state.birthday}
              onChange={date => props.onDateChange('birthday', date)}
              format='YYYY-MM-DD'
            />
          </MyGrid>
          <MyGrid item sm={12} md={6}>
            <InputLabel id="time-zone-label">
              <Typography variant="caption">Time Zone</Typography>
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
      <MyGrid item sm={12} md={6}>
        <TextField id='school_name' name='school_name' type='text' label='School Name' value={props.state.school_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item sm={12} md={6}>
        <InputLabel id="school-grade-label">
          <Typography variant="caption">School Grade</Typography>
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
        {/* <PayPalButton /> */}
      </MyGrid>
    </MyGrid>
  );
}


export function TeacherProfileSignup(props) {
  const classes = useStyles();
  return(
    <MyGrid className={classes.sectionEnd} container spacing={3}>
      <MyGrid item sm={12} md={6}>
        <TextField id='association' name='association' type='text' label='Association' value={props.state.association} onChange={props.onChange} required fullWidth />
      </MyGrid>
    </MyGrid>
  );
}
