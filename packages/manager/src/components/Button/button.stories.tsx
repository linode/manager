import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUp from '@material-ui/icons/KeyboardArrowUp';
import { storiesOf } from '@storybook/react';
import * as React from 'react';
import Button from 'src/components/Button';
import { default as MDivider } from 'src/components/core/Divider';

const Divider = () => (
  <MDivider style={{ marginBottom: '8px', marginTop: '8px' }} />
);

storiesOf('Button', module)
  .add('Types', () => (
    <React.Fragment>
      <Button buttonType="primary" data-qa-button="primary">
        Primary
      </Button>
      <Divider />
      <Button buttonType="secondary" data-qa-button="secondary">
        Secondary
      </Button>
      <Divider />
      <Button buttonType="cancel" data-qa-button="cancel">
        Cancel
      </Button>
      <Divider />
      <Button buttonType="remove" data-qa-button="remove" />
      <Divider />
    </React.Fragment>
  ))
  .add('Disabled', () => (
    <React.Fragment>
      <Button disabled buttonType="primary" data-qa-button="primary">
        Primary
      </Button>
      <Divider />
      <Button disabled buttonType="secondary" data-qa-button="secondary">
        Secondary
      </Button>
      <Divider />
      <Button
        disabled
        destructive
        buttonType="primary"
        data-qa-button="destructive"
      >
        Destructive
      </Button>
      <Divider />
      <Button disabled buttonType="cancel" data-qa-button="cancel">
        Cancel
      </Button>
      <Divider />
    </React.Fragment>
  ))
  .add('Loading', () => (
    <React.Fragment>
      <Button loading buttonType="primary" data-qa-button="primary">
        Primary
      </Button>
      <Divider />
      <Button loading buttonType="secondary" data-qa-button="secondary">
        Secondary
      </Button>
      <Divider />
      <Button loading buttonType="cancel" data-qa-button="cancel">
        Cancel
      </Button>
      <Divider />
    </React.Fragment>
  ))
  .add('Destructive', () => (
    <React.Fragment>
      <Button
        destructive
        buttonType="primary"
        data-qa-button="primary"
        data-qa-btn-type="destructive"
      >
        Primary
      </Button>
      <Divider />
      <Button
        disabled
        destructive
        buttonType="secondary"
        data-qa-button="secondary"
      >
        Secondary
      </Button>
      <Divider />
    </React.Fragment>
  ))
  .add('Loading Destructive', () => (
    <React.Fragment>
      <Button
        loading
        destructive
        buttonType="primary"
        data-qa-button="primary"
        data-qa-btn-type="destructive"
      >
        Primary
      </Button>
      <Divider />
      <Button
        loading
        destructive
        buttonType="secondary"
        data-qa-button="secondary"
        data-qa-btn-type="destructive"
      >
        Secondary
      </Button>
      <Divider />
    </React.Fragment>
  ))
  .add('Primary Dropdown', () => (
    <React.Fragment>
      <Button
        buttonType="primary"
        className="button-dropdown"
        data-qa-button="dropdown"
      >
        Primary Dropdown
        <KeyboardArrowDown className="caret" />
      </Button>
      <Divider />
      <Button
        buttonType="primary"
        className="button-dropdown"
        data-qa-button="dropdown"
      >
        Primary Dropdown Active
        <KeyboardArrowUp className="caret" />
      </Button>
      <Divider />
      <Button
        buttonType="primary"
        disabled
        className="button-dropdown"
        data-qa-button="dropdown"
      >
        Primary Dropdown
        <KeyboardArrowDown className="caret" />
      </Button>
    </React.Fragment>
  ))
  .add('Secondary Dropdown', () => (
    <React.Fragment>
      <Button
        buttonType="secondary"
        className="button-dropdown"
        data-qa-button="dropdown-secondary"
      >
        Secondary Dropdown
        <KeyboardArrowDown className="caret" />
      </Button>
      <Divider />
      <Button
        buttonType="secondary"
        className="button-dropdown"
        data-qa-button="dropdown-secondary"
      >
        Secondary Dropdown Active
        <KeyboardArrowUp className="caret" />
      </Button>
      <Divider />
      <Button
        buttonType="secondary"
        disabled
        className="button-dropdown"
        data-qa-button="dropdown-secondary"
      >
        Secondary Dropdown
        <KeyboardArrowDown className="caret" />
      </Button>
    </React.Fragment>
  ));
