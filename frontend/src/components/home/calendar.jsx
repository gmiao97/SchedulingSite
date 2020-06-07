import React, { Component, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import rrulePlugin from '@fullcalendar/rrule';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from '@fullcalendar/bootstrap';
import moment from 'moment-timezone';
import { confirmAlert } from 'react-confirm-alert';
import { DateTimePicker, Multiselect, SelectList } from 'react-widgets';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import {
  Container,
  Modal, 
  ModalHeader, 
  ModalBody, 
  Button, 
  FormGroup, 
  Label,
  Input,
  ModalFooter, 
  UncontrolledButtonDropdown,
  ButtonDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  ListGroup,
  ListGroupItem,
  FormText,
  Row,
  Col,
} from 'reactstrap';

import { getUserIdFromToken, getUserTypeFromToken } from '../../util';
import axiosInstance from '../../axiosApi';

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      start: '',
      end: '',
      student_user: [],
      teacher_user: '',
      isRecurrence: false,
      recurrence: {
        id: '',
        freq: 'DAILY',
        dtstart: '',
        interval: 1,
        until: '',
      },
      comment: '',
      file: null,

      selectedEvent: '',
      studentList: [],
      userList: [],
      selectedUsers: [],
      teacherName: '',
      displayNewEventForm: false,
      displayEditEventForm: false,
    };

    this.calendarRef = React.createRef();
    this.getStudentList = this.getStudentList.bind(this);
    this.getUserList = this.getUserList.bind(this);
    this.handleDateClick = this.handleDateClick.bind(this);
    this.handleEventClick = this.handleEventClick.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleFileDelete = this.handleFileDelete.bind(this);
    this.handleRecurrenceChange = this.handleRecurrenceChange.bind(this);
    this.handleWidgetChange = this.handleWidgetChange.bind(this);
    this.handleRecurrenceWidgetChange = this.handleRecurrenceWidgetChange.bind(this);
    this.handleNewEventSubmit = this.handleNewEventSubmit.bind(this);
    this.handleEditEventSubmit = this.handleEditEventSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.toggleForm = this.toggleForm.bind(this);
  }

  componentDidMount() {
    try {
      if (getUserTypeFromToken() === 'TEACHER') {
        this.getStudentList();
        this.setState({
          teacher_user: getUserIdFromToken(),
        });
      }
      if (getUserTypeFromToken() === 'ADMIN') {
        this.getStudentList();
        this.getUserList();
      }
    } catch (error) {
      throw error;
    }
  }

  async getStudentList() {
    const students = [];
    const response = await axiosInstance.get('/yoyaku/users/student_list/');
    for (let user of response.data) {
      students.push(`${user.last_name}, ${user.first_name} (${user.id})`);
    }
    students.sort();
    this.setState({
      studentList: students,
    });
  }

  async getUserList() {
    const users = [];
    const response = await axiosInstance.get('/yoyaku/users/');
    for (let user of response.data) {
      users.push(`${user.last_name}, ${user.first_name} (${user.id})`);
    }
    users.sort();
    this.setState({
      userList: users,
    });
  }

  handleDateClick(info) {
    const calendarApi = this.calendarRef.current.getApi();
    if (calendarApi.view.type === 'dayGridMonth') {
      calendarApi.changeView('timeGridDay', info.dateStr);
    } else {
      this.setState({
        title: '',
        start: info.dateStr,
        end: info.dateStr,
        student_user: [],
        selectedEvent: '',
        isRecurrence: false,
        recurrence: {
          freq: 'DAILY',
          interval: 1,
          dtstart: info.dateStr,
          until: info.dateStr,
        },
      });
      this.toggleForm('new');
    }
  }

  handleEventClick(info) {
    // alert(info.event.extendedProps.student_user[0].first_name);
    this.setState({
      title: info.event.title,
      start: moment(info.event.start).format(),
      end: moment(info.event.end || info.event.start).format(),
      student_user: info.event.extendedProps.student_user.map(user => user.id),
      isRecurrence: info.event.extendedProps.isRecurrence,
      recurrence: info.event.extendedProps.recurrence,
      comment: info.event.extendedProps.comment,
      file: info.event.extendedProps.file,
      selectedEvent: info.event.id,
      teacherName: `${info.event.extendedProps.teacher_user.last_name}, ${info.event.extendedProps.teacher_user.first_name}`
    });
    this.toggleForm('edit');
  }

  handleSelect(info) {
    // const calendarApi = this.calendarRef.current.getApi();
    // calendarApi.changeView('timeGrid', {
    //   start: info.start,
    //   end: info.end,
    // });
  }

  handleChange(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  handleRecurrenceChange(event) {
    this.setState({
      recurrence: {
        ...this.state.recurrence,
        [event.target.name]: event.target.value,
      }
    });
  }

  handleFileChange(event) {
    if (!event) {
      this.setState({
        file: null,
      });
    } else {
      this.setState({
        file: event.target.files[0],
      });
    }
  }

  async handleFileDelete() {
    if (window.confirm('File will be deleted')) {
      await axiosInstance.delete(`/yoyaku/events/${this.state.selectedEvent}/destroy_file/`);
      this.toggleForm('edit');
      this.forceUpdate();
    }
  }

  async handleWidgetChange(name, value) {
    await Promise.resolve(this.setState({
      [name]: value,
    }));
    if (new Date(this.state.end) < new Date(this.state.start)) {
      this.setState({
        end: this.state.start,
      });
    }
  }

  async handleRecurrenceWidgetChange(name, value) {
    await Promise.resolve(this.setState({
      recurrence: {
        ...this.state.recurrence,
        [name]: value,
      }
    }));
    if (new Date(this.state.recurrence.until) < new Date(this.state.recurrence.dtstart)) {
      this.setState({
        recurrence: {
          ...this.state.recurrence,
          until: this.state.recurrence.dtstart,
        }
      });
    }
  }

  async handleNewEventSubmit(event) {
    event.preventDefault();
    const {selectedEvent, studentList, displayNewEventForm, displayEditEventForm, teacherName, comment, file, ...payload} = this.state;
    try {
      if (!payload.isRecurrence) {
        payload.recurrence = null;
      }
      const response = await axiosInstance.post('/yoyaku/events/', payload);
      this.forceUpdate();
      return response;
    } catch(error) {
      console.log(error.stack);
    } finally {
      this.toggleForm('new');
    }
  }

  async handleEditEventSubmit(event, editSeries) {
    event.preventDefault();
    try {
      const {selectedEvent, studentList, displayNewEventForm, displayEditEventForm, teacherName, file, ...payload} = this.state;
      payload.editSeries = editSeries;
      const response = await axiosInstance.put(`/yoyaku/events/${this.state.selectedEvent}/`, payload);
      if (file && !editSeries) {
        const data = new FormData();
        data.append('file', file);
        await axiosInstance.put(`/yoyaku/events/${this.state.selectedEvent}/update_file/`, data)
      }
      this.forceUpdate();
      return response;
    } catch (error) {
      console.log(error.stack);
    } finally {
      this.toggleForm('edit');
    }
  }

  async handleDelete() {    
    if (this.state.isRecurrence) {
      confirmAlert({
        title: 'Deletion Selection',
        message: 'Delete single event or all upcoming events in series?',
        buttons: [
          {
            label: 'Delete Single Event',
            onClick: async () => {
              if (window.confirm('Event will be deleted')) {
                await axiosInstance.delete(`/yoyaku/events/${this.state.selectedEvent}/`);
                this.forceUpdate();
              }
            },
          },
          {
            label: 'Delete Series',
            onClick: async () => {
              if (window.confirm('All future events in this series will be deleted?')) {
                await axiosInstance.post(`/yoyaku/events/${this.state.recurrence.id}/destroy_recurrence/`, {
                  delete_from: new Date(Date.now()).toISOString(),
                });
                this.forceUpdate();
              }
            }
          },
        ]
      });
    } else {
      if (window.confirm('Event will be deleted')) {
        await axiosInstance.delete(`/yoyaku/events/${this.state.selectedEvent}/`);
        this.forceUpdate();
      }
    }
    this.toggleForm('edit');
  }

  toggleForm(formType) {
    if (formType === 'new') {
      this.setState({
        displayNewEventForm: !this.state.displayNewEventForm,
      });
    } else if (formType === 'edit') {
      this.setState({
        displayEditEventForm: !this.state.displayEditEventForm,
      });
    }
  }

  render() {
    return(
      <div className='m-3'>
        <Row>
          {getUserTypeFromToken() === 'ADMIN' ? 
            <Col xs="2">
              Select user schedules to view
              <div>
                <Button className="m-2" size="sm" color='success' onClick={
                  () => {this.setState({selectedUsers: this.state.userList.map(user => +user.split(' ')[2].slice(1, -1))});}
                }>Select All</Button>
                <Button className="m-2" size="sm" color='danger' onClick={
                  () => {this.setState({selectedUsers: []});}
                }>Clear</Button>
                <SelectList
                  value={this.state.userList.filter(user => this.state.selectedUsers.includes(+user.split(' ')[2].slice(1, -1)))}
                  multiple={true}
                  name='selectedUsers'
                  data={this.state.userList}
                  onChange={value => this.handleWidgetChange('selectedUsers', value.map(user => +user.split(' ')[2].slice(1, -1)))}
                />
              </div>
            </Col>
          :
            null
          }
          <Col>
            <Container>
              <FullCalendar
                ref={this.calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrapPlugin, rrulePlugin]} 
                defaultView='dayGridMonth'
                themeSystem='bootstrap'
                slotDuration='00:15:00'
                slotEventOverlap={false}
                selectable='true'
                // selectMinDistance='50'
                dateClick={this.handleDateClick}
                eventClick={this.handleEventClick}
                select={this.handleSelect}
                header={{
                  left: 'prev,next, today',
                  center: 'title',
                  right: 'timeGridDay,timeGridWeek,dayGridMonth',
                }}
                events={
                  getUserTypeFromToken() === 'ADMIN' ?
                    (info, successCallback, failureCallback) => {
                      axiosInstance.post(`/yoyaku/events/multiple_user_events/`, {
                        selectedUsers: this.state.selectedUsers,
                        start: info.startStr,
                        end: info.endStr,
                      })
                      .then(result => {
                        successCallback(result.data);
                      })
                      .catch(err => {
                        failureCallback(err);
                      });
                    }
                  :
                    (info, successCallback, failureCallback) => {
                      axiosInstance.get(`/yoyaku/users/${getUserIdFromToken()}/events/`, {
                        params: {
                          start: info.startStr,
                          end: info.endStr,
                        }
                      })
                      .then(result => {
                        successCallback(result.data);
                      })
                      .catch(err => {
                        failureCallback(err);
                      });
                    }
                }
                eventColor='orange'
              />
              {getUserTypeFromToken() === 'TEACHER' ? 
                  <NewEventForm 
                    state={this.state} 
                    toggle={this.toggleForm} 
                    onChange={this.handleChange} 
                    onRecurrenceChange={this.handleRecurrenceChange}
                    onWidgetChange={this.handleWidgetChange}
                    onRecurrenceWidgetChange={this.handleRecurrenceWidgetChange}
                    onSubmit={this.handleNewEventSubmit}
                  />
              :
                null
              }
              <EditEventForm 
                state={this.state} 
                toggle={this.toggleForm} 
                onDelete={this.handleDelete}
                onChange={this.handleChange} 
                onFileChange={this.handleFileChange}
                onFileDelete={this.handleFileDelete}
                onWidgetChange={this.handleWidgetChange}
                onRecurrenceChange={this.handleRecurrenceChange}
                onRecurrenceWidgetChange={this.handleRecurrenceWidgetChange}
                onSubmit={this.handleEditEventSubmit}
              />
            </Container>
          </Col>
        </Row>
      </div>
    );
  }
}

