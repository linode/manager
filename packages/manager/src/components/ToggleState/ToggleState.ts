import * as React from 'react';

interface RenderProps {
  open: boolean;
  toggle: () => void;
}
interface ToggleStateProps {
  children: (p: RenderProps) => React.ReactNode;
}
class ToggleState extends React.PureComponent<
  ToggleStateProps,
  { open: boolean }
> {
  state = { open: false };

  toggle = () => this.setState({ open: !this.state.open });

  render() {
    const { children } = this.props;
    const { open } = this.state;

    return children({ open, toggle: this.toggle });
  }
}

export default ToggleState;
