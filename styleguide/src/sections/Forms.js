import React from 'react';

import { StyleguideSection } from '../components';

import {
  ErrorSummary, Form, FormGroup, SubmitButton, Input, Radio, Checkbox, Select, CheckboxInputCombo,
  FormGroupError, RadioInputCombo, RadioSelectCombo, Checkboxes, PasswordInput,
} from 'linode-components/forms';
import { CancelButton } from 'linode-components/buttons';


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
              <Form onSubmit={() => {}}>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label">
                    <span className="FormDescriptor FormDescriptor__form-labels">
                      <span className="badge">1</span>
                    </span>
                    Field label
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control"
                      placeholder="Placeholder"
                    />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label">
                    <span className="FormDescriptor FormDescriptor__required-field">
                      <span className="badge">2</span>
                    </span>
                    Required field
                  </label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control"
                      placeholder="Placeholder"
                    />
                    <span className="FormDescriptor FormDescriptor__form-fields">
                      <span className="badge">3</span>
                    </span>
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label">Field Lengths</label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control"
                      placeholder="225px"
                    />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label"></label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control input-md"
                      placeholder="275px"
                    />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label"></label>
                  <div className="col-sm-9">
                    <input
                      type="text"
                      name="example-form-field"
                      className="form-control input-lg"
                      placeholder="325px"
                    />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label">Disabled field</label>
                  <div className="col-sm-9">
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
                </FormGroup>
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
              <Form onSubmit={() => {}}>
                <span className="FormDescriptor FormDescriptor__form-title">
                  <span className="badge">1</span>
                </span>
                <h2>Form Title</h2>
                <p>
                  A short description about the purpose of this form. <a href="#">Learn More.</a>
                </p>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label">Field label</label>
                  <div className="col-sm-9">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>

                <h3>Form Section Title</h3>
                <FormGroup className="row">
                  <span className="FormDescriptor FormDescriptor__form-section-title">
                    <span className="badge">2</span>
                  </span>
                  <label className="col-sm-3 col-form-label">Field label</label>
                  <div className="col-sm-9">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-3 col-form-label">Field label</label>
                  <div className="col-sm-9">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>

                <FormGroup className="row">
                  <div className="offset-sm-3 col-sm-9">
                    <span className="FormDescriptor FormDescriptor__form-buttons">
                      <span className="badge">3</span>
                    </span>
                    <SubmitButton />
                    <CancelButton />
                  </div>
                </FormGroup>
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
              <label className="col-sm-3 col-form-label">Validation error:</label>
              <div className="col-sm-9">
                <Input
                  value="Incorrect input"
                  onChange={() => {}}
                />
                <FormGroupError
                  errors={{ validation_error: [{ reason: 'Specific form error' }] }}
                  name="validation_error"
                />
              </div>
            </FormGroup>
            <FormGroup
              errors={{ validation_error: [{ reason: 'Specific form error' }] }}
              name="validation_error"
              className="row"
            >
              <label className="col-sm-3 col-form-label">Multiple validation errors:</label>
              <div className="col-sm-9">
                <Input
                  value="Incorrect input"
                  onChange={() => {}}
                />
                <FormGroupError
                  errors={{ validation_error: [{ reason: 'Error 1. Error 2' }] }}
                  name="validation_error"
                />
              </div>
            </FormGroup>
            <div className="row">
              <div className="col-sm-3 row-label">
                Form validation error
              </div>
              <div className="col-sm-9">
                <ErrorSummary errors={{ _: [{ reason: 'Form level error' }] }} />
              </div>
            </div>
            <div className="row">
              <div className="col-sm-3 row-label">
                Multiple form validation errors
              </div>
              <div className="col-sm-9">
                <ErrorSummary
                  errors={{
                    _: [
                      { reason: 'Form level error 1' },
                      { reason: 'Form level error 2' },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="StyleguideFormSection row">
          <div className="col-sm-12">
            <div className="StyleguideFormSection-header">
              <h3>Form Inputs (simple)</h3>
            </div>
            <div className="ExampleForm">
              <div className="ExampleForm-description">
                <Form onSubmit={() => {}}>
                  <FormGroup className="row">
                    <label className="col-sm-3 col-form-label">Input (text)</label>
                    <div className="col-sm-9">
                      <Input
                        placeholder="my-placeholder"
                        onChange={() => {}}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="row">
                    <label className="col-sm-3 col-form-label">Input (number)</label>
                    <div className="col-sm-9">
                      <Input
                        type="number"
                        value={1}
                        min={0}
                        max={10}
                        onChange={() => {}}
                      />
                    </div>
                  </FormGroup>
                  <FormGroup className="row">
                    <label className="col-sm-3 col-form-label">Checkbox</label>
                    <div className="col-sm-9">
                      <Checkboxes>
                        <Checkbox
                          id="example-checkbox-1"
                          label="Checkbox 1"
                          onChange={() => {}}
                        />
                        <Checkbox
                          id="example-checkbox-2"
                          label="Checkbox 2"
                          onChange={() => {}}
                        />
                      </Checkboxes>
                    </div>
                  </FormGroup>
                  <FormGroup className="row">
                    <label className="col-sm-3 col-form-label">Radio</label>
                    <div className="col-sm-9">
                      <Checkboxes>
                        <Radio
                          name="example-radiogroup-1"
                          label="Radio 1"
                          checked={!!1}
                          onChange={() => {}}
                        />
                        <Radio
                          name="example-radiogroup-1"
                          label="Radio 2"
                          checked={!!0}
                          onChange={() => {}}
                        />
                      </Checkboxes>
                    </div>
                  </FormGroup>
                  <FormGroup className="row">
                    <label className="col-sm-3 col-form-label">Select</label>
                    <div className="col-sm-9">
                      <Select
                        value="1"
                        onChange={() => {}}
                      >
                        <option value="1">Option 1</option>
                        <option value="2">Option 2</option>
                      </Select>
                    </div>
                  </FormGroup>
                  <FormGroup className="row">
                    <label className="col-sm-3 col-form-label">Textarea</label>
                    <div className="col-sm-9">
                      <textarea placeholder="Notes"></textarea>
                    </div>
                  </FormGroup>
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
                    <Form onSubmit={() => {}}>
                      <FormGroup className="row">
                        <label className="col-sm-3 col-form-label">Password input</label>
                        <div className="col-sm-9">
                          <PasswordInput
                            onChange={() => {}}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup className="row">
                        <label className="col-sm-3 col-form-label">Checkbox input combo</label>
                        <div className="col-sm-9">
                          <CheckboxInputCombo
                            checkboxLabel="Checkbox 1"
                            checkboxOnChange={() => {}}
                            checkboxChecked={!!1}
                            inputDisabled
                            inputValue="Input 1"
                            inputOnChange={() => {}}
                          />
                          <CheckboxInputCombo
                            checkboxLabel="Checkbox 2"
                            checkboxOnChange={() => {}}
                            checkboxChecked={false}
                            inputValue="Input 2"
                            inputOnChange={() => {}}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup className="row">
                        <label className="col-sm-3 col-form-label">Radio input combo</label>
                        <div className="col-sm-9">
                          <RadioInputCombo
                            radioLabel="Radio 1"
                            radioOnChange={() => {}}
                            radioChecked={!!1}
                            inputDisabled
                            inputValue="Input 1"
                            inputOnChange={() => {}}
                          />
                          <RadioInputCombo
                            radioLabel="Radio 2"
                            radioOnChange={() => {}}
                            radioChecked={false}
                            inputValue="Input 2"
                            inputOnChange={() => {}}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup className="row">
                        <label className="col-sm-3 col-form-label">
                          Checkbox input combo w/ label
                        </label>
                        <div className="col-sm-9">
                          <CheckboxInputCombo
                            checkboxLabel="Checkbox 1"
                            checkboxOnChange={() => {}}
                            checkboxChecked={!!1}
                            inputDisabled
                            inputValue="Input 1"
                            inputLabel="%"
                            inputOnChange={() => {}}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup className="row">
                        <label className="col-sm-3 col-form-label">
                          Radio input combo with label
                        </label>
                        <div className="col-sm-9">
                          <RadioInputCombo
                            radioLabel="Radio 1"
                            radioOnChange={() => {}}
                            radioChecked={!!1}
                            inputDisabled
                            inputValue="Input 1"
                            inputLabel="%"
                            inputOnChange={() => {}}
                          />
                        </div>
                      </FormGroup>
                      <FormGroup className="row">
                        <label className="col-sm-3 col-form-label">Radio select combo</label>
                        <div className="col-sm-9">
                          <RadioSelectCombo
                            radioLabel="Radio 1"
                            radioOnChange={() => {}}
                            radioChecked={!!1}
                            inputDisabled
                            inputValue="Input 1"
                            selectValue="1"
                            selectOptions={[{ value: '1', label: 'Option 1' }]}
                            selectOnChange={() => {}}
                          />
                          <RadioSelectCombo
                            radioLabel="Radio 2"
                            radioOnChange={() => {}}
                            radioChecked={false}
                            selectValue="1"
                            selectOptions={[{ value: '1', label: 'Option 2' },
                              { value: '2', label: 'Option 2.1' }]}
                            selectOnChange={() => {}}
                          />
                        </div>
                      </FormGroup>
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
