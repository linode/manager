import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { bindActionCreators } from 'redux';
import { clearDocs, setDocs } from 'src/store/documentation';

export type SetDocsProps = DispatchProps;

type RequestDocs = (ownProps: any) => Linode.Doc[];

type UpdateCond = (prevProps: any, nextProps: any) => boolean;

const setDocsHOC = (
  docs: Linode.Doc[] | RequestDocs,
  updateCond?: UpdateCond
) => <OriginalProps extends {}>(
  Component: React.ComponentType<OriginalProps>
) => {
  class SetDocumentation extends React.Component<
    OriginalProps & DispatchProps
  > {
    componentDidMount() {
      if (typeof docs === 'function') {
        this.props.setDocs(docs(this.props));
      } else {
        this.props.setDocs(docs);
      }
    }

    componentDidUpdate(prevProps: any) {
      if (!!updateCond && updateCond(prevProps, this.props) === true) {
        if (typeof docs === 'function') {
          this.props.setDocs(docs(this.props));
        } else {
          this.props.setDocs(docs);
        }
      }
    }

    componentWillUnmount() {
      this.props.clearDocs();
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  const connected = connect(
    undefined,
    mapDispatchToProps
  );

  return connected(SetDocumentation);
};

interface DispatchProps {
  setDocs: typeof setDocs;
  clearDocs: typeof clearDocs;
}

const mapDispatchToProps: MapDispatchToProps<
  DispatchProps,
  SetDocsProps
> = dispatch => bindActionCreators({ setDocs, clearDocs }, dispatch);

export default setDocsHOC;
