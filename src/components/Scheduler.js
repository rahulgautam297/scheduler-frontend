import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import {
  Button,
  TextField,
  TableRow,
  TableBody,
  TableHeader,
  TableColumn,
  DialogContainer,
  DataTable,
  Toolbar,
  SelectField,
  TimePicker
} from 'react-md';

import Moment from 'react-moment';

import SchedulerService from './service/SchedulerService';
import './style/index.css';

class Scheduler extends React.Component {
  constructor() {
    super();
    this.schedulerService = new SchedulerService();
    this.setTimeoutStarted = false;
    this.setTimerId = -1;
    this.state = {
      userName: '',
      loggedIn: false,
      Tasks: [ ],
      Projects: [ ],
      task: {
        title: '',
        userName: '',
        startTime: null,
        endTime: null,
        timerStart: null,
        timerEnd: null,
        projectId: null,
        timeStamp: null
      },
      addNew: {
        visible: false,
        pageX: null,
        pageY: null
      }
    };
  }

  changeuserNameField = (value, proxy) => {
    let event = proxy.nativeEvent;
    let userName = this.state.userName;
    switch (event.target.name) {
      case 'userName':
      userName = value;
      this.setState({
        userName,
      });
      break;
      default:
        break;
    }
  }

  getTasks = () => {
    let onResponse = (data) => {
      clearInterval(this.setTimerId);
      this.setTimeoutStarted = false;
      this.setState({
        loggedIn: true,
        tasks: data.tasks,
        projects: data.projects
      });
    };

    let onError = (error) => { };

    var date = new Date();
    date = date.setHours(0,0,0,0);
    this.schedulerService.getAllTodaysTasks({ userName: this.state.userName, timeStamp: date }, onResponse, onError);
  }

  startOrStopTimer = (id, timeHash) => {
    let onResponse = (data) => {
      let tasks = this.state.tasks;
      let task = tasks.find(task => task._id === id);
      task.timerStart = timeHash.timerStart;
      task.timerEnd = timeHash.timerEnd;
      this.setState({
        tasks
      });
    };

    let onError = (error) => { };
    this.schedulerService.updateTask(id, timeHash, onResponse, onError);
  }

  createTaskrequest = () => {
    let onResponse = (data) => {
      let tasks = this.state.tasks;
      let task = this.state.task;
      task._id = data.insertedId;
      tasks.push(this.state.task);
      this.setState({
        tasks
      }, () => {
        this._closeDialogContainer();
      });
    };

    let onError = (error) => { };
    this.schedulerService.saveTask(this.state.task, onResponse, onError);
  }

  syncStateForProject = (value) => {
    const task = this.state.task;
    task.projectId = value;
    this.setState({
      task
    });
  }

  startShowingTimeElapsed = () => {
    let tasks = this.state.tasks;
    let runningTimer = false;
    // if all the timers are off then remove timeOut.
    tasks.forEach((task) => {
      if (task.timerStart && !task.timerEnd) runningTimer = true;
    });
    if (!runningTimer) {
      clearInterval(this.setTimerId);
      this.setTimeoutStarted = false;
      return;
    }
    this.setState({
      tasks
    });
    this.setTimerId = setTimeout(this.startShowingTimeElapsed, 1000);
  }

  getTimeElapsedOrTaken(timerStart, timerEnd, fromStartTime) {
    let elapsedTimeHours =  fromStartTime ? (new Date() - new Date(timerStart))/ (1000 * 3600):
                                            (new Date(timerEnd) - new Date(timerStart))/ (1000 * 3600);
    let elapsedTimeMinutes = (elapsedTimeHours % 1) * 60;
    let elapsedTimeSeconds = (elapsedTimeMinutes % 1) * 60;
    return  (fromStartTime ? 'Time elapsed: ': 'Total time taken: ' )+
            `${ parseInt(elapsedTimeHours, 10) < 10 ? '0' + parseInt(elapsedTimeHours, 10) : parseInt(elapsedTimeHours, 10) } :
              ${ parseInt(elapsedTimeMinutes, 10) < 10 ? '0' + parseInt(elapsedTimeMinutes, 10) : parseInt(elapsedTimeMinutes, 10) } :
              ${ parseInt(elapsedTimeSeconds, 10) < 10 ? '0' + parseInt(elapsedTimeSeconds, 10) : parseInt(elapsedTimeSeconds, 10) }`
  }

  timerLayout = (id, timerStart, timerEnd) => {
    if (timerStart === null || timerStart === undefined) {

     return( <Button secondary icon onClick={ () => this.startOrStopTimer(id,
              { timerStart: new Date().getTime(), timerEnd: null }) }>timer</Button> );

    } else if (timerEnd === null || timerEnd === undefined) {
      if (!this.setTimeoutStarted) {
        this.startShowingTimeElapsed();
        this.setTimeoutStarted = true;
      }
      let elapsedTime = this.getTimeElapsedOrTaken(timerStart, timerEnd, true);

      return (
        <span>
          { elapsedTime }
          <Button secondary icon onClick={ () => this.startOrStopTimer(id,
                         { timerStart: timerStart, timerEnd: new Date().getTime() }, false) }>timer_off</Button>
          </span>
      );

    } else {
      return this.getTimeElapsedOrTaken(timerStart, timerEnd, false);
    }
  }

