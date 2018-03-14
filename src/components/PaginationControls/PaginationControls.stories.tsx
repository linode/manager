import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import PaginationControls from './PaginationControls';

import {
  MuiThemeProvider, 
  createMuiTheme,
} from 'material-ui/styles';
import LinodeTheme from '../../../src/theme';

const theme = createMuiTheme(LinodeTheme as Linode.TodoAny);
theme.shadows = theme.shadows.fill('none');

storiesOf('Pagination Controls', module)
  .add('first page', () => (
    <MuiThemeProvider theme={theme}>
      <PaginationControls
        pages={[1,2,3,4]}
        currentPage={1}
        onClickHandler={action('click')} 
      />
    </MuiThemeProvider>
  ))
  .add('last page', () => (
    <MuiThemeProvider theme={theme}>
      <PaginationControls
        pages={[1,2,3,4]}
        currentPage={4}
        onClickHandler={action('click')} 
      />
    </MuiThemeProvider>
  ))
  .add('on page', () => (
    <MuiThemeProvider theme={theme}>
      <PaginationControls
        pages={[1,2,3,4]}
        currentPage={2}
        onClickHandler={action('click')}
      />
    </MuiThemeProvider>
  ));
