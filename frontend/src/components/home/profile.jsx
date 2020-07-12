import React, { Component, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { deepOrange, deepPurple } from '@material-ui/core/colors';
import {  
  Container, 
  Grid,
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Paper,
} from '@material-ui/core';
// import classnames from 'classnames';
// import {
//   Jumbotron,
//   Container,
//   TabContent,
//   TabPane,
//   Nav,
//   NavItem,
//   NavLink,
//   Card,
//   Button,
//   CardTitle,
//   CardText,
//   Row,
//   Col
// } from 'reactstrap';

import axiosInstance from '../../axiosApi';
import { getUserIdFromToken } from '../../util';
import { gradeMappings } from '../../util';
import Banner from '../../static/orange-gradient.jpg';
import Cat from '../../static/avatars/cat.png';
import Bear from '../../static/avatars/bear.png';
import Panda from '../../static/avatars/panda.png';


const useStyles = makeStyles(theme => ({
  backgroundBanner: {
    backgroundImage: `url(${Banner})`,
    backgroundSize: "cover",
    height: 300,
  },
  avatar: {
    width: theme.spacing(15),
    height: theme.spacing(15),
    position: 'absolute',
    top: theme.spacing(35),
    left: "10%",
    backgroundImage: `url(${Panda})`,
    backgroundSize: "cover",
  },
  purple: {
    color: theme.palette.getContrastText(deepPurple[500]),
    backgroundColor: deepPurple[500],
  },
}));

export default function Profile(props) {
  const classes = useStyles();
  const [currentUser, setCurrentUser] = useState(props.currentUser);

    // this.state = {
    //   // email: '',
    //   // first_name: '',
    //   // last_name: '',
    //   // user_type: '',
    //   // time_zone: '',
    //   // phone_number: '',
    //   // birthday: '',
    //   // description: '',
    //   // student_profile: {
    //   //   school_name: '',
    //   //   school_grade: '',
    //   // },
    //   // teacher_profile: {
    //   //   association: '',
    //   // },
    //   ...this.props.currentUser,
    //   activeTab: '1',
    // };
    // this.toggleTab = this.toggleTab.bind(this);
  

  // toggleTab(tab) {
  //   if (this.state.activeTab !== tab) {
  //     this.setState({
  //       activeTab: tab,
  //     })
  //   }
  // }

 
    return (

      <div id="profile">
        <Paper className={classes.backgroundBanner}>
          <Avatar className={classes.avatar}> </Avatar>

        </Paper>
      </div>

      // <div>
      //   <Jumbotron fluid>
      //     <Container className='mx-5' fluid>
      //       <h1>{this.state.first_name + ' ' + this.state.last_name}</h1>
      //       <h4>{this.state.user_type.toLowerCase()}</h4>
      //       <p className='text-muted' class='multi-line'>{this.state.description}</p>
      //     </Container>
      //   </Jumbotron>
      //   <Container>
      //     <Nav tabs>
      //       <NavItem>
      //         <NavLink
      //           className={classnames({ active: this.state.activeTab === '1' })}
      //           onClick={() => { this.toggleTab('1'); }}>
      //           Information
      //         </NavLink>
      //       </NavItem>
      //       <NavItem>
      //         <NavLink
      //           className={classnames({ active: this.state.activeTab === '2' })}
      //           onClick={() => { this.toggleTab('2'); }}>
      //           More Information
      //         </NavLink>
      //       </NavItem>
      //     </Nav>
      //     <TabContent activeTab={this.state.activeTab}>
      //       <TabPane className='m-3' tabId='1'>
      //         <Row>
      //           <Col sm='1'>
      //             <span className='m-1'>Icon</span>
      //           </Col>
      //           <Col sm='11'>
      //             <h4>Basic Info</h4>
      //             <h6>
      //               Email
      //               <small className='text-muted m-2'>{this.state.email}</small>
      //             </h6>
      //             <h6>
      //               Phone
      //               <small className='text-muted m-2'>{this.state.phone_number}</small>
      //             </h6>
      //             <h6>
      //               Age
      //               <small className='text-muted m-2'>{this.state.birthday}</small>
      //             </h6>
      //             <h6>
      //               Time Zone
      //               <small className='text-muted m-2'>{this.state.time_zone}</small>
      //             </h6>
      //             {this.state.teacher_profile &&
      //               <div>
      //                 <h4>Teacher Information</h4>
      //                 <h6>
      //                   Association
      //                   <small className='text-muted m-2'>{this.state.teacher_profile.association}</small>
      //                 </h6>
      //               </div>
      //             }
      //             {this.state.student_profile &&
      //               <div>
      //                 <h4>Student Information</h4>
      //                 <h6>
      //                   School
      //                   <small className='text-muted m-2'>{this.state.student_profile.school_name + ', ' +
      //                   gradeMappings.get(this.state.student_profile.school_grade)}</small>
      //                 </h6>
      //               </div>
      //             }
      //           </Col>
      //         </Row>
      //       </TabPane>
      //       <TabPane className='m-3' tabId='2'>
      //         <Row>
      //           <Col sm='6'>
      //             <Card body>
      //               <CardTitle>Special Title Treatment</CardTitle>
      //               <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
      //               <Button>Go somewhere</Button>
      //             </Card>
      //           </Col>
      //           <Col sm='6'>
      //             <Card body>
      //               <CardTitle>Special Title Treatment</CardTitle>
      //               <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
      //               <Button>Go somewhere</Button>
      //             </Card>
      //           </Col>
      //         </Row>
      //       </TabPane>
      //     </TabContent>
      //   </Container>
      // </div>
    );
  
}
