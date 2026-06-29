import { Stack } from '@linode/ui';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { FOOTER_HEIGHT } from 'src/features/Footer';

import { InputBox } from './InputBox';
import { ModelPlaygroundOptionsProvider } from './ModelPlaygroundOptionsProvider';
import { ModelPlaygroundProvider } from './ModelPlaygroundProvider';
import { ModelSelector } from './ModelSelector';
import { OptionsSidebar } from './OptionsSidebar';
import { OutputBox } from './OutputBox';

// 32px = pb of #main-content in Root.tsx, FOOTER_HEIGHT = the footer below it.
const BELOW_CONTENT_HEIGHT = 32 + FOOTER_HEIGHT;

export const ModelPlayground = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(200);

  useLayoutEffect(() => {
    const update = () => {
      if (!contentRef.current) return;
      const { top } = contentRef.current.getBoundingClientRect();
      setContentHeight(
        Math.max(
          200,
          Math.floor(window.innerHeight - top - BELOW_CONTENT_HEIGHT)
        )
      );
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener('resize', update);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <ModelPlaygroundOptionsProvider>
      <ModelPlaygroundProvider>
        <Stack gap={2}>
          <ModelSelector />
          <Stack
            direction="row"
            gap={3}
            ref={contentRef}
            sx={{ height: contentHeight, minHeight: 200 }}
          >
            <Stack sx={{ flex: 1, minWidth: 0 }}>
              <OutputBox />
              <InputBox />
            </Stack>
            <OptionsSidebar />
          </Stack>
        </Stack>
      </ModelPlaygroundProvider>
    </ModelPlaygroundOptionsProvider>
  );
};
