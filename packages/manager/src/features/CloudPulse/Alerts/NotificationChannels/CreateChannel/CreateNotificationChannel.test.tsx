import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CREATE_CHANNEL_SUCCESS_MESSAGE } from '../../constants';
import { CreateNotificationChannel } from './CreateNotificationChannel';

const queryMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue({}),
  navigate: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/alerts');
  return {
    ...actual,
    useCreateNotificationChannel: vi.fn(() => ({
      mutateAsync: queryMocks.mutateAsync,
    })),
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => queryMocks.navigate),
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountUsersInfiniteQuery: vi.fn(() => ({
      data: {
        pages: [
          { data: [{ username: 'testuser1' }, { username: 'testuser2' }] },
        ],
      },
      fetchNextPage: vi.fn(),
      hasNextPage: false,
      isFetching: false,
      isLoading: false,
    })),
  };
});

const CHANNEL_TYPE_SELECT_TESTID = 'channel-type-select';
const OPEN_BUTTON_LABEL = 'Open';
const EMAIL_OPTION_LABEL = 'Email';
const NAME_LABEL = 'Name';
const REQUIRED_FIELD_ERROR = 'This field is required.';
const CHANNEL_NAME_VALUE = 'My Email Channel';

describe('CreateNotificationChannel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.mutateAsync.mockResolvedValue({});
  });

  it('should render the breadcrumb and form title', () => {
    renderWithTheme(<CreateNotificationChannel />);

    expect(screen.getByText('Notification Channels')).toBeVisible();
    expect(screen.getByText('Channel Settings')).toBeVisible();
  });

  it('should render the channel type select component', async () => {
    renderWithTheme(<CreateNotificationChannel />);

    expect(screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID)).toBeVisible();
    expect(screen.getByText('Type')).toBeVisible();
    expect(screen.getByPlaceholderText('Select a Channel Type')).toBeVisible();
    // Verify that the options are rendered
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(
      screen.getByRole('option', { name: EMAIL_OPTION_LABEL })
    ).toBeVisible();
  });

  it('should render name field when a channel type is selected', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // verify the name field is not visible before a channel type is selected
    expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();

    // Select a channel type
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    // Name field should now be visible
    expect(screen.getByLabelText(NAME_LABEL)).toBeVisible();
    expect(
      screen.getByPlaceholderText('Enter a name for the channel')
    ).toBeVisible();
  });

  it('should be able to enter a value in the name field', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Select a channel type first
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    // Type in the name field
    const nameInput = screen.getByLabelText(NAME_LABEL);
    await user.type(nameInput, CHANNEL_NAME_VALUE);

    const textfieldInput = within(screen.getByTestId('alert-name')).getByTestId(
      'textfield-input'
    );
    expect(textfieldInput).toHaveAttribute('value', CHANNEL_NAME_VALUE);
  });

  it('should display validation error for channel type field with no selection', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Trigger validation by blurring the channel type field
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    const combobox = within(channelTypeSelect).getByRole('combobox');
    await user.click(combobox);
    await user.tab();

    await screen.findByText(REQUIRED_FIELD_ERROR);
  });

  it('should display validation error for name field with no value', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Select a channel type
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    // Focus and blur the name field without entering a value
    const nameInput = screen.getByLabelText(NAME_LABEL);
    await user.click(nameInput);
    await user.tab();

    await screen.findByText(REQUIRED_FIELD_ERROR);
  });

  it('should display validation error for name field with special characters', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Select a channel type
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    const nameInput = screen.getByLabelText(NAME_LABEL);
    await user.type(nameInput, '*#&+:<>"?@%');
    await user.tab();

    await screen.findByText(
      'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.'
    );
  });

  it('should display validation error for recipients field with no value', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Select a channel type
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    const recipientsInput = screen.getByLabelText('Recipients');
    await user.click(recipientsInput);
    await user.tab();

    await screen.findByText(REQUIRED_FIELD_ERROR);
  });

  it('should be able to submit the form with valid values', async () => {
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Select a channel type
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    const nameInput = screen.getByLabelText(NAME_LABEL);
    await user.type(nameInput, CHANNEL_NAME_VALUE);

    // Select a recipient from the autocomplete dropdown
    const recipientsSelect = screen.getByTestId('recipients-select');
    await user.click(
      within(recipientsSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: 'testuser1' }));

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await screen.findByText(CREATE_CHANNEL_SUCCESS_MESSAGE);

    expect(queryMocks.mutateAsync).toHaveBeenCalled();
    expect(queryMocks.navigate).toHaveBeenCalledWith({
      to: '/alerts/notification-channels',
    });
  });

  it('should show error snackbar message when creating notification channel fails', async () => {
    queryMocks.mutateAsync.mockRejectedValue([{ reason: 'There is an error' }]);
    const user = userEvent.setup();
    renderWithTheme(<CreateNotificationChannel />);

    // Select a channel type
    const channelTypeSelect = screen.getByTestId(CHANNEL_TYPE_SELECT_TESTID);
    await user.click(
      within(channelTypeSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: EMAIL_OPTION_LABEL }));

    const nameInput = screen.getByLabelText(NAME_LABEL);
    await user.type(nameInput, CHANNEL_NAME_VALUE);

    // Select a recipient from the autocomplete dropdown
    const recipientsSelect = screen.getByTestId('recipients-select');
    await user.click(
      within(recipientsSelect).getByRole('button', { name: OPEN_BUTTON_LABEL })
    );
    await user.click(screen.getByRole('option', { name: 'testuser1' }));
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    await screen.findByText('There is an error');
  });
});
