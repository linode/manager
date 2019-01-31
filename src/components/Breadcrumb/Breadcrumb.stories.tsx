import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import UserIcon from 'src/assets/icons/user.svg';
import Breadcrumb from './Breadcrumb';

interface Props {
  labelLink?: string;
}
class InteractiveEditableBreadcrumb extends React.Component<Props, {}> {
  state = {
    linkTo: '/linodes',
    linkText: 'Linodes',
    text: 'Editable text!'
  };

  onEdit = (value: string) => {
    this.setState({ text: value });
    return Promise.resolve('hello world');
  };

  onCancel = () => {
    this.forceUpdate();
  };

  render() {
    return (
      <React.Fragment>
        <Breadcrumb
          linkTo={this.state.linkTo}
          linkText={this.state.linkText}
          labelTitle={this.state.text}
          labelOptions={{
            linkTo: this.props.labelLink
          }}
          onEditHandlers={{
            onEdit: this.onEdit,
            onCancel: this.onCancel
          }}
        />
      </React.Fragment>
    );
  }
}

storiesOf('Breadcrumb', module)
  .add('Static text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo={'/linodes'}
          linkText={'Linodes'}
          labelTitle={'Static text'}
        />
      </div>
    </StaticRouter>
  ))
  .add('Static text with label link', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo="/linodes"
          linkText="Linodes"
          labelTitle="Static text"
          labelOptions={{
            linkTo: '/summary'
          }}
        />
      </div>
    </StaticRouter>
  ))
  .add('Static text with subtitle', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo="/linodes"
          linkText="Linodes"
          labelTitle="Static text"
          labelOptions={{
            subtitle: 'A label subtitle'
          }}
        />
      </div>
    </StaticRouter>
  ))
  .add('Static text with link, subtitle', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo="/linodes"
          linkText="Linodes"
          labelTitle="Static text"
          labelOptions={{
            linkTo: '/summary',
            subtitle: 'A label subtitle'
          }}
        />
      </div>
    </StaticRouter>
  ))
  .add('Static text with user avatar', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Breadcrumb
          linkTo="/linodes"
          linkText="Linodes"
          labelTitle="Static text"
          labelOptions={{
            prefixComponent: (
              <UserIcon
                style={{
                  margin: '0 8px 0 -4px',
                  color: '#606469',
                  borderRadius: '50%',
                  width: '46px',
                  height: '46px',
                  animation: 'fadeIn 150ms linear forwards'
                }}
              />
            )
          }}
        />
      </div>
    </StaticRouter>
  ))
  .add('Editable text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InteractiveEditableBreadcrumb />
      </div>
    </StaticRouter>
  ))
  .add('Editable text with label link', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <InteractiveEditableBreadcrumb labelLink="/summary" />
      </div>
    </StaticRouter>
  ));
