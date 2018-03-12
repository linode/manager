import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import PaginationControls from './PaginationControls';

storiesOf('Pagination Controls', module)
  .add('first page', () => (
    <PaginationControls
      pages={[1,2,3,4]}
      currentPage={1}
      onClickHandler={action('click')} 
    />
  ))
  .add('last page', () => (
    <PaginationControls
      pages={[1,2,3,4]}
      currentPage={4}
      onClickHandler={action('click')} 
    />
  ))
  .add('on page', () => (
    <PaginationControls
      pages={[1,2,3,4]}
      currentPage={2}
      onClickHandler={action('click')} 
    />
  ));
