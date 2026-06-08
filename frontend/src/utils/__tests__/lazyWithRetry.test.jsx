import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import lazyWithRetry from '../lazyWithRetry';

describe('lazyWithRetry', () => {
  let reloadMock;
  let originalLocation;

  beforeEach(() => {
    window.sessionStorage.clear();
    originalLocation = window.location;
    reloadMock = vi.fn();
    // jsdom's location.reload is not writable; replace location with a stub.
    delete window.location;
    window.location = { ...originalLocation, reload: reloadMock };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('renders the component when the import succeeds', async () => {
    const Ok = lazyWithRetry(async () => ({ default: () => <div>loaded</div> }));
    render(
      <Suspense fallback={<span>loading</span>}>
        <Ok />
      </Suspense>
    );
    expect(await screen.findByText('loaded')).toBeInTheDocument();
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it('reloads the page once on a failed import (stale chunk)', async () => {
    const Failing = lazyWithRetry(async () => {
      throw new Error('Failed to fetch dynamically imported module');
    });
    render(
      <Suspense fallback={<span>loading</span>}>
        <Failing />
      </Suspense>
    );
    await waitFor(() => expect(reloadMock).toHaveBeenCalledTimes(1));
    expect(window.sessionStorage.getItem('chunk-reload-attempted')).toBe('1');
  });

  it('does not reload again if it already retried once', async () => {
    window.sessionStorage.setItem('chunk-reload-attempted', '1');
    const Failing = lazyWithRetry(async () => {
      throw new Error('still failing');
    });
    // Suppress the expected error boundary noise.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <Suspense fallback={<span>loading</span>}>
        <Failing />
      </Suspense>
    );
    // Give the rejected import a tick to settle.
    await new Promise((r) => setTimeout(r, 20));
    expect(reloadMock).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
