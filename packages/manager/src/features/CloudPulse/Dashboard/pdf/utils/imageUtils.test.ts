import { svgToDataURL } from './imageUtils'; // Adjust path as needed

describe('svgToDataURL', () => {
  const mockUrl = 'data:image/jpeg;base64,mockeddata';
  beforeAll(() => {
    // 1. Define the missing global constructor so TypeScript recognizes the type natively
    Object.defineProperty(globalThis, 'CanvasRenderingContext2D', {
      value: class {
        fillStyle: string = '';
        clearRect(): void {}
        drawImage(): void {}
        fillRect(): void {}
        scale(): void {}
      },
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // 2. Intercept getContext to return an instance of our class (No type-casting needed!)
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
      (contextId) => {
        if (contextId === '2d') {
          return new CanvasRenderingContext2D();
        }
        return null;
      }
    );

    // 3. Spy on toDataURL to return a mock string
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(mockUrl);

    // 4. Stub Image to prevent the test from hanging indefinitely
    vi.stubGlobal(
      'Image',
      class {
        height = 100;
        width = 100;
        set src(_value: string) {
          setTimeout(() => this.onload(), 0);
        }
        onerror: (err: unknown) => void = () => {};

        onload: () => void = () => {};
      }
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should convert a real SVGElement natively', async () => {
    const realSvgElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'svg'
    );
    realSvgElement.setAttribute('width', '100');
    realSvgElement.setAttribute('height', '100');
    realSvgElement.innerHTML = '<circle cx="50" cy="50" r="40" fill="red" />';

    const result = await svgToDataURL(realSvgElement);

    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      'image/jpeg',
      0.92
    ); // Ensure exact parameters are passed to toDataURL

    expect(result.dataUrl).toBe(mockUrl);
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  it('should convert a real local/inline data URL path string', async () => {
    const inlineSvgUrl =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg>';

    const result = await svgToDataURL(inlineSvgUrl);

    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith(
      'image/jpeg',
      0.92
    ); // Ensure exact parameters are passed to toDataURL

    expect(result.dataUrl).toBe(mockUrl);
  });

  it('should reject the promise if the image fails to load', async () => {
    vi.stubGlobal(
      'Image',
      class {
        set src(_value: string) {
          setTimeout(
            () => this.onerror(new Error('Mocked image load error')),
            0
          );
        }
        onerror: (err: unknown) => void = () => {};

        onload: () => void = () => {};
      }
    );

    await expect(svgToDataURL('http://example.com/broken.svg')).rejects.toThrow(
      'Mocked image load error'
    );
  });

  it('should reject if canvas context is unavailable', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    await expect(svgToDataURL('http://example.com/icon.svg')).rejects.toThrow(
      'Could not get canvas context'
    );
  });
});
