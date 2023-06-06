import * as React from 'react';
import { renderWithTheme, wrapWithTableBody } from 'src/utilities/testHelpers';
import { Row, RowProps } from './EventRow';
import { getEventTimestamp } from 'src/utilities/eventUtils';
import { eventFactory } from 'src/factories';

const inProgressMessage = 'this is an in-progress message.';
const finishedMessage = 'this is a finished message';
const createdTimestamp = '2018-12-02T20:23:43';
const finishedTimestamp = '2018-12-02T20:24:43';

const mockInProgressEvent = eventFactory.build({
  status: 'started',
  created: createdTimestamp,
  duration: 0,
});
const mockFinishedEvent = eventFactory.build({
  status: 'finished',
  duration: 60,
  created: createdTimestamp,
});

const inProgressEventProps: RowProps = {
  action: 'linode_boot',
  message: inProgressMessage,
  type: 'linode',
  username: null,
  timestamp: getEventTimestamp(mockInProgressEvent),
};

const finishedEventProps: RowProps = {
  action: 'linode_boot',
  message: finishedMessage,
  type: 'linode',
  username: null,
  timestamp: getEventTimestamp(mockFinishedEvent),
};

describe('EventRow component', () => {
  it('should render an event with a message', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<Row {...inProgressEventProps} />)
    );

    expect(getByText(inProgressMessage)).toBeInTheDocument();
  });

  it("shouldn't render events without a message", () => {
    const emptyMessageProps = { ...inProgressEventProps, message: undefined };
    const { container } = renderWithTheme(
      wrapWithTableBody(<Row {...emptyMessageProps} />)
    );
    expect(container.closest('tr')).toBeNull();
  });

  // TODO: figure out why table row doesn't display Absolute Date column
  xit('should render an in-progress event with the original "created" timestamp', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<Row {...finishedEventProps} />)
    );

    expect(getByText(createdTimestamp)).toBeInTheDocument();
  });

  // TODO: figure out why table row doesn't display Absolute Date column
  xit('should render a finished event with a finished timestamp', () => {
    const { getByText } = renderWithTheme(
      wrapWithTableBody(<Row {...finishedEventProps} />)
    );

    expect(getByText(finishedTimestamp)).toBeInTheDocument();
  });
});
