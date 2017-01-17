import React, { Component } from 'react';

import { Button } from '~/components/buttons';
import { CancelButton } from '~/components/form';
import { ModalShell } from '~/components/modals';
import { StyleguideSection } from '~/styleguide/components';

export default class Modals extends Component {
  constructor() {
    super();
    this.state = {
      basicOpen: false,
      confirmOpen: false,
      formOpen: false,
    };
  }

  render() {
    return (
      <StyleguideSection name="modals" title="Modals">
        <div className="StyleguideModals col-sm-12">
          <div className="StyleguideSubSection row">
            <div className="col-sm-12">
              <div className="StyleguideSubSection-header">
                <p>
                  Modals are used to display an important message
                  or obtain a response from the user.
                </p>
              </div>
              <div className="StyleguideModals-examples">
                <p>Examples:</p>
                <ul>
                  <li>
                    <Button onClick={() => this.setState({ basicOpen: true })}>
                      Basic Modal
                    </Button>
                    <ModalShell
                      title="Basic Modal Example"
                      open={this.state.basicOpen}
                      close={() => { this.setState({ basicOpen: false }); }}
                    >
                      <div>
                        <p>
                          A very important message.
                        </p>
                        <div className="modal-footer">
                          <Button onClick={() => { this.setState({ basicOpen: false }); }}>
                            Ok
                          </Button>
                        </div>
                      </div>
                    </ModalShell>
                  </li>
                  <li>
                    <Button onClick={() => this.setState({ confirmOpen: true })}>
                      Confirm modal
                    </Button>
                    <ModalShell
                      title="Confirm Modal Example"
                      open={this.state.confirmOpen}
                      close={() => { this.setState({ confirmOpen: false }); }}
                    >
                      <div>
                        <p>
                          Please confirm your choice.
                        </p>
                        <div className="modal-footer">
                          <CancelButton
                            onClick={() => { this.setState({ confirmOpen: false }); }}
                          />
                          <Button onClick={() => { this.setState({ confirmOpen: false }); }}>
                            Confirm
                          </Button>
                        </div>
                      </div>
                    </ModalShell>
                  </li>
                  <li>
                    <Button onClick={() => this.setState({ formOpen: true })}>
                      Form Modal
                    </Button>
                    <ModalShell
                      title="Form Modal Example"
                      open={this.state.formOpen}
                      close={() => { this.setState({ formOpen: false }); }}
                    >
                      <div>
                        <p>
                          A short description about this form.
                        </p>
                        <div className="ConfigSelectModalBody-configs">
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
                          <CancelButton onClick={() => { this.setState({ formOpen: false }); }} />
                          <Button onClick={() => { this.setState({ formOpen: false }); }}>
                            Save
                          </Button>
                        </div>
                      </div>
                    </ModalShell>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </StyleguideSection>
    );
  }
}
