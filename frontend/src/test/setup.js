// Vitest setup: adds jest-dom matchers (toBeInTheDocument, etc.) and clears the
// DOM between tests.
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
