import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { clearDocs, setDocs } from 'src/store/reducers/documentation';

export interface SetDocsProps {
  setDocs: typeof setDocs;
  clearDocs: typeof clearDocs;
}

const setDocsHOC = (docs: Linode.Doc[]) =>
  <OriginalProps extends {}>(Component: React.ComponentType<OriginalProps>) => {
    class SetDocumentation extends React.Component<OriginalProps & SetDocsProps> {

      componentDidMount() {
        this.props.setDocs(docs);
      }

      componentWillUnmount() {
        this.props.clearDocs();
      }

      render() {
        return <Component {...this.props} />;
      }
    }

    const connected = connect(undefined, mapDispatchToProps);

    return connected(SetDocumentation);
  };

const mapDispatchToProps = (dispatch: Dispatch<any>) =>
  bindActionCreators({ setDocs, clearDocs }, dispatch);

export default setDocsHOC;
