import * as React from 'react';
import { storiesOf } from '@storybook/react';
import PaginationControls from './PaginationControls';

import {
  MuiThemeProvider,
  createMuiTheme,
} from 'material-ui/styles';
import LinodeTheme from '../../../src/theme';

class Implementor extends React.Component<{ range: number }, { currentPage: number }> {
  constructor(props: { range: number }) {
    super(props);
    this.state = { currentPage: 1 };
  }

  handleClick = (page:number) => {
    this.setState({ currentPage: page });
  }

  render() {
    const pages = Array.from(Array(14), (_, idx) => idx + 1);

    return (
    <MuiThemeProvider theme={theme}>
      <PaginationControls
        pages={pages}
        currentPage={this.state.currentPage}
        onClickHandler={this.handleClick}
        range={this.props.range}
      />
    </MuiThemeProvider>
    );
  }
}

export default Implementor;

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

storiesOf('Pagination Controls', module)
  .add('With even range.', () => (
    <Implementor range={10} />
  ))
  .add('With odd range.', () => (
    <Implementor range={13} />
  ));
