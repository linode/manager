import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';

import { databaseEngineFactory } from 'src/factories';
import { renderWithThemeAndFormik } from 'src/utilities/testHelpers';

import { initialValues } from '../CreateAlertDefinition';
import { EngineOption } from './EngineOption';

const engineOptions = databaseEngineFactory.buildList(2);
const handleOnSubmit = vi.fn();
describe('EngineOption component tests', () => {
  it('should render the component when resource type is dbaas', () => {
    const {
      getByLabelText,
      getByTestId,
    } = renderWithThemeAndFormik(
      <EngineOption engineOptions={engineOptions} name={'engineOption'} />,
      { initialValues, onSubmit: handleOnSubmit }
    );
    expect(getByLabelText('Engine Options')).toBeInTheDocument();
    expect(getByTestId('engine-options')).toBeInTheDocument();
  });
  it('should render the options happy path', () => {
    renderWithThemeAndFormik(
      <EngineOption engineOptions={engineOptions} name={'engineOption'} />,
      { initialValues, onSubmit: handleOnSubmit }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByRole('option', { name: 'test/1' }));
    expect(screen.getByRole('option', { name: 'test/2' }));
  });
  it('should be able to select an option', () => {
    renderWithThemeAndFormik(
      <EngineOption engineOptions={engineOptions} name={'engineOption'} />,
      { initialValues, onSubmit: handleOnSubmit }
    );
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    fireEvent.click(screen.getByRole('option', { name: 'test/1' }));
    expect(screen.getByRole('combobox')).toHaveAttribute('value', 'test/1');
  });
});
