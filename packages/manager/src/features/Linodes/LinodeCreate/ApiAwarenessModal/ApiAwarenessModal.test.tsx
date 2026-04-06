import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { ApiAwarenessModal } from './ApiAwarenessModal';

import type { LinodeCreateFormValues } from '../utilities';
import type { ApiAwarenessModalProps } from './ApiAwarenessModal';

const defaultProps: ApiAwarenessModalProps = {
  isOpen: false,
  onClose: vi.fn(),
  payLoad: { region: '', type: '' },
};

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
  useSearch: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
    useParams: queryMocks.useParams,
  };
});

const renderComponent = (overrideProps?: Partial<ApiAwarenessModalProps>) => {
  const props = {
    ...defaultProps,
    ...overrideProps,
  };

  return renderWithThemeAndHookFormContext<LinodeCreateFormValues>({
    component: <ApiAwarenessModal {...props} />,
  });
};

describe('ApiAwarenessModal', () => {
  beforeEach(() => {
    queryMocks.useNavigate.mockReturnValue(vi.fn());
    queryMocks.useSearch.mockReturnValue({});
    queryMocks.useParams.mockReturnValue({});
  });

  it('Should not render ApiAwarenessModal component', () => {
    renderComponent();
    expect(screen.queryByText('Create Linode')).not.toBeInTheDocument();
  });
  it('Should render ApiAwarenessModal component when enabled', () => {
    renderComponent({ isOpen: true });
    screen.getByText('Create Linode');
  });
  it('Should invoke onClose handler upon clicking close button', async () => {
    renderComponent({ isOpen: true });
    await userEvent.click(screen.getByTestId('close-button'));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });
});