  getTaskLayout = () => {
    const tasks = this.state.tasks.map(({ _id, title, startTime, endTime,
                                                 projectId, timerStart, timerEnd }) => {
      return (
      <TableRow key={ _id }>
        <TableColumn>{ title }</TableColumn>
        <TableColumn>{ <Moment format="hh:mm a">{ startTime }</Moment> }</TableColumn>
        <TableColumn>{ <Moment format="hh:mm a">{ endTime }</Moment> }</TableColumn>
        <TableColumn>{ this.state.projects.find((project) => project._id === projectId).title }</TableColumn>
        <TableColumn>{ this.timerLayout(_id, timerStart, timerEnd ) } </TableColumn>
      </TableRow>
      );
    });


    const nav = <Button icon onClick={ this._closeDialogContainer }>close</Button>;
    const createTask = <Button flat label="Save" onClick={ this.createTaskrequest } />;

    return (
      <div>
        <Row start="xs" >
          <Col xs={ 4 }>
            <h1 className="">
              Tasks
            </h1>
          </Col>
        </Row>
        <Row center="xs" className="container-body">
          <Col
            xs={ 12 } sm={ 12 } md={ 12 } lg={ 12 }>
            <Row start="xs" className="container-tasks-and-show-more-button">
              <DataTable baseId="tasks">
                <TableHeader>
                  <TableRow>
                    <TableColumn>
                      Title
                    </TableColumn>
                    <TableColumn>
                      Start Time
                    </TableColumn>
                    <TableColumn>
                      End Time
                    </TableColumn>
                    <TableColumn>
                      Project Title
                    </TableColumn>
                    <TableColumn>
                      Timer
                    </TableColumn>
                  </TableRow>
                </TableHeader>
                <TableBody>
                { tasks.length === 0 ?
              <TableColumn>No Tasks</TableColumn> : tasks }
                </TableBody>
              </DataTable>
            </Row>
            <Row center="xs">
              <Button
                onClick={ this.addNewTask }
                floating
                primary
                fixed>
                add
              </Button>
            </Row>
          </Col>
        </Row>
        { this.dialogForNewTask(nav, createTask) }
      </div>
    );
  }
  
  dialogForNewTask(nav, createTask) {
    return(
      <DialogContainer
      id="fullPageExample"
      { ...this.state.addNew }
      fullPage
      aria-label="New Task">
      <Toolbar
        colored
        nav={ nav }
        actions={ createTask }
        title="New Task"
        fixed/>
      <div className="container-dialog">
        <Row center="xs" className="container-body">
          <Col
            xs={12} sm={6} md={4} lg={4}>
            <Row start="xs">
              <TextField
                id="name"
                label="Title"
                type="text"
                name="title"
                required
                value={ this.state.task.title }
                onChange={ this.taskSyncState }/>
              <SelectField
                id="projectId"
                name="projectId"
                title="Project"
                placeholder="Project"
                menuItems={ this.state.projects }
                itemLabel="title"
                itemValue="_id"
                required
                onChange={ this.syncStateForProject }/>
              <TimePicker
                id="time-picker-hover-mode"
                placeholder="Select start time"
                inline
                className="md-cell md-cell--bottom"
                hoverMode
                value={ this.state.task.startTime === null ? null : new Date(this.state.task.startTime) }
                onChange={(time, dateObject) => this.changeStartTime(time, dateObject)}
              />
              <TimePicker
                id="time-picker-hover-mode2"
                placeholder="Select end time"
                inline
                className="md-cell md-cell--bottom"
                hoverMode
                value={ this.state.task.endTime === null ? null : new Date(this.state.task.endTime) }
                onChange={(time, dateObject) => this.changeEndTime(time, dateObject)}
              />
            </Row>
          </Col>
        </Row>
      </div>
    </DialogContainer>
    );
  }
  addNewTask = (e) => {
    let task = { };
    task.title = '';
    task.userName = this.state.userName;
    task.startTime = null;
    task.endTime = null;
    task.timerStart = null;
    task.timerEnd = null;
    task.projectId = null;
    var date = new Date();
    date = date.setHours(0,0,0,0);
    task.timeStamp = date;
    this.setState({
      task
    });

    this._openDialogContainer(e);
  }

  taskSyncState = (value, proxy) => {
    let event = proxy.nativeEvent;
    const task = this.state.task;
    switch (event.target.name) {
      case 'title':
        task.title = value;
        this.setState({
          task,
        });
        break;
      default:
        break;
    }
  }

  changeStartTime= (time, dateObject) => {
    let task = this.state.task;
    task.startTime = dateObject.getTime();
    this.setState({
      task,
    });
  }

  changeEndTime= (time, dateObject) => {
    let task = this.state.task;
    task.endTime = dateObject.getTime();
    this.setState({
      task,
    });
  }

  _openDialogContainer = (e) => {
    let { pageX, pageY } = e;

    if (e.changedTouches) {
      const [touch] = e.changedTouches;
      pageX = touch.pageX;
      pageY = touch.pageY;
    }

      this.setState({ addNew: { visible: true, pageX: pageX, pageY: pageY } });
  }

  _closeDialogContainer = () => {
    this.setState({
      addNew: { visible: false }
    });
  }

  render() {
    return (
      <div className="container-login-dashboard">
        { !this.state.loggedIn && <Row center="xs" >
          <Col xs={ 4 }>
            <h1>
              Login
            </h1>
            <TextField
              id="floating-center-title"
              label="username"
              name="userName"
              lineDirection="center"
              placeholder="user name"
              onChange={ this.changeuserNameField }
            />
            <Button raised primary onClick={ () => this.getTasks() }>login</Button>
          </Col>
        </Row>
        }
        {  this.state.loggedIn && this.getTaskLayout() }
      </div>
    );
  }
}

export default Scheduler;
