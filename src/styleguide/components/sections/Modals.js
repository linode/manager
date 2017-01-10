import React, { Component } from 'react';

import { StyleguideSection } from '~/styleguide/components';
import { ModalShell } from '~/components/modals';
import CancelButton from '~/components/form/CancelButton';

export default class Modals extends Component {
  constructor() {
    super();
    this.state = {
      confirmOpen: false,
      generalOpen: false,
    };
  }

  render() {
    return (
      <StyleguideSection name="modals" title="Modals">
        This is an example of a
        <br />
        <a onClick={() => this.setState({ confirmOpen: true })} className="btn btn-default">
          Confirm modal
        </a>
        <ModalShell
          title="Modal example"
          open={this.state.confirmOpen}
          close={() => { this.setState({ confirmOpen: false }); }}
        >
          <div>
            <p>
              Content goes here
            </p>
            <div className="modal-footer">
              <CancelButton onClick={() => { this.setState({ confirmOpen: false }); }} />
              <button
                className="btn btn-default"
                onClick={() => { this.setState({ confirmOpen: false }); }}
              >
                OK
              </button>
            </div>
          </div>
        </ModalShell>
        <br />
        <br />
        This is an example of a
        <br />
        <a onClick={() => this.setState({ generalOpen: true })} className="btn btn-default">
          General modal
        </a>
        <ModalShell
          title="Modal example"
          open={this.state.generalOpen}
          close={() => { this.setState({ generalOpen: false }); }}
        >
          <div>
            <p>
              Content goes here
            </p>
            <div className="ConfigSelectModal-configs">
              <div key="1" className="radio">
                <label>
                  <input
                    type="checkbox"
                    name="config1"
                    value="Item 1"
                  />
                  <span>Item 1</span>
                </label>
              </div>
              <div key="2" className="radio">
                <label>
                  <input
                    type="checkbox"
                    name="config2"
                    value="Item 2"
                  />
                  <span>Item 2</span>
                </label>
              </div>
              <div key="3" className="radio">
                <label>
                  <input
                    type="checkbox"
                    name="config3"
                    value="Item 3"
                  />
                  <span>Item 3</span>
                </label>
              </div>
              <div key="4" className="radio">
                <label>
                  <input
                    type="checkbox"
                    name="config4"
                    value="Item 4"
                  />
                  <span>Item 4</span>
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <CancelButton onClick={() => { this.setState({ generalOpen: false }); }} />
              <button
                className="btn btn-default"
                onClick={() => { this.setState({ generalOpen: false }); }}
              >
                Change
              </button>
            </div>
          </div>
        </ModalShell>
        <br />
        You can have form elements or other elements inside a general modal.
      </StyleguideSection>
    );
  }
}

Modals.propTypes = {
};
