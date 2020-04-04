import React, { useState } from 'react';
import { Switch, Route, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  Button,
  Modal, 
  ModalHeader, 
  ModalBody, 
} from 'reactstrap';

import Login from './login';
import Signup from './signup';


function Landing(props) {
  const [isOpen, setIsOpen] = useState(false);
  const navToggle = () => setIsOpen(!isOpen);
  const [modal1, setModal1] = useState(false);
  const modalToggle1 = () => setModal1(!modal1);
  const [modal2, setModal2] = useState(false);
  const modalToggle2 = () => setModal2(!modal2);

  return (
    <div id='landing'>
      <Navbar color='dark' dark expand='sm'>
        <NavbarBrand className='text-warning' href='/'>
          <span className='m-2'><FontAwesomeIcon icon='school' size='md'/></span>
          Success Academy
        </NavbarBrand>
        <NavbarToggler onClick={navToggle} />
        <Collapse isOpen={isOpen} navbar>
          <Nav className='ml-auto' navbar>
            <NavItem>
              <div>
                <Button className='m-1' outline color='warning' onClick={modalToggle1}>Signup</Button>
                <Modal isOpen={modal1} toggle={modalToggle1}>
                  <ModalHeader toggle={modalToggle1}>Signup</ModalHeader>
                  <ModalBody>
                    <Signup toggle={modalToggle1} />
                  </ModalBody>
                </Modal>
              </div>
            </NavItem>
            <NavItem>
              <div>
                <Button className='m-1' outline color='warning' onClick={modalToggle2}>Login</Button>
                <Modal isOpen={modal2} toggle={modalToggle2}>
                  <ModalHeader toggle={modalToggle2}>Login</ModalHeader>
                  <ModalBody>
                    <Login handleLogin={props.handleLogin}/>
                  </ModalBody>
                </Modal>
              </div>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
    </div>
  );
}

export default Landing;