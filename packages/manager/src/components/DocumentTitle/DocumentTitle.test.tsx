import * as React from 'react';
import {
  DocumentTitleSegment,
  withDocumentTitleProvider,
} from 'src/components/DocumentTitle';
import { renderWithTheme } from 'src/utilities/testHelpers';

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

    renderWithTheme(<DocComponent />);

    expect(document.title).toEqual('Profile | Linode Manager');
  });
});