function NewEventForm(props) {
  return(
    <Modal isOpen={props.state.displayNewEventForm} toggle={() => {props.toggle('new');}}>
      <ModalHeader toggle={() => props.toggle('new')}>Create New Event on {props.state.start.slice(0, 10)}</ModalHeader>
      <ModalBody>
        <Container>
          <AvForm onValidSubmit={props.onSubmit}>
            <AvField type='text' label='Event Name' name='title' value={props.state.title} onChange={props.onChange} validate={{
              required: {value: true, errorMessage: 'Please enter event name'},
            }}/>
            Select Students
            <Multiselect
              name='student_user'
              data={props.state.studentList}
              onChange={value => props.onWidgetChange('student_user', value.map(student => +student.split(' ')[2].slice(1, -1)))}
            />
            <FormGroup>
              Start
              <DateTimePicker
                value={new Date(props.state.start)}
                onChange={value => props.onWidgetChange('start', moment(value).format())}
                date={false}
                step={15}
                inputProps={{readOnly: true}}
              />
              End
              <DateTimePicker
                value={new Date(props.state.end)}
                onChange={value => props.onWidgetChange('end', moment(value).format())}
                date={false}
                step={15}
                min={new Date(props.state.start)}  
                inputProps={{readOnly: true}}
              />
            </FormGroup>
            <FormGroup tag='fieldset'>
              <legend>Repeating Event</legend>
              <FormGroup check>
                <Label check>
                  <Input type='radio' name='isRecurrence' onChange={() => props.onWidgetChange('isRecurrence', true)}/>
                  yes
                </Label>
              </FormGroup>
              <FormGroup check>
                <Label check>
                  <Input type='radio' name='isRecurrence' defaultChecked onChange={() => props.onWidgetChange('isRecurrence', false)}/>
                  no
                </Label>
              </FormGroup>
            </FormGroup>
            {props.state.isRecurrence === true ? 
              <RecurEventForm 
                onChange={props.onRecurrenceChange} 
                onWidgetChange={props.onRecurrenceWidgetChange}
                state={props.state.recurrence}
              /> 
              : null}
            <Button className='my-2' color='warning'>Submit</Button>
          </AvForm>
        </Container>
      </ModalBody>
    </Modal>
  );
}

