import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';

import ThemeDecorator from '../../utilities/storybookDecorators';
import Breadcrumb from './Breadcrumb';
interface Props {
  labelLink?: string;
}
class InteractiveEditableBreadcrumb extends React.Component<Props, {}> {
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
          onEditHandlers={{
            onEdit: this.onEdit,
            onCancel: this.onCancel
          }}
          labelLink={this.props.labelLink}
        />
      </React.Fragment>
    )
  }
}

storiesOf('Breadcrumb', module)
  .addDecorator(ThemeDecorator)
  .add('Static text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo={'/linodes'}
          linkText={'Linodes'}
          label={'Static text'}
        />
      </div>
    </StaticRouter>

  )).add('Static text with label link', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo="/linodes"
          linkText="Linodes"
          label="Static text"
          labelLink="/summary"
        />
      </div>
    </StaticRouter>
  )).add('Editable text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InteractiveEditableBreadcrumb />
      </div>
    </StaticRouter>
  )).add('Editable text with label link', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InteractiveEditableBreadcrumb labelLink="/summary"/>
      </div>
    </StaticRouter>
  ));
