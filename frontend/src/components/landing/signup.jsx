import React, { Component } from 'react';
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
  Tabs,
  Tab,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  Snackbar,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

import axiosInstance from '../../axiosApi';
import { gradeMappings, timeZoneNames } from '../../util';


const MyGrid = styled(Grid)({
  alignItems: "flex-end",
});

const useStyles = makeStyles(theme => ({
  sectionEnd: {
    marginBottom: theme.spacing(3),
  },
}));


class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

      activeTab: 0,
      successSnackbarOpen: false,
      errorSnackbarOpen: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange = event => {
    this.setState({
      [event.target.name]: event.target.value,
    });
  };

  handleTabChange = (event, newValue) => {
    this.setState({
      activeTab: newValue,
      user_type: newValue === 0 ? "STUDENT" : "TEACHER",
    });
  };

  handleSnackbarClose = (event, reason) => {
    this.setState({
      successSnackbarOpen: false,
      errorSnackbarOpen: false,
    });
  };

  handleDateChange = (name, date) => {
    this.setState({
      [name]: moment(date).format('YYYY-MM-DD'),
    })
  };

  handleChangeStudentProfile = event => {
    this.setState({
        student_profile: {
          ...this.state.student_profile,
          [event.target.name]: event.target.value,
        }
    });
  };

  handleChangeTeacherProfile = event => {
    this.setState({
        teacher_profile: {
          ...this.state.teacher_profile,
          [event.target.name]: event.target.value,
        }
    });
  };

  // TODO error handling and validation
  async handleSubmit(event) {
    event.preventDefault();
    switch (this.state.user_type) {
      case 'STUDENT':
        await Promise.resolve(this.setState({teacher_profile: null}));
        break;
      case 'TEACHER':
        await Promise.resolve(this.setState({student_profile: null}));
        break;
      default:
    }
    if (!this.state.password) {
      delete this.state.password;
    }
    if (!this.state.username) {
      delete this.state.username;
    }

    try {
      const response = await axiosInstance.post('/yoyaku/users/', this.state);
      this.setState({
        successSnackbarOpen: true,
      });
      return response;
    } catch(error) {
      console.log(error.stack);
      this.setState({
        errorSnackbarOpen: true,
      });
    } finally {
      this.setState({
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

  render() {
    return (
      <Paper elevation={24}>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          value={this.state.activeTab}
          onChange={this.handleTabChange}
        >
          <Tab label="Student" />
          <Tab label="Teacher" />
        </Tabs>

        <Box p={3}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <form onSubmit={this.handleSubmit}>
              <GeneralSignup 
                state={this.state}
                onChange={this.handleChange}
                onDateChange={this.handleDateChange}
              />
              {this.state.activeTab === 0 ? 
                <StudentProfileSignup
                  state={this.state.student_profile} 
                  onChange={this.handleChangeStudentProfile}
                /> :
                <TeacherProfileSignup
                  state={this.state.teacher_profile} 
                  onChange={this.handleChangeTeacherProfile}
                />
              }
              <Button type="submit" variant="contained" color="primary">Submit</Button>
            </form>
          </MuiPickersUtilsProvider>
        </Box>
        <Snackbar open={this.state.successSnackbarOpen} onClose={this.handleSnackbarClose}>
          <Alert severity="success" variant="filled" elevation={24} onClose={this.handleSnackbarClose}>
            Successfully submitted signup application!
          </Alert>
        </Snackbar>
        <Snackbar open={this.state.errorSnackbarOpen} onClose={this.handleSnackbarClose}>
          <Alert severity="error" variant="filled" elevation={24} onClose={this.handleSnackbarClose}>
            There was an error in submitting your signup application.
          </Alert>
        </Snackbar>
      </Paper>
    )
  }
}

export function GeneralSignup(props) {
  return(
      <MyGrid container spacing={3}>
          <MyGrid item sm='12' md='6'>
            <TextField id='first_name' name='first_name' type='text' label='First Name' value={props.state.first_name} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm='12' md='6'>
            <TextField id='last_name' name='last_name' type='text' label='Last Name' value={props.state.last_name} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm='12' md='6'>
            <TextField id='email' name='email' type='email' label='Email' value={props.state.email} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm='12' md='6'>
            <TextField id='phone_number' name='phone_number' type='text' label='Phone Number' value={props.state.phone_number} onChange={props.onChange} required fullWidth />
          </MyGrid>
          <MyGrid item sm='12' md='6'>
            <DatePicker
              id='birthday'
              name='birthday'
              label="Date of Birth"
              value={props.state.birthday}
              onChange={date => props.onDateChange('birthday', date)}
              format='YYYY-MM-DD'
            />
          </MyGrid>
          <MyGrid item sm='12' md='6'>
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
      <MyGrid item sm='12' md='6'>
        <TextField id='school_name' name='school_name' type='text' label='School Name' value={props.state.school_name} onChange={props.onChange} required fullWidth />
      </MyGrid>
      <MyGrid item sm='12' md='6'>
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
    </MyGrid>
  );
}


export function TeacherProfileSignup(props) {
  const classes = useStyles();
  return(
    <MyGrid className={classes.sectionEnd} container spacing={3}>
      <MyGrid item sm='12' md='6'>
        <TextField id='association' name='association' type='text' label='Association' value={props.state.association} onChange={props.onChange} required fullWidth />
      </MyGrid>
    </MyGrid>
  );
}


export default Signup;