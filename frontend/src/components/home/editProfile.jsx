import React, { Component } from 'react';
import moment from 'moment-timezone';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import {
  Container,
  Button,  
  FormGroup, 
  Label, 
  Input, 
  Col,
  Row,
} from 'reactstrap';

import Signup, { GeneralSignup, StudentProfileSignup, TeacherProfileSignup } from '../landing/signup';
import axiosInstance from '../../axiosApi';
import { getUserIdFromToken, history } from '../../util';

class EditProfile extends Signup {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      first_name: '',
      last_name: '',
      user_type: '',
      time_zone: '',
      phone_number: '',
      birthday: '',
      description: '',
      student_profile: {
        id: '',
        school_name: '',
        school_grade: '',
      },
      teacher_profile: {
        id: '',
        association: '',
      },
      student_id: '',
      teacher_id: '',
    };
  }

  componentDidMount() {
    try {
      this.getProfile();
    } catch (error) {
      throw error;
    }
  }

  async getProfile() {
    let response = await axiosInstance.get(`/yoyaku/users/${getUserIdFromToken()}/`);
    const message = response.data;
    this.setState({
      ...message,
      student_id: message.student_profile ? message.student_profile.id : '',
      teacher_id: message.teacher_profile ? message.teacher_profile.id : '',
    });
    return message;
  }

  // TODO error handling and validation
  async handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await axiosInstance.patch(`/yoyaku/users/${getUserIdFromToken()}/`, this.state);
      return response;
    } catch(error) {
      console.log(error.stack);
    } finally {
      history.push('/profile/');
    }
  }

  render() {
    return(
      <Container className='my-5'>
        <h3>Edit Profile</h3>
        <AvForm onValidSubmit={this.handleSubmit}>
          <div>
            <AvField type='email' label='Email' name='email' value={this.state.email} onChange={this.handleChange} validate={{
              required: {value: true, errorMessage: 'Please enter an email'},
              email: {value: true, errorMessage: 'Please enter a valid email address (e.g. example@website.com)'},
            }}/>
            <Row form>
              <Col md='6'>
                <AvField type='text' label='First Name' name='first_name' value={this.state.first_name} onChange={this.handleChange} validate={{
                  required: {value: true, errorMessage: 'Please enter first name'},
                }}/>
              </Col>
              <Col md='6'>
                <AvField type='text' label='Last Name' name='last_name' value={this.state.last_name} onChange={this.handleChange} validate={{
                  required: {value: true, errorMessage: 'Please enter last name'},
                }}/>
              </Col>
            </Row>
            <Row form>
              <Col md='6'>
                <AvField type='text' label='Phone Number' name='phone_number' value={this.state.phone_number} onChange={this.handleChange} validate={{
                  required: {value: true, errorMessage: 'Please enter phone number using only numbers'},
                  pattern: {value: '^[0-9]+$', errorMessage: 'Please enter only numbers'},
                }}/>
              </Col>
              <Col md='6'>
                <AvField type='date' label='Date of Birth' name='birthday' value={this.state.birthday} onChange={this.handleChange} validate={{
                  required: {value: true, errorMessage: 'Please enter birth date'},
                  date: {format: 'MM/DD/YYYY'},
                }}/>
              </Col>
            </Row>
            <FormGroup>
              <Label>
                Select Time Zone
                <Input type='select' name='time_zone' value={this.state.time_zone} onChange={this.handleChange}> 
                  {moment.tz.names().filter(tz => tz !== 'Asia/Qostanay').map((value, index) =>  // TODO Asia/Qostanay isn't in pytz timezones
                    <option key={index} value={value}>{value}</option>
                  )}
                </Input>
              </Label>
            </FormGroup>
            <AvField type='textarea' label='Personal Description' name='description' value={this.state.description} onChange={this.handleChange} validate={{
              required: {value: true, errorMessage: 'Please enter a personal description'},
              maxLength: {value: 300},
            }}/>
          </div>
          {this.state.user_type === 'STUDENT' && 
            <StudentProfileSignup
              student_profile={this.state.student_profile} 
              onChange={this.handleChangeStudentProfile}
            />
          }
          {this.state.user_type === 'TEACHER' && 
            <TeacherProfileSignup
              teacher_profile={this.state.teacher_profile} 
              onChange={this.handleChangeTeacherProfile}
            />
          }
          <Button outline color='info'>Submit</Button>
        </AvForm>
      </Container>
    );
  }
}

export default EditProfile;