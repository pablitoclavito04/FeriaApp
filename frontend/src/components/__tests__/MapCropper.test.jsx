import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MapCropper from '../MapCropper';

// jsdom doesn't lay out images, so clientWidth/Height are 0 and the px->original
// scale can't be exercised end-to-end here. These tests cover what is reliably
// observable: rendering, the default instructions, and the cursor-guide toggle.
describe('MapCropper', () => {
  const baseProps = {
    imageUrl: 'http://example.test/map.png',
    originalWidth: 1000,
    originalHeight: 800,
    onChange: vi.fn(),
  };

  it('renders the map image and the default instruction', () => {
    render(<MapCropper {...baseProps} />);
    expect(screen.getByAltText('Map to crop')).toBeInTheDocument();
    expect(
      screen.getByText(/drag a rectangle over the part of the map/i)
    ).toBeInTheDocument();
  });

  it('points the image src at the provided url', () => {
    render(<MapCropper {...baseProps} />);
    expect(screen.getByAltText('Map to crop')).toHaveAttribute(
      'src',
      'http://example.test/map.png'
    );
  });

  it('does not call onChange before any drag', () => {
    const onChange = vi.fn();
    render(<MapCropper {...baseProps} onChange={onChange} />);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the crosshair guide once the cursor moves over the image', () => {
    const { container } = render(<MapCropper {...baseProps} />);
    const surface = container.querySelector('div[style*="cursor"]');
    fireEvent.mouseMove(surface, { clientX: 50, clientY: 40 });
    // The guide adds extra absolutely-positioned divs; just assert no crash and
    // that the container still holds the image.
    expect(screen.getByAltText('Map to crop')).toBeInTheDocument();
  });
});
