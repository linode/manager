import React, { Component, PropTypes } from 'react';

export default class Feedback extends Component {
  constructor(props) {
    super();
    this.state = {
      email: props.email,
      message: '',
    };
  }

  render() {
    const { open, hideShowFeedback, submitFeedback } = this.props;
    const { email, message } = this.state;
    return (
      <div className={`feedback ${open ? 'open' : ''}`}>
        <button
          className="btn feedback-button"
          onClick={hideShowFeedback}
        >Feedback</button>
        <div className="card">
          <header>
            <h3>Submit feedback</h3>
          </header>
          <div className="card-body">
            <form>
              <div className="form-group">
                <div>
                  <label>Email:</label>
                </div>
                <div>
                  <input
                    value={email}
                    className="form-control"
                    onChange={e => this.setState({ email: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <div>
                  <label>Message:</label>
                </div>
                <div>
                  {/* http://stackoverflow.com/a/40235334/1507139 */}
                  <textarea
                    ref={textarea => textarea && textarea.focus()}
                    value={message}
                    className="form-control"
                    onChange={e => this.setState({ message: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group clearfix">
                <button
                  className="btn btn-primary float-xs-left"
                  onClick={() => submitFeedback(this.state)}
                  type="submit"
                >Submit</button>
                <button
                  className="btn btn-cancel float-xs-left"
                  onClick={hideShowFeedback}
                >Nevermind</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Feedback.propTypes = {
  email: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  hideShowFeedback: PropTypes.func.isRequired,
  submitFeedback: PropTypes.func.isRequired,
};

Feedback.defaultProps = {
  open: false,
};
