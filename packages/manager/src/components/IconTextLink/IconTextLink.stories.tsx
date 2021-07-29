import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import * as React from 'react';
import IconTextLink from './IconTextLink';

class InteractiveIconTextLink extends React.Component {
  state = {
    active: false,
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
          SideIcon={KeyboardArrowDown}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
        <br />
        <br />
        <IconTextLink
          disabled
          SideIcon={KeyboardArrowDown}
          onClick={this.handleClick}
          text="Add an object"
          title="Link title"
        />
      </React.Fragment>
    );
  }
}

export default {
  title: 'UI Elements/Link/Icon Text Link',
};

export const Interactive = () => <InteractiveIconTextLink />;
