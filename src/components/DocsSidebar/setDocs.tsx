import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearDocs, setDocs } from 'src/store/documentation';

export type SetDocsProps = DispatchProps;

const setDocsHOC = (docs: Linode.Doc[]) =>
<OriginalProps extends {}>(Component: React.ComponentType<OriginalProps>) => {
  class SetDocumentation extends React.Component<OriginalProps & DispatchProps> {

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

interface DispatchProps {
  setDocs: typeof setDocs;
  clearDocs: typeof clearDocs;
}

const mapDispatchToProps: MapDispatchToProps<DispatchProps, SetDocsProps> = (dispatch) =>
  bindActionCreators({ setDocs, clearDocs }, dispatch);

export default setDocsHOC;
