import React from 'react';

import { StyleguideSection } from '~/styleguide/components';

import { Form, FormGroup, CancelButton, SubmitButton } from '~/components/form';

export default function Forms() {
  return (
    <StyleguideSection name="forms" title="Forms">
      <div className="col-sm-12">
        <div className="StyleguideFormSection row">
          <div className="col-sm-12">
            <div className="StyleguideFormSection-header">
              <h3>Form Details</h3>
            </div>
            <div className="ExampleForm">
              <Form>
                <FormGroup className="row">
                  <label className="col-sm-4">
                    <span className="FormDescriptor FormDescriptor__form-labels">
                      <span className="badge">1</span>
                    </span>
                    Field Label
                  </label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-4">Field Label</label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                    <span className="FormDescriptor FormDescriptor__form-fields">
                      <span className="badge">2</span>
                    </span>
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-4">Field Lengths</label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-4">Field Label</label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" disabled />
                    <span className="FormDescriptor FormDescriptor__disabled-fields">
                      <span className="badge">3</span>
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
                  </dd>
                  <dt>
                    2 - Form Fields:
                  </dt>
                  <dd>
                  </dd>
                  <dt>
                    3 - Disabled Fields:
                  </dt>
                  <dd>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="StyleguideFormSection row">
          <div className="col-sm-12">
            <div className="StyleguideFormSection-header">
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
                  A short description about the purpose of this form.
                  <a href="#">Learn More.</a>
                </p>
                <FormGroup className="row">
                  <label className="col-sm-4">Field Label</label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>

                <h3>Form Section Title</h3>
                <FormGroup className="row">
                  <span className="FormDescriptor FormDescriptor__form-section-title">
                    <span className="badge">2</span>
                  </span>
                  <label className="col-sm-4">Field Label</label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>
                <FormGroup className="row">
                  <label className="col-sm-4">Field Label</label>
                  <div className="col-sm-8">
                    <input type="text" name="example-form-field" className="form-control" />
                  </div>
                </FormGroup>

                <FormGroup className="row">
                  <div className="offset-sm-4 col-sm-8">
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

        <div className="StyleguideFormSection row">
          <div className="col-sm-12">
            <div className="StyleguideFormSection-header">
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

        <div className="StyleguideFormSection row">
          <div className="col-sm-12">
            <div className="StyleguideFormSection-header">
              <h3>Form Validation</h3>
            </div>
            <div className="ExampleForm">
              <div className="ExampleForm-description">
                <dl>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
