import { ChevronLeft, ChevronRight } from '@akamai/cds-icons/react';
import React, { useLayoutEffect, useRef, useState } from 'react';

import { FOOTER_HEIGHT } from 'src/features/Footer';

import { Stack } from '../components';
import { InputBox } from './InputBox';
import { ModelPlaygroundOptionsProvider } from './ModelPlaygroundOptionsProvider';
import { ModelPlaygroundProvider } from './ModelPlaygroundProvider';
import { ModelSelector } from './ModelSelector';
import { OptionsSidebar } from './OptionsSidebar';
import toggleStyles from './OptionsSidebarToggle.module.css';
import { OutputBox } from './OutputBox';

// 32px = pb of #main-content in Root.tsx, FOOTER_HEIGHT = the footer below it.
const BELOW_CONTENT_HEIGHT = 32 + FOOTER_HEIGHT;

export const ModelPlayground = () => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState<number>(200);
  const [isOptionsSidebarOpen, setIsOptionsSidebarOpen] = useState(true);

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
        <Stack spacing="16px">
          <ModelSelector />
          <Stack
            direction="row"
            height={contentHeight}
            ref={contentRef}
            style={{ minHeight: 200, position: 'relative' }}
          >
            <Stack style={{ flex: 1, minWidth: 0 }}>
              <OutputBox />
              <InputBox />
            </Stack>
            <div
              style={{
                flex: `0 0 ${isOptionsSidebarOpen ? 300 : 20}px`,
                height: '100%',
                marginLeft: isOptionsSidebarOpen ? 24 : 0,
                minWidth: 0,
                position: 'relative',
                transition: 'flex-basis 250ms ease, margin-left 250ms ease',
              }}
            >
              <button
                aria-label={
                  isOptionsSidebarOpen ? 'Hide options' : 'Show options'
                }
                className={toggleStyles.toggle}
                onClick={() => setIsOptionsSidebarOpen((isOpen) => !isOpen)}
                style={{
                  left: isOptionsSidebarOpen ? -22 : 2,
                  position: 'absolute',
                  top: 0,
                  zIndex: 1,
                }}
                type="button"
              >
                {isOptionsSidebarOpen ? (
                  <ChevronRight aria-hidden="true" height={24} width={24} />
                ) : (
                  <ChevronLeft aria-hidden="true" height={24} width={24} />
                )}
              </button>
              <div
                aria-hidden={!isOptionsSidebarOpen}
                inert={!isOptionsSidebarOpen}
                style={{
                  height: '100%',
                  overflow: 'hidden',
                  pointerEvents: isOptionsSidebarOpen ? 'auto' : 'none',
                  width: '100%',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    left: isOptionsSidebarOpen ? 0 : 300,
                    position: 'relative',
                    transition: 'left 250ms ease',
                    width: 300,
                  }}
                >
                  <OptionsSidebar />
                </div>
              </div>
            </div>
          </Stack>
        </Stack>
      </ModelPlaygroundProvider>
    </ModelPlaygroundOptionsProvider>
  );
};
