import { keyframes } from 'tss-react';

export const rotate360Clockwise = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

export const rotate360CounterClockwise = keyframes`
from {
  transform: rotate(0deg);
}
to {
  transform: rotate(-360deg);
}
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
  },
  to {
    opacity: 1;
  }
`;
