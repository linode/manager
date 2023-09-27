import { initializePercentageCounter } from './percentageCounter';

describe('initializePercentageCounter', () => {
  let animationFrameSpy: jest.SpyInstance<number, [FrameRequestCallback]>;
  let cancelAnimationFrameSpy: jest.SpyInstance<void, [number]>;
  let requestAnimationFrameSpy: jest.SpyInstance<
    number,
    [FrameRequestCallback]
  >;

  beforeEach(() => {
    animationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
    cancelAnimationFrameSpy = jest.spyOn(window, 'cancelAnimationFrame');
    requestAnimationFrameSpy = jest.spyOn(window, 'requestAnimationFrame');
  });

  afterEach(() => {
    animationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
  });

  it('should start and stop animation correctly', () => {
    const duration = 2000;
    const onUpdateMock = jest.fn();

    const { startAnimation, stopAnimation } = initializePercentageCounter(
      duration
    );

    // Start animation
    startAnimation(onUpdateMock);

    // Ensure requestAnimationFrame was called
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);

    // Manually trigger the animation frame callback
    const frameCallback = requestAnimationFrameSpy.mock.calls[0][0];
    frameCallback(performance.now()); // Simulate a frame update

    // Check if onUpdate was called with an updated percentage
    expect(onUpdateMock).toHaveBeenCalledWith(expect.any(Number));

    // Stop animation
    stopAnimation();

    // Ensure cancelAnimationFrame was called
    expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(1);
  });

  it('should not exceed 99% during animation', () => {
    const duration = 10000; // 10 seconds
    const onUpdateMock = jest.fn();

    const { startAnimation, stopAnimation } = initializePercentageCounter(
      duration
    );

    // Start animation
    startAnimation(onUpdateMock);

    // Manually trigger the animation frame callback for the entire duration
    const frameCallback = requestAnimationFrameSpy.mock.calls[0][0];
    for (let time = 0; time < duration; time += 1000) {
      frameCallback(performance.now() + time); // Simulate frame updates
    }

    // Ensure percentage never exceeded 99
    expect(onUpdateMock).toHaveBeenCalledTimes(10);
    onUpdateMock.mock.calls.forEach(([percentage]) => {
      expect(percentage).toBeLessThanOrEqual(99);
    });

    // Stop animation
    stopAnimation();
  });
});

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});
