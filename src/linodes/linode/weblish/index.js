import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import Error from '../../../components/Error.js';
import { rawFetch as fetch } from '~/fetch';
import linode_js from './linode.js';

export class Weblish extends Component {
  constructor() {
    super();
    this.renderError = this.renderError.bind(this);
    this.state = { title: 'Weblish', link: 'Link' };
  }

  renderError() {
    const { errors } = this.props;
    return (
      <Error status={errors.status} href={href} />
    );
  }

  async componentDidMount() {
    if (this.state.title === 'Weblish') {
      try {
        this.setState({ title, link });
      } catch (ex) {
        // don't do anything
      }
    }
  }

  render() {
    return(
      <div>
        <link rel="stylesheet" href="/linodes/linode/weblish/PowerlineFonts.css" />
        <link rel="stylesheet" href="/linodes/linode/weblish/weblish.css" />
        <script src="/linodes/linode/weblish/term.js"></script>
        <script src="//cdnjs.cloudflare.com/ajax/libs/knockout/3.3.0/knockout-min.js"></script>
        <script src="/linodes/linode/weblish/linode.js"></script>
        <div id="disconnected">
          <div className="blur"></div>
          <div id="reconnect"></div>
          <h2>Connection Lost</h2>
          <p>Lish appears to be temporarily unavailable.</p>
          <button onClick={() => location.reload()}>Reload &#x27f3;</button>
        </div>
      </div>
    );
  }
}

Weblish.propTypes = {
  linode: PropTypes.object,
};

function select(state) {
  return {
    linode: state.linode,
  };
}

export default connect(select)(Weblish);
