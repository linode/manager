import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import Notice from 'src/components/Notice';

export interface Props {
  title: string;
  loading: boolean;
  error: boolean;
}

export class DrawerContent extends React.PureComponent<Props> {
  render() {
    const { title, loading, error, children } = this.props;
    if (loading) {
      return <CircleProgress />;
    }

    if (error) {
      return (
        <Notice error spacingTop={8}>
          Couldn't load {title}
        </Notice>
      );
    }

    return <React.Fragment>{children}</React.Fragment>;
  }
}

export default DrawerContent;
