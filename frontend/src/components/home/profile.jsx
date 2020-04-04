import React, { Component } from 'react';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Jumbotron,
  Container,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  Card,
  Button,
  CardTitle,
  CardText,
  Row,
  Col
} from 'reactstrap';

import axiosInstance from '../../axiosApi';
import { getUserIdFromToken } from '../../util';
import { gradeMappings } from '../../util';

class Profile extends Component {
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
        school_name: '',
        school_grade: '',
      },
      teacher_profile: {
        association: '',
      },
      isProfileLoaded: false,
      activeTab: '1',
    };

    this.getProfile = this.getProfile.bind(this);
    this.toggleTab = this.toggleTab.bind(this);
  }

  async getProfile() {
    let response = await axiosInstance.get(`/yoyaku/users/${getUserIdFromToken()}/`);
    const message = response.data;
    this.setState({
      ...message,
      isProfileLoaded: true,
    });
    return message;
  }

  toggleTab(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab,
      })
    }
  }

  componentDidMount() {
    try {
      this.getProfile();
    } catch (error) {
      throw error;
    }
  }

  render() {
    return (
      this.state.isProfileLoaded ?
        <div>
          <Jumbotron fluid>
            <Container className='mx-5' fluid>
              <h1>{this.state.first_name + ' ' + this.state.last_name}</h1>
              <h4>{this.state.user_type.toLowerCase()}</h4>
              <p className='text-muted'>{this.state.description}</p>
            </Container>
          </Jumbotron>
          <Container>
            <Nav tabs>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '1' })}
                  onClick={() => { this.toggleTab('1'); }}>
                  Information
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  className={classnames({ active: this.state.activeTab === '2' })}
                  onClick={() => { this.toggleTab('2'); }}>
                  More Information
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane className='m-3' tabId="1">
                <Row>
                  <Col sm="1">
                    <span className='m-1'><FontAwesomeIcon icon='user' size='3x' color='green'/></span>
                  </Col>
                  <Col sm="11">
                    <h4>Basic Info</h4>
                    <h6>
                      Email
                      <small className='text-muted m-2'>{this.state.email}</small>
                    </h6>
                    <h6>
                      Phone
                      <small className='text-muted m-2'>{this.state.phone_number}</small>
                    </h6>
                    <h6>
                      Age
                      <small className='text-muted m-2'>{this.state.birthday}</small>
                    </h6>
                    <h6>
                      Time Zone
                      <small className='text-muted m-2'>{this.state.time_zone}</small>
                    </h6>
                    {this.state.teacher_profile &&
                      <div>
                        <h4>Teacher Information</h4>
                        <h6>
                          Association
                          <small className='text-muted m-2'>{this.state.teacher_profile.association}</small>
                        </h6>
                      </div>
                    }
                    {this.state.student_profile &&
                      <div>
                        <h4>Student Information</h4>
                        <h6>
                          School
                          <small className='text-muted m-2'>{this.state.student_profile.school_name + ', ' +
                          gradeMappings.get(this.state.student_profile.school_grade)}</small>
                        </h6>
                      </div>
                    }
                  </Col>
                </Row>
              </TabPane>
              <TabPane className='m-3' tabId="2">
                <Row>
                  <Col sm="6">
                    <Card body>
                      <CardTitle>Special Title Treatment</CardTitle>
                      <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                      <Button>Go somewhere</Button>
                    </Card>
                  </Col>
                  <Col sm="6">
                    <Card body>
                      <CardTitle>Special Title Treatment</CardTitle>
                      <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
                      <Button>Go somewhere</Button>
                    </Card>
                  </Col>
                </Row>
              </TabPane>
            </TabContent>
          </Container>
        </div>
        :
        null
    );
  }
}

export default Profile;