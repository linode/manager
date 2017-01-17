import React from 'react';

import { StyleguideSection } from '~/styleguide/components';

import {
  Form, FormGroup, CancelButton, SubmitButton, Input, Radio, Checkbox, Select, CheckboxInputCombo,
  FormGroupError, RadioInputCombo, RadioSelectCombo, Checkboxes, PasswordInput,
} from '~/components/form';
import { ErrorSummary } from '~/errors';

export default function Forms() {
  return (
    <StyleguideSection name="forms" title="Forms">
      <div className="col-sm-12">
        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Form Details</h3>
            </div>
            <div className="ExampleForm">
              <Form>
                <FormGroup className="row">
                  <div className="col-sm-4 label-col">
                    <label>
                      <span className="FormDescriptor FormDescriptor__form-labels">
                        <span className="badge">1</span>
                      </span>
                      Field label
                    </label>
                  </div>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control"
                      placeholder="Placeholder"
                    />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <div className="col-sm-4 label-col">
                    <label>
                      <span className="FormDescriptor FormDescriptor__required-field">
                        <span className="badge">2</span>
                      </span>
                      Required field
                    </label>
                  </div>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control"
                    />
                    <span className="FormDescriptor FormDescriptor__form-fields">
                      <span className="badge">3</span>
                    </span>
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <div className="col-sm-4 label-col">
                    <label>Field lengths</label>
                  </div>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <div className="col-sm-4 label-col">
                    <label>Disabled field</label>
                  </div>
                  <div className="col-sm-8">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control"
                      disabled
                    />
                    <span className="FormDescriptor FormDescriptor__disabled-fields">
                      <span className="badge">4</span>
                    </span>
                  </div>
                </div>
              </Form>
              <div className="ExampleForm-description">
                <dl>
                  <dt>
                    1 - Form Labels:
                  </dt>
                  <dd>
                    Form labels use sentence case. They are right aligned by default.
                  </dd>
                  <dt>
                    2 - Required Fields:
                  </dt>
                  <dd>

                  </dd>
                  <dt>
                    3 - Form fields:
                  </dt>
                  <dd>
                    The length of a field should be relative to the intended size of the input.
                  </dd>
                  <dt>
                    4 - Disabled Fields:
                  </dt>
                  <dd>
                    Disabled fields are used to communicate the field is available
                    in another scenario. Short descriptions, tooltips, or
                    help links are useful when defining fields with disabled states.
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Form Layout</h3>
              <p>Form Layout describes the typical organization of form elements.</p>
            </div>

            <div className="ExampleForm">
              <Form>
                <span className="FormDescriptor FormDescriptor__form-title">
                  <span className="badge">1</span>
                </span>
                <h2>Form Title</h2>
                <p>
                  A short description about the purpose of this form. <a href="#">Learn More.</a>
                </p>
                <FormGroup className="row">
                  <div className="col-sm-4 label-col">
                    <label>Field label</label>
                  </div>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </div>

                <h3>Form Section Title</h3>
                <div className="form-group row">
                  <span className="FormDescriptor FormDescriptor__form-section-title">
                    <span className="badge">2</span>
                  </span>
                  <div className="col-sm-4 label-col">
                    <label>Field label</label>
                  </div>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <div className="col-sm-4 label-col">
                    <label>Field label</label>
                  </div>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </div>

                <div className="form-group row">
                  <div className="offset-sm-4 col-sm-8">
                    <span className="FormDescriptor FormDescriptor__form-buttons">
                      <span className="badge">3</span>
                    </span>
                    <SubmitButton />
                    <CancelButton />
                  </div>
                </div>
              </Form>

              <div className="ExampleForm-description">
                <dl>
                  <dt>
                    1 - Form Title:
                  </dt>
                  <dd>
                    The form title describes the form content, and is typically an
                    <code>&lt;h2&gt;</code>. A form title may be followed by a short
                    paragraph describing the form's purpose and/or function in more detail.
                    This short paragraph may also include support or help links.
                  </dd>
                  <dt>
                    2 - Form Section Title:
                  </dt>
                  <dd>
                    Form section titles are subtitles used to group related form elements.
                    Section titles use a heading a step below the form title. If the form
                    title is an <code>&lt;h2&gt;</code>, the section title should be an
                    <code>&lt;h3&gt;</code>. Section titles should be left aligned with the
                    form title.
                  </dd>
                  <dt>
                    3 - Form Buttons:
                  </dt>
                  <dd>
                    A form will typically have a primary button to submit, and a
                    link button to cancel. The primary button should be left
                    aligned with the form fields. The exception to this rule
                    is when more than one form is available on a single page.
                    In the multiple-forms scenario, a link button to cancel may be
                    excluded in favor of primary or secondary navigation.
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Form Help</h3>
            </div>
            <div className="ExampleForm">
              <div className="ExampleForm-description">
                <dl>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="StyleguideSubSection row">
          <div className="col-sm-12">
            <div className="StyleguideSubSection-header">
              <h3>Form Validation</h3>
            </div>
            <FormGroup
              errors={{ validation_error: [{ reason: 'Specific form error' }] }}
              name="validation_error"
              className="row"
            >
              <div className="col-sm-2 label-col">
                <label>Validation error:</label>
              </div>
              <div className="col-sm-10 content-col">
                <Input value="Incorrect input" />
                <FormGroupError
                  errors={{ validation_error: [{ reason: 'Specific form error' }] }}
                  name="validation_error"
                />
              </div>
            </FormGroup>
            <ErrorSummary errors={{ _: [{ reason: 'Specific form error' }] }} />
          </div>
        </div>

        <div className="StyleguideFormSection row">
          <div className="col-sm-12">
            <div className="StyleguideFormSection-header">
              <h3>Form Inputs (simple)</h3>
            </div>
            <div className="ExampleForm">
              <div className="ExampleForm-description">
                <Form>
                  <div className="form-group row">
                    <div className="col-sm-3 label-col">
                      <label>Input (text)</label>
                    </div>
                    <div className="col-sm-9">
                      <Input placeholder="my-placeholder" />
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-3 label-col">
                      <label>Input (number)</label>
                    </div>
                    <div className="col-sm-9">
                      <Input type="number" value={1} min={0} max={10} />
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-3 label-col">
                      <label>Checkbox</label>
                    </div>
                    <div className="col-sm-9">
                      <Checkboxes>
                        <Checkbox label="Checkbox 1" />
                        <Checkbox label="Checkbox 2" />
                      </Checkboxes>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-3 label-col">
                      <label>Radio</label>
                    </div>
                    <div className="col-sm-9">
                      <Checkboxes>
                        <Radio label="Radio 1" />
                        <Radio label="Radio 2" />
                      </Checkboxes>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div className="col-sm-3 label-col">
                      <label>Select</label>
                    </div>
                    <div className="col-sm-9">
                      <Select value="1">
                        <option value="1">Option 1</option>
                        <option value="2">Option 2</option>
                      </Select>
                    </div>
                  </div>
                </Form>
              </div>
            </div>

            <div className="StyleguideFormSection row">
              <div className="col-sm-12">
                <div className="StyleguideFormSection-header">
                  <h3>Form Inputs (complex)</h3>
                </div>
                <div className="ExampleForm">
                  <div className="ExampleForm-description">
                    <Form>
                      <div className="form-group row">
                        <div className="col-sm-3 label-col">
                          <label>Password input</label>
                        </div>
                        <div className="col-sm-9">
                          <PasswordInput />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3 label-col">
                          <label>Checkbox input combo</label>
                        </div>
                        <div className="col-sm-9">
                          <CheckboxInputCombo
                            checkboxLabel="Checkbox 1"
                            inputDisabled
                            inputValue="Input 1"
                          />
                          <CheckboxInputCombo
                            checkboxLabel="Checkbox 2"
                            inputValue="Input 2"
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3 label-col">
                          <label>Radio input combo</label>
                        </div>
                        <div className="col-sm-9">
                          <RadioInputCombo
                            radioLabel="Radio 1"
                            inputDisabled
                            inputValue="Input 1"
                          />
                          <RadioInputCombo
                            radioLabel="Radio 2"
                            inputValue="Input 2"
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-sm-3 label-col">
                          <label>Radio select combo</label>
                        </div>
                        <div className="col-sm-9">
                          <RadioSelectCombo
                            radioLabel="Radio 1"
                            inputDisabled
                            inputValue="Input 1"
                            selectOptions={[{ value: '1', label: 'Option 1' }]}
                          />
                          <RadioSelectCombo
                            radioLabel="Radio 2"
                            selectOptions={[{ value: '1', label: 'Option 2' },
                                            { value: '2', label: 'Option 2.1' }]}
                          />
                        </div>
                      </div>
                    </Form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
