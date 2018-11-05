import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Breadcrumb from './Breadcrumb';

class InteractiveStaticBreadcrumb extends React.Component {
  state = {
    backLink: '/linodes',
    backText: 'Linodes',
    text: 'Static text',
  }

  render() {
    return (
      <React.Fragment>
        <Breadcrumb
          backLink={this.state.backLink}
          backText={this.state.backText}
          text={this.state.text}
        />
      </React.Fragment>
    )
  }
}

class InteractiveEditableBreadcrumb extends React.Component {
  state = {
    backLink: '/linodes',
    backText: 'Linodes',
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
          backLink={this.state.backLink}
          backText={this.state.backText}
          text={this.state.text}
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
      <InteractiveStaticBreadcrumb />
    </StaticRouter>
  )).add('Editable Text', () => (
    <StaticRouter location="/" context={{}}>
      <InteractiveEditableBreadcrumb />
    </StaticRouter>
  ));
