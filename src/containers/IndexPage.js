import React, { Component } from 'react';
import { Link } from 'react-router';

class IndexPage extends Component {
  render() {
    return (
      <div>
        <h1>
          Index page
        </h1>
        <Link to='/counter'>Counter page</Link>
      </div>
    );
  }
}

export default IndexPage;
