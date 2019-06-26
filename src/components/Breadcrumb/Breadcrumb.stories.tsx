import { storiesOf } from '@storybook/react';
import * as React from 'react';
import { StaticRouter } from 'react-router-dom';
import UserIcon from 'src/assets/icons/user.svg';
import Breadcrumb from './Breadcrumb';

interface Props {
  labelLink?: string;
}

const customCrumbs = '/linodes/9872893679817/test/lastcrumb' as any;

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
          pathname={customCrumbs}
          labelOptions={{
            linkTo: this.props.labelLink
          }}
          onEditHandlers={{
            editableTextTitle: this.state.text,
            onEdit: this.onEdit,
            onCancel: this.onCancel
          }}
        />
      </React.Fragment>
    );
  }
}

storiesOf('Breadcrumb', module)
  .add('Basic Breadcrumb', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb pathname={customCrumbs} removeCrumbX={2} />
      </div>
    </StaticRouter>
  ))
  .add('Breadcrumb with custom label', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb pathname={customCrumbs} labelTitle="Custom label" />
      </div>
    </StaticRouter>
  ))
  .add('Breadcrumb with subtitle', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          pathname={customCrumbs}
          labelTitle="Last crumb with subtitle"
          labelOptions={{
            subtitle: 'A label subtitle'
          }}
        />
      </div>
    </StaticRouter>
  ))
  .add('Breadcrumb with crumb override', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          pathname={customCrumbs}
          crumbOverrides={[
            {
              position: 2,
              label: 'Link changed here',
              linkTo: { pathname: `/new-location` }
            }
          ]}
        />
      </div>
    </StaticRouter>
  ))
  .add('Breadcrumb with prefix component', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          pathname={customCrumbs}
          labelTitle="Static text"
          labelOptions={{
            prefixComponent: (
              <UserIcon
                style={{
                  margin: '2px 0 0 0',
                  color: '#606469',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  animation: '$fadeIn 150ms linear forwards'
                }}
              />
            )
          }}
        />
      </div>
    </StaticRouter>
  ))
  .add('Breadcrumb with editable text', () => (
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <InteractiveEditableBreadcrumb />
      </div>
    </StaticRouter>
  ));
