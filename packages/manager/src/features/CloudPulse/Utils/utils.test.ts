import { describe, expect, it } from 'vitest';

import {
  INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  INTERFACE_IDS_ERROR_MESSAGE,
  INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE,
  INTERFACE_IDS_LIMIT_ERROR_MESSAGE,
  PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE,
  PORTS_ERROR_MESSAGE,
  PORTS_LEADING_COMMA_ERROR_MESSAGE,
  PORTS_LEADING_ZERO_ERROR_MESSAGE,
  PORTS_LIMIT_ERROR_MESSAGE,
  PORTS_RANGE_ERROR_MESSAGE,
} from './constants';
import {
  arePortsValid,
  areValidInterfaceIds,
  handleKeyDown,
  handlePaste,
  isValidPort,
} from './utils';

type MockClipboardData = Pick<DataTransfer, 'getData'>;
type MockClipboardEvent = {
  clipboardData: MockClipboardData;
  preventDefault: () => void;
};

type MockKeyboardEvent = Partial<React.KeyboardEvent<HTMLInputElement>> & {
  key: string;
  preventDefault: () => void;
  target: HTMLInputElement;
};

describe('isValidPort', () => {
  it('should return valid for empty string and valid ports', () => {
    expect(isValidPort('')).toBe(undefined);
    expect(isValidPort('1')).toBe(undefined);
    expect(isValidPort('80')).toBe(undefined);
    expect(isValidPort('65535')).toBe(undefined);
  });

  it('should return invalid for ports outside range 1-65535', () => {
    expect(isValidPort('0')).toBe(PORTS_RANGE_ERROR_MESSAGE);
    expect(isValidPort('01')).toBe(PORTS_LEADING_ZERO_ERROR_MESSAGE);
    expect(isValidPort('99999')).toBe(PORTS_RANGE_ERROR_MESSAGE);
  });
});

describe('arePortsValid', () => {
  it('should return valid for valid port combinations', () => {
    expect(arePortsValid('')).toBe(undefined);
    expect(arePortsValid('80')).toBe(undefined);
    expect(arePortsValid('80,443,8080')).toBe(undefined);
    expect(arePortsValid('1,65535')).toBe(undefined);
  });

  it('should return invalid for consecutive commas', () => {
    const result = arePortsValid('80,,443');
    expect(result).toBe(PORTS_CONSECUTIVE_COMMAS_ERROR_MESSAGE);
  });

  it('should return invalid for ports starting with comma', () => {
    expect(arePortsValid(',80')).toBe(PORTS_LEADING_COMMA_ERROR_MESSAGE);
  });

  it('should return invalid for input value other than numbers and commas', () => {
    expect(arePortsValid('abc')).toBe(PORTS_ERROR_MESSAGE);
  });

  it('should return invalid for more than 15 ports', () => {
    const ports = Array.from({ length: 16 }, (_, i) => i + 1).join(',');
    const result = arePortsValid(ports);
    expect(result).toBe(PORTS_LIMIT_ERROR_MESSAGE);
  });
});

describe('areValidInterfaceIds', () => {
  it('should return valid for valid interface id combinations', () => {
    expect(areValidInterfaceIds('')).toBe(undefined);
    expect(areValidInterfaceIds('1')).toBe(undefined);
    expect(areValidInterfaceIds('1,2,3')).toBe(undefined);
  });

  it('should return invalid for consecutive commas', () => {
    const result = areValidInterfaceIds('1,,2');
    expect(result).toBe(INTERFACE_IDS_CONSECUTIVE_COMMAS_ERROR_MESSAGE);
  });

  it('should return invalid for interface ids starting with comma', () => {
    expect(areValidInterfaceIds(',1')).toBe(
      INTERFACE_IDS_LEADING_COMMA_ERROR_MESSAGE
    );
  });

  it('should return invalid for input value other than numbers and commas', () => {
    expect(areValidInterfaceIds('abc')).toBe(INTERFACE_IDS_ERROR_MESSAGE);
  });

  it('should return invalid for more than 15 interface ids', () => {
    const interfaceIds = Array.from({ length: 16 }, (_, i) => i + 1).join(',');
    const result = areValidInterfaceIds(interfaceIds);
    expect(result).toBe(INTERFACE_IDS_LIMIT_ERROR_MESSAGE);
  });
});

describe('handlers', () => {
  const mockSetErrorText = vi.fn();
  const mockPreventDefault = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handleKeyDown should handle both valid and invalid key events', () => {
    const createMockEvent = (key: string): MockKeyboardEvent => ({
      key,
      preventDefault: mockPreventDefault,
      target: { selectionStart: 0 } as HTMLInputElement,
    });

    const invalidEvent = createMockEvent('a');
    handleKeyDown(
      '',
      mockSetErrorText
    )(invalidEvent as React.KeyboardEvent<HTMLInputElement>);
    expect(mockSetErrorText).toHaveBeenCalledWith(PORTS_ERROR_MESSAGE);
    expect(mockPreventDefault).toHaveBeenCalled();
    vi.clearAllMocks();

    const validEvent = createMockEvent('1');
    handleKeyDown(
      '',
      mockSetErrorText
    )(validEvent as React.KeyboardEvent<HTMLInputElement>);
    expect(mockSetErrorText).toHaveBeenCalledWith(undefined);
    expect(mockPreventDefault).not.toHaveBeenCalled();
  });

  it('handlePaste should handle both valid and invalid paste events', () => {
    const createMockEvent = (data: string): MockClipboardEvent => ({
      clipboardData: {
        getData: () => data,
      },
      preventDefault: mockPreventDefault,
    });

    const validEvent = createMockEvent('80,443');
    handlePaste(
      '',
      mockSetErrorText
    )(validEvent as React.ClipboardEvent<HTMLInputElement>);
    expect(mockSetErrorText).toHaveBeenCalledWith(undefined);
    expect(mockPreventDefault).not.toHaveBeenCalled();
    vi.clearAllMocks();

    const invalidEvent = createMockEvent('abc');
    handlePaste(
      '',
      mockSetErrorText
    )(invalidEvent as React.ClipboardEvent<HTMLInputElement>);
    expect(mockSetErrorText).toHaveBeenCalledWith(PORTS_ERROR_MESSAGE);
    expect(mockPreventDefault).toHaveBeenCalled();
  });
});
