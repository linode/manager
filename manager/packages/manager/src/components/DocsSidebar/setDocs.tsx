import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { compose } from 'recompose';
import {
  clearDocs as _clearDocs,
  setDocs as _setDocs,
} from 'src/store/documentation';

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

    componentDidUpdate(prevProps: OriginalProps & DispatchProps) {
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

  const mapDispatchToProps: MapDispatchToProps<DispatchProps, OriginalProps> = (
    dispatch
  ) => ({
    setDocs: (d: Linode.Doc[]) => dispatch(_setDocs(d)),
    clearDocs: () => dispatch(_clearDocs()),
  });

  const connected = compose<DispatchProps & OriginalProps, OriginalProps>(
    connect(undefined, mapDispatchToProps)
  );

  return connected(SetDocumentation);
};

interface DispatchProps {
  setDocs: (d: Linode.Doc[]) => void;
  clearDocs: () => void;
}

export default setDocsHOC;
