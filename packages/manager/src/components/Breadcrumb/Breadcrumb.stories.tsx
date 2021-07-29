import * as React from 'react';
import { Provider } from 'react-redux';
import { StaticRouter } from 'react-router-dom';
import UserIcon from 'src/assets/icons/user.svg';
import store from 'src/store';
import Breadcrumb from './Breadcrumb';

interface Props {
  labelLink?: string;
}

const customCrumbs = '/linodes/9872893679817/test/lastcrumb' as any;

class InteractiveEditableBreadcrumb extends React.Component<Props, {}> {
  state = {
    linkTo: '/linodes',
    linkText: 'Linodes',
    text: 'Editable text!',
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
      <Breadcrumb
        pathname={customCrumbs}
        labelOptions={{
          linkTo: this.props.labelLink,
        }}
        onEditHandlers={{
          editableTextTitle: this.state.text,
          onEdit: this.onEdit,
          onCancel: this.onCancel,
        }}
      />
    );
  }
}

export default {
  title: 'UI Elements/Breadcrumb',
};

export const BasicBreadcrumb = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb pathname={customCrumbs} />
      </div>
    </StaticRouter>
  </Provider>
);

export const BreadcrumbWithCustomLabel = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb pathname={customCrumbs} labelTitle="Custom label" />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithCustomLabel.story = {
  name: 'Breadcrumb with custom label',
};

export const BreadcrumbWithSubtitle = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          pathname={customCrumbs}
          labelTitle="Last crumb with subtitle"
          labelOptions={{
            subtitle: 'A label subtitle',
          }}
        />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithSubtitle.story = {
  name: 'Breadcrumb with subtitle',
};

export const BreadcrumbWithOnlyFirstAndLastCrumbs = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb pathname={customCrumbs} firstAndLastOnly />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithOnlyFirstAndLastCrumbs.story = {
  name: 'Breadcrumb with only first and last crumbs',
};

export const BreadcrumbWithACrumbRemoved = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb pathname={customCrumbs} removeCrumbX={2} />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithACrumbRemoved.story = {
  name: 'Breadcrumb with a crumb removed',
};

export const BreadcrumbWithCrumbOverride = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <Breadcrumb
          pathname={customCrumbs}
          crumbOverrides={[
            {
              position: 2,
              label: 'Link changed here',
              linkTo: { pathname: `/new-location` },
            },
          ]}
        />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithCrumbOverride.story = {
  name: 'Breadcrumb with crumb override',
};

export const BreadcrumbWithPrefixComponent = () => (
  <Provider store={store}>
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
                  animation: '$fadeIn 150ms linear forwards',
                }}
              />
            ),
          }}
        />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithPrefixComponent.story = {
  name: 'Breadcrumb with prefix component',
};

export const BreadcrumbWithEditableText = () => (
  <Provider store={store}>
    <StaticRouter location="/" context={{}}>
      <div style={{ padding: 24 }}>
        <InteractiveEditableBreadcrumb />
      </div>
    </StaticRouter>
  </Provider>
);

BreadcrumbWithEditableText.story = {
  name: 'Breadcrumb with editable text',
};
