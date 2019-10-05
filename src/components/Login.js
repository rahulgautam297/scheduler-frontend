import React from 'react';
import { Row, Col } from 'react-flexbox-grid';
import {
  Button,
  TextField
} from 'react-md';

// import Moment from 'react-moment';

class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      Login: [ ],
    };
  }

  componentDidMount() {
  }

  render() {

    return (
      <div className="container-Login-dashboard">
        <Row start="xs" >
          <Col xs={ 4 }>
            <h1 >
              Login
              <Button icon onClick={ this.refreshButton }>refresh</Button>
            </h1>
            <TextField
              id="floating-center-title"
              label="username"
              lineDirection="center"
              placeholder="user name"
              className="md-cell md-cell--bottom"
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default Login;
