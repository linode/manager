import { storiesOf } from '@storybook/react';
import * as React from 'react';
import PlusSquare from 'src/assets/icons/plus-square.svg';
import IconTextLink from './IconTextLink';
import IconTextLink_CMR from 'src/components/IconTextLink/IconTextLink_CMR';

class InteractiveIconTextLink extends React.Component {
  state = {
    active: false
  };

  handleClick = () => {
    alert('Thanks for clicking!');
    this.setState({ active: true });
  };

  render() {
    return (
      <React.Fragment>
        <IconTextLink
          active={this.state.active}
          SideIcon={PlusSquare}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
        <br />
        <br />
        <IconTextLink
          disabled
          SideIcon={PlusSquare}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
      </React.Fragment>
    );
  }
}

class InteractiveIconTextLinkCMR extends React.Component {
  state = {
    active: false
  };

  handleClick = () => {
    alert('Thanks for clicking!');
    this.setState({ active: true });
  };

  render() {
    return (
      <React.Fragment>
        <IconTextLink_CMR
          active={this.state.active}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
        <br />
        <br />
        <IconTextLink_CMR
          disabled
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
      </React.Fragment>
    );
  }
}

storiesOf('IconTextLink', module).add('CMR', () => (
  <InteractiveIconTextLinkCMR />
));

storiesOf('IconTextLink', module).add('Interactive', () => (
  <InteractiveIconTextLink />
));
