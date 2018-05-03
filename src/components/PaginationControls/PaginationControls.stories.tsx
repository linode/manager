import * as React from 'react';
import { storiesOf } from '@storybook/react';

import ThemeDecorator from 'src/utilities/storybookDecorators';

import PaginationControls from './PaginationControls';

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
      <PaginationControls
        pages={pages}
        currentPage={this.state.currentPage}
        onClickHandler={this.handleClick}
        range={this.props.range}
      />
    );
  }
}

export default Implementor;

storiesOf('Pagination Controls', module)
  .addDecorator(ThemeDecorator)
  .add('With even range.', () => (
    <Implementor range={10} />
  ))
  .add('With odd range.', () => (
    <Implementor range={13} />
  ));
