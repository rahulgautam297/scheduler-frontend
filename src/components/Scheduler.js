import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import {
  Button,
  TextField,
  TableRow,
  TableBody,
  TableHeader,
  TableColumn,
  Dialog,
  DataTable,
  Toolbar,
  SelectField
} from 'react-md';
import SchedulerService from './SchedulerService';
import Moment from 'react-moment';

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
        projectId: null
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
      console.log(data);
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
      console.log(data);
      let tasks = this.state.tasks;
      let task = tasks.find(task => task._id === id);
      task.startTime = timeHash.startTime;
      task.endTime = timeHash.endTime;
      this.setState({
        tasks
      });
    };

    let onError = (error) => { };
    this.schedulerService.updateTask(id, { startTime: timeHash.startTime, endTime: timeHash.endTime }, onResponse, onError);
  }

  createTaskrequest = () => {
    let onResponse = (data) => {
      console.log(data);
      let tasks = this.state.tasks;
      //add _id
      let task = this.state.task;
      // task._id = data.task._id;
      task.push(this.state.task);
      this.setState({
        tasks
      });
    };

    let onError = (error) => { };
    this.schedulerService.updateTask(this.state.task, onResponse, onError);
  }

  timerLayout = (id, startTime, endTime) => {
    if (startTime === null || startTime === undefined) {
      <Button secondary onClick={ () => this.startOrStopTimer(id,
                                   { startTime: new Date().getTime(), endTime: null }) }>Start</Button>
    } else if (endTime === null || endTime === undefined) {
      if (!this.setTimeoutStarted) {
        this.setTimerId = setTimeout(() => {
          let tasks = this.state.tasks;
          this.setState({
            tasks
          })
        }, 1000);
        this.setTimeoutStarted = true;
      }
      let elapsedTimeHours = (new Date() - new Date(startTime))/ (1000 * 3600);
      let elapsedTimeMinutes = (elapsedTimeHours % 1) * 60;
      let elapsedTimeSeconds = (elapsedTimeMinutes % 1) * 60;
      let elapsedTime = `elapsed time ${ elapsedTimeHours }:${ elapsedTimeMinutes}:${ elapsedTimeSeconds }`
      return (
        <span>
          { elapsedTime }
          <Button secondary onClick={ () => this.startOrStopTimer(id,
                         { startTime: startTime, endTime: new Date().getTime() }, false) }>Stop</Button>
          </span>
      );
    } else {
      let elapsedTimeHours = (new Date(endTime) - new Date(startTime))/ (1000 * 3600);
      let elapsedTimeMinutes = (elapsedTimeHours % 1) * 60;
      let elapsedTimeSeconds = (elapsedTimeMinutes % 1) * 60;
      return `elapsed time ${ elapsedTimeHours }:${ elapsedTimeMinutes }:${ elapsedTimeSeconds }`
    }
  }

  syncStateForProject = (value) => {
    const task = this.state.task;
    task.projetId = value;
    this.setState({
      task
    });
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


    const nav = <Button icon onClick={ this._closeDialog }>X</Button>;
    const createTask = <Button flat label="Save" onClick={ this.createTaskrequest } />;

    return (
      <div>
        <Row start="xs" >
          <Col xs={ 4 }>
            <h1 className="">
              tasks
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
              <h3>No tasks.</h3> : tasks }
                </TableBody>
              </DataTable>
            </Row>
            <Row center="xs">
              <Button
                onClick={ this.addNewTask }
                floating
                primary
                fixed>
                +
              </Button>
            </Row>
          </Col>
        </Row>
        <Dialog
          id="fullPageExample"
          {...this.state.addNew}
          fullPage
          aria-label="New Task">
          <Toolbar
            colored
            nav={ nav }
            actions={ this.createTask }
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
                    onChange={ this.syncState }/>
                  <TextField
                    id="userName"
                    label="User Name"
                    type="text"
                    name="userName"
                    required
                    value={ this.state.task.userName }
                    onChange={ this.syncState }/>
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
                  <TextField
                    id="startTime"
                    label="Start Time"
                    type="text"
                    name="startTime"
                    required
                    value={ this.state.task.startTime }
                    onChange={ this.syncState }/>
                  <TextField
                    id="endTime"
                    label="Eend Time"
                    type="text"
                    name="endTime"
                    required
                    value={ this.state.task.endTime }
                    onChange={ this.syncState }/>
                    <br />
                  </Row>
                </Col>
              </Row>
            </div>
        </Dialog>
      </div>
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
    this.setState({
      task
    });

    this._openDialog(e);
  }

  TaskSyncState = (value, proxy) => {
    let event = proxy.nativeEvent;
    const task = this.state.task;
    switch (event.target.name) {
      case 'title':
        task.title = value;
        this.setState({
          task,
        });
        break;
      case 'userName':
        task.userName = value;
        this.setState({
          task,
        });
        break;
      case 'startTime':
        task.startTime = value;
        this.setState({
          task,
        });
        break;
      case 'endTime':
        task.endTime = value;
        this.setState({
          task,
        });
        break;
      default:
        break;
    }
  }

  _openDialog = (e) => {
    let { pageX, pageY } = e;

    if (e.changedTouches) {
      const [touch] = e.changedTouches;
      pageX = touch.pageX;
      pageY = touch.pageY;
    }

      this.setState({ addNew: { visible: true, pageX: pageX, pageY: pageY } });
  }

  _closeDialog = () => {
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
