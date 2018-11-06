import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Breadcrumb from './Breadcrumb';

class InteractiveStaticBreadcrumb extends React.Component {
  state = {
    linkTo: '/linodes',
    linkText: 'Linodes',
    text: 'Static text',
  }

  render() {
    return (
      <React.Fragment>
        <Breadcrumb
          linkTo={this.state.linkTo}
          linkText={this.state.linkText}
          label={this.state.text}
        />
      </React.Fragment>
    )
  }
}

class InteractiveEditableBreadcrumb extends React.Component {
  state = {
    linkTo: '/linodes',
    linkText: 'Linodes',
    text: 'Editable text!',
  }

  onEdit = (value: string) => {
    this.setState({ text: value });
  }

  onCancel = () => {
    this.forceUpdate();
  }

  render() {
    return (
      <React.Fragment>
        <Breadcrumb
          linkTo={this.state.linkTo}
          linkText={this.state.linkText}
          label={this.state.text}
          onEdit={this.onEdit}
          onCancel={this.onCancel}
        />
      </React.Fragment>
    )
  }
}

storiesOf('Breadcrumb', module)
  .addDecorator(ThemeDecorator)
  .add('Static Text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InteractiveStaticBreadcrumb />
      </div>
    </StaticRouter>
  )).add('Editable Text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InteractiveEditableBreadcrumb />
      </div>
    </StaticRouter>
  ));