function RecurEventForm(props) {
  return(
    <div>
      <FormGroup>
        <Label>
          Frequency
          <Input type="select" name="freq" value={props.state.freq} onChange={props.onChange}>
            <option value='DAILY'>Daily</option>
            <option value='WEEKLY'>Weekly</option>
            <option value='MONTHLY'>Monthly</option>
          </Input>
        </Label>
      </FormGroup>
      <FormGroup>
        Repeat from
        <DateTimePicker
          value={new Date(props.state.dtstart)}
          onChange={value => props.onWidgetChange('dtstart', moment(value).format())}
          time={false}
          min={new Date(Date.now())}
          inputProps={{readOnly: true}}
        />
        Until
        <DateTimePicker
          value={new Date(props.state.until)}
          onChange={value => props.onWidgetChange('until', moment(value).format())}
          time={false}
          min={Math.max.apply( null, [new Date(props.state.dtstart), new Date(Date.now())] )}
          inputProps={{readOnly: true}}
        />
      </FormGroup>
    </div>
  );
}

function EditEventForm(props) {
  const [editOpen, setEditOpen] = useState(false);
  const [seriesEditOpen, setSeriesEditOpen] = useState(false);

  const eventInfo = 
    <div>
      <ModalBody>
        <Container>
          <h5>Teacher</h5>
          <p>{props.state.teacherName}</p>
          <h5>Students</h5>
          {props.state.studentList.filter(user => props.state.student_user.includes(+user.split(' ')[2].slice(1, -1))).map(student => <p>{student}</p>)}
          <hr/>
          <h5>File</h5>
          {props.state.file ? 
            <div>
              {/* <a href={props.state.file}>{props.state.file.split('/').pop()}</a> */}
              <a href={props.state.file}>click to download</a>
              {getUserTypeFromToken() === 'TEACHER' ? <Button color='danger' size='sm' className='m-2' onClick={props.onFileDelete}>X</Button> : null}
            </div>
          :
            <p>No file uploaded</p>
          }
          <hr/>
          <h5>Comments</h5>
          <p class='multi-line'>{props.state.comment}</p>
          <hr/>
          Date
          <DateTimePicker
            value={new Date(props.state.start)}
            disabled
            time={false}
            inputProps={{readOnly: true}}
          />
          Start
          <DateTimePicker
            value={new Date(props.state.start)}
            disabled
            date={false}
            inputProps={{readOnly: true}}
          />
          End
          <DateTimePicker
            value={new Date(props.state.end)}
            disabled
            date={false}
            inputProps={{readOnly: true}}
          />
        </Container>
      </ModalBody>
      {getUserTypeFromToken() === 'TEACHER' ?
        <ModalFooter>
          {props.state.isRecurrence ?
            <UncontrolledButtonDropdown>
              <DropdownToggle caret color='warning'>
                Edit
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem header>Edit Event</DropdownItem>
                <DropdownItem onClick={() => {setEditOpen(true); props.onFileChange(null)}}>Edit Single Event</DropdownItem>
                <DropdownItem onClick={() => {setEditOpen(true); setSeriesEditOpen(true);}}>Edit Series</DropdownItem>
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          : 
            <Button color='warning' onClick={() => setEditOpen(true)}>Edit</Button>}
          <Button color='danger' onClick={props.onDelete}>Delete</Button>
        </ModalFooter>
      :
        null
      }
    </div>;

  const editEvent = 
    <div>
      <ModalBody>
        <Container>
          <AvForm onValidSubmit={() => {setEditOpen(false); setSeriesEditOpen(false); props.onSubmit(window.event, seriesEditOpen);}}>
            <AvField type='text' label='Event Name' name='title' value={props.state.title} onChange={props.onChange} validate={{
              required: {value: true, errorMessage: 'Please enter event name'},
            }}/>
            Select Students
            <Multiselect
              name='student_user'
              data={props.state.studentList}
              onChange={value => props.onWidgetChange('student_user', value.map(student => +student.split(' ')[2].slice(1, -1)))}
              defaultValue={props.state.studentList.filter(user => props.state.student_user.includes(+user.split(' ')[2].slice(1, -1)))}
            />
            <hr/>
            {!seriesEditOpen ? 
              <FormGroup>
                <AvField type='textarea' label='Comments' name='comment' value={props.state.comment} onChange={props.onChange} validate={{
                  maxLength: {value: 1000},
                }}/>
                <Label>
                  File
                  <Input type="file" name="file" id="exampleFile" onChange={props.onFileChange}/>
                </Label>
                <FormText color="muted">
                  Lesson Material
                </FormText>
              </FormGroup>
            :
              null
            }
            <FormGroup>
              {!seriesEditOpen ? 
                <div>
                  Date
                  <DateTimePicker
                    value={new Date(props.state.start)}
                    onChange={value => {
                        props.onWidgetChange('start', moment(value).format())
                        props.onWidgetChange('end', moment(value).format())
                    }}
                    time={false}
                    inputProps={{readOnly: true}}
                  />
                </div>
              :
                null
              }
              Start
              <DateTimePicker
                value={new Date(props.state.start)}
                onChange={value => props.onWidgetChange('start', moment(value).format())}
                date={false}
                step={15}
                inputProps={{readOnly: true}}
              />
              End
              <DateTimePicker
                value={new Date(props.state.end)}
                onChange={value => props.onWidgetChange('end', moment(value).format())}
                date={false}
                step={15}
                min={new Date(props.state.start)}
                inputProps={{readOnly: true}}
              />
            </FormGroup>
            <hr/>
            {seriesEditOpen ? 
              <div>
                <FormGroup>
                  <Label>
                    Frequency
                    <Input type="select" name="freq" value={props.state.recurrence.freq} onChange={props.onRecurrenceChange}>
                      <option value='DAILY'>Daily</option>
                      <option value='WEEKLY'>Weekly</option>
                      <option value='MONTHLY'>Monthly</option>
                    </Input>
                  </Label>
                </FormGroup>
                <FormGroup>
                  Repeat from
                  <DateTimePicker
                    value={new Date(props.state.recurrence.dtstart)}
                    onChange={value => props.onRecurrenceWidgetChange('dtstart', moment(value).format())}
                    time={false}
                    disabled
                    min={new Date(Date.now())}
                    inputProps={{readOnly: true}}
                  />
                  Until
                  <DateTimePicker
                    value={new Date(props.state.recurrence.until)}
                    onChange={value => props.onRecurrenceWidgetChange('until', moment(value).format())}
                    time={false}
                    min={Math.max.apply( null, [new Date(props.state.recurrence.dtstart), new Date(Date.now())] )}
                    inputProps={{readOnly: true}}
                  />
                </FormGroup>
              </div>
            : null}
            <Button color='warning'>Submit</Button>
          </AvForm>
        </Container>
      </ModalBody>
    </div>
  

  return(
    <Modal isOpen={props.state.displayEditEventForm} toggle={() => {props.toggle('edit'); setEditOpen(false); setSeriesEditOpen(false);}}>
      <ModalHeader toggle={() => {props.toggle('edit'); setEditOpen(false); setSeriesEditOpen(false);}}>{props.state.title}</ModalHeader>
      {editOpen ? editEvent: eventInfo}
    </Modal>
  );
}

export default Calendar;