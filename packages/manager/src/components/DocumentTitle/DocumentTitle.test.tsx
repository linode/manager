import { mount } from 'enzyme';
import * as React from 'react';

import {
  DocumentTitleSegment,
  withDocumentTitleProvider
} from 'src/components/DocumentTitle';

class MyParent extends React.Component<any, any> {
  render() {
    return (
      <React.Fragment>
        <DocumentTitleSegment segment={`Linode Manager`} />
        <MyChild />
      </React.Fragment>
    );
  }
}

class MyChild extends React.Component<any, any> {
  render() {
    return <DocumentTitleSegment segment={`Profile`} />;
  }
}

describe('Document Title HOC', () => {
  it('document title should read "Profile | Linode Manager', () => {
    const DocComponent = withDocumentTitleProvider(MyParent);
    mount(<DocComponent />);

    expect(document.title).toEqual('Profile | Linode Manager');
  });
});
