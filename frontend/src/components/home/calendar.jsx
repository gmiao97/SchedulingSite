import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from '@fullcalendar/bootstrap';
import { DateTimePicker, Multiselect } from 'react-widgets';
import { AvForm, AvField } from 'availity-reactstrap-validation';
import {
  Container,
  Modal, 
  ModalHeader, 
  ModalBody, 
  Button, 
  Form, 
  FormGroup, 
  Label,
  Input,
  ModalFooter, 
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

      selectedEvent: '',
      studentList: [],
      displayNewEventForm: false,
      displayEditEventForm: false,
    };

    this.calendarRef = React.createRef();
    this.getStudentList = this.getStudentList.bind(this);
    this.handleDateClick = this.handleDateClick.bind(this);
    this.handleEventClick = this.handleEventClick.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleWidgetChange = this.handleWidgetChange.bind(this);
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
      });
      this.toggleForm('new');
    }
  }

  handleEventClick(info) {
    // alert(info.event.title);
    // alert(info.event.id);
    // alert(info.event.extendedProps.student_user[0].first_name);
    this.setState({
      title: info.event.title,
      start: info.event.start.toISOString(),
      end: info.event.end.toISOString(),
      student_user: info.event.extendedProps.student_user.map(user => String(user.id)),
      selectedEvent: info.event.id,
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

  async handleWidgetChange(name, value) {
    await Promise.resolve(this.setState({
      [name]: value,
    }));
    // alert(`${this.state.end} ${this.state.start} ${new Date(this.state.end) < new Date(this.state.start)}`);
    if (new Date(this.state.end) < new Date(this.state.start)) {
      this.setState({
        end: this.state.start,
      });
    }
  }

  async handleNewEventSubmit(event) {
    event.preventDefault();
    try {
      const response = await axiosInstance.post('/yoyaku/events/', this.state);
      this.forceUpdate();
      return response;
    } catch(error) {
      console.log(error.stack);
    } finally {
      this.toggleForm('new');
    }
  }

  async handleEditEventSubmit(event) {
    event.preventDefault();
    try {
      const response = await axiosInstance.put(`/yoyaku/events/${this.state.selectedEvent}/`, this.state);
      this.forceUpdate();
      return response;
    } catch (error) {
      console.log(error.stack);
    } finally {
      this.toggleForm('edit');
    }
  }

  async handleDelete() {
    try {
      const response = await axiosInstance.delete(`/yoyaku/events/${this.state.selectedEvent}/`);
      this.forceUpdate();
      return response;
    } catch(error) {
      console.log(error.stack);
    } finally {
      this.toggleForm('edit');
    }
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
        <Container>
          <FullCalendar
            ref={this.calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, bootstrapPlugin]} 
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
          />
          {getUserTypeFromToken() === 'TEACHER' ? 
            <div>
              <NewEventForm 
                state={this.state} 
                toggle={this.toggleForm} 
                onChange={this.handleChange} 
                onWidgetChange={this.handleWidgetChange}
                onSubmit={this.handleNewEventSubmit}/>
              <EditEventForm 
                state={this.state} 
                toggle={this.toggleForm} 
                onDelete={this.handleDelete}
                onChange={this.handleChange} 
                onWidgetChange={this.handleWidgetChange}
                onSubmit={this.handleEditEventSubmit}
              />
            </div> 
          :
            null
          }
        </Container>
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
              onChange={value => props.onWidgetChange('student_user', value.map(student => student.split(' ')[2].slice(1, -1)))}
            />
            <FormGroup> {/* TODO validations that start < end */}
              Start
              <DateTimePicker
                value={new Date(props.state.start)}
                onChange={value => props.onWidgetChange('start', value.toISOString())}
                date={false}
                step={15}
                inputProps={{readOnly: true}}
              />
              End
              <DateTimePicker
                value={new Date(props.state.end)}
                onChange={value => props.onWidgetChange('end', value.toISOString())}
                date={false}
                step={15}
                min={new Date(props.state.start)}  
                inputProps={{readOnly: true}}
              />
            </FormGroup>
            <Button outline color='info'>Submit</Button>
          </AvForm>
        </Container>
      </ModalBody>
    </Modal>
  );
}

function EditEventForm(props) {
  return(
    <Modal isOpen={props.state.displayEditEventForm} toggle={() => {props.toggle('edit');}}>
      <ModalHeader toggle={() => props.toggle('edit')}>Edit Event</ModalHeader>
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
              onChange={value => props.onWidgetChange('student_user', value.map(student => student.split(' ')[2].slice(1, -1)))}
              defaultValue={props.state.studentList.filter(user => props.state.student_user.includes(user.split(' ')[2].slice(1, -1)))}
            />
            <FormGroup> {/* TODO validations that start < end */}
              Start
              <DateTimePicker
                value={new Date(props.state.start)}
                onChange={value => props.onWidgetChange('start', value.toISOString())}
                date={false}
                step={15}
                inputProps={{readOnly: true}}
              />
              End
              <DateTimePicker
                value={new Date(props.state.end)}
                onChange={value => props.onWidgetChange('end', value.toISOString())}
                date={false}
                step={15}
                min={new Date(props.state.start)}
                inputProps={{readOnly: true}}
              />
            </FormGroup>
            <Button outline color='info'>Submit</Button>
          </AvForm>
        </Container>
      </ModalBody>
      <ModalFooter>
        <Button outline color='danger' onClick={props.onDelete}>Delete</Button>
      </ModalFooter>
    </Modal>
  );
}

export default Calendar;