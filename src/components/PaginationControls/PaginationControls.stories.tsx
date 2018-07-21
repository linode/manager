import { storiesOf } from '@storybook/react';
import * as React from 'react';

import ThemeDecorator from 'src/utilities/storybookDecorators';

import PaginationControls from './PaginationControls';

class Example extends React.Component<{}, { currentPage: number }> {
  constructor(props: { range: number }) {
    super(props);
    this.state = { currentPage: 1 };
  }

  handleClick = (page:number) => {
    this.setState({ currentPage: page });
  }

  render() {
    return (
      <PaginationControls
        count={250}
        page={this.state.currentPage}
        onClickHandler={this.handleClick}
        pageSize={25}
      />
    );
  }
}

export default Example;

storiesOf('Pagination Controls', module)
  .addDecorator(ThemeDecorator)
  .add('Interactive example', () => (
    <Example />
  ))
