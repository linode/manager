import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AlertListNoticeMessages } from './AlertListNoticeMessages';

describe('AlertListNoticeMessages Component', () => {
  it('should render a single error message correctly', () => {
    const errorMessage = 'This is a single error message';

    const { getByTestId } = renderWithTheme(
      <AlertListNoticeMessages
        errorMessage={errorMessage}
        separator="|"
        variant="error"
      />
    );

    const noticeElement = getByTestId('alert_message_notice');
    expect(noticeElement).toBeInTheDocument();
    // Check if the error message is displayed in a Typography component
    expect(getByTestId('alert_message_notice')).toHaveTextContent(errorMessage);
  });

  it('should render multiple error messages in a list', () => {
    const errorMessage = 'Error 1|Error 2|Error 3';

    const { getAllByTestId } = renderWithTheme(
      <AlertListNoticeMessages
        errorMessage={errorMessage}
        separator="|"
        variant="error"
      />
    );

    const listItems = getAllByTestId('alert_notice_message_list');
    expect(listItems.length).toBe(3);

    expect(listItems[0]).toHaveTextContent('Error 1');
    expect(listItems[1]).toHaveTextContent('Error 2');
    expect(listItems[2]).toHaveTextContent('Error 3');
  });

  it('should not render any message when errorMessage is empty', () => {
    const errorMessage = '';

    const { queryAllByTestId, queryByTestId } = renderWithTheme(
      <AlertListNoticeMessages
        errorMessage={errorMessage}
        separator=" "
        variant="error"
      />
    );

    expect(queryByTestId('alert_message_notice')).toHaveTextContent('');
    expect(queryAllByTestId('alert_notice_message_list').length).toBe(0);
  });
});
