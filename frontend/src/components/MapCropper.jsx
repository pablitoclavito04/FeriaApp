import { useRef, useState, useEffect } from 'react';

// Draw a crop rectangle over the uploaded map. The admin drags to select the
// region that will be published on the public site (e.g. the map area without
// the side legend). Reports the rectangle in ORIGINAL image pixels via onChange.
//
// The image is shown scaled to fit the modal; we track the displayed size and
// convert the on-screen rectangle back to original-pixel coordinates so the
// backend can crop the full-resolution file. The admin always draws the
// rectangle themselves (no pre-selection).
const MapCropper = ({ imageUrl, originalWidth, originalHeight, onChange }) => {
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [drag, setDrag] = useState(null); // live drag rect in display px
  const [rect, setRect] = useState(null); // committed rect in display px
  const [hover, setHover] = useState(null); // cursor position for the crosshair guide

  const scale = displaySize.width > 0 ? originalWidth / displaySize.width : 1;

  const measure = () => {
    if (imgRef.current && imgRef.current.clientWidth > 0) {
      setDisplaySize({
        width: imgRef.current.clientWidth,
        height: imgRef.current.clientHeight,
      });
    }
  };

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const emitChange = (r) => {
    if (!r || r.w < 6 || r.h < 6) {
      onChange(null);
      return;
    }
    onChange({
      x: Math.round(r.x * scale),
      y: Math.round(r.y * scale),
      width: Math.round(r.w * scale),
      height: Math.round(r.h * scale),
    });
  };

  const pointFromEvent = (e) => {
    const bounds = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(displaySize.width, e.clientX - bounds.left)),
      y: Math.max(0, Math.min(displaySize.height, e.clientY - bounds.top)),
    };
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    const p = pointFromEvent(e);
    setDrag({ startX: p.x, startY: p.y, x: p.x, y: p.y, w: 0, h: 0 });
    setRect(null);
  };

  const onMouseMove = (e) => {
    const p = pointFromEvent(e);
    setHover(p);
    if (!drag) return;
    setDrag({
      ...drag,
      x: Math.min(drag.startX, p.x),
      y: Math.min(drag.startY, p.y),
      w: Math.abs(p.x - drag.startX),
      h: Math.abs(p.y - drag.startY),
    });
  };

  const onMouseUp = () => {
    if (drag) {
      const r = { x: drag.x, y: drag.y, w: drag.w, h: drag.h };
      setRect(r);
      setDrag(null);
      emitChange(r);
    }
  };

  const onMouseLeave = () => {
    setHover(null);
    onMouseUp();
  };

  const clear = () => {
    setRect(null);
    setDrag(null);
    onChange(null);
  };

  const shown = drag || rect;
  // Live dimensions in original pixels, for the feedback line.
  const shownOriginal = shown
    ? { w: Math.round(shown.w * scale), h: Math.round(shown.h * scale) }
    : null;

  // Small drag handles at the four corners of the committed rectangle.
  const handle = (left, top) => (
    <div
      style={{
        position: 'absolute',
        left: left - 5,
        top: top - 5,
        width: 10,
        height: 10,
        background: '#fff',
        border: '2px solid #2563eb',
        borderRadius: '2px',
        pointerEvents: 'none',
      }}
    />
  );

  return (
    <div
      style={{
        background: 'var(--bg-secondary, #f3f4f6)',
        border: '1px solid var(--border, #e5e7eb)',
        borderRadius: '10px',
        padding: '1rem',
        textAlign: 'center',
      }}
    >
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          display: 'inline-block',
          cursor: hover ? 'none' : 'crosshair',
          userSelect: 'none',
          maxWidth: '100%',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          borderRadius: '6px',
          overflow: 'hidden',
          background: '#fff',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <img
          ref={imgRef}
          src={imageUrl}
          alt="Map to crop"
          onLoad={measure}
          style={{ display: 'block', maxWidth: '100%', maxHeight: '440px', pointerEvents: 'none' }}
          draggable={false}
        />

        {/* High-contrast crosshair guide that follows the cursor, visible over
            both the bright map and the dimmed overlay. */}
        {hover && (
          <>
            <div style={{ position: 'absolute', left: hover.x, top: 0, width: 0, height: '100%', borderLeft: '1px dashed rgba(37,99,235,0.9)', boxShadow: '0 0 0 1px rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: hover.y, left: 0, height: 0, width: '100%', borderTop: '1px dashed rgba(37,99,235,0.9)', boxShadow: '0 0 0 1px rgba(255,255,255,0.7)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: hover.x - 4, top: hover.y - 4, width: 8, height: 8, borderRadius: '50%', background: '#2563eb', border: '1.5px solid #fff', pointerEvents: 'none' }} />
          </>
        )}
        {shown && shown.w > 0 && shown.h > 0 && (
          <>
            {/* Dimmed overlay everywhere except the selection. */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(15,23,42,0.5)',
                clipPath: `polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${shown.x}px ${shown.y}px, ${shown.x}px ${shown.y + shown.h}px, ${shown.x + shown.w}px ${shown.y + shown.h}px, ${shown.x + shown.w}px ${shown.y}px, ${shown.x}px ${shown.y}px)`,
                pointerEvents: 'none',
              }}
            />
            {/* Selection border. */}
            <div
              style={{
                position: 'absolute',
                left: shown.x,
                top: shown.y,
                width: shown.w,
                height: shown.h,
                border: '2px solid #2563eb',
                boxShadow: '0 0 0 1px rgba(255,255,255,0.6)',
                pointerEvents: 'none',
              }}
            />
            {/* Corner handles (committed rectangle only). */}
            {!drag && (
              <>
                {handle(shown.x, shown.y)}
                {handle(shown.x + shown.w, shown.y)}
                {handle(shown.x, shown.y + shown.h)}
                {handle(shown.x + shown.w, shown.y + shown.h)}
              </>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        {shownOriginal ? (
          <span>
            Selected region: <strong>{shownOriginal.w} × {shownOriginal.h}px</strong>. Drag again to redo.{' '}
            <button
              type="button"
              onClick={clear}
              style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
            >
              Use full map
            </button>
          </span>
        ) : (
          <span>Drag a rectangle over the part of the map you want to publish (the legend can be left out).</span>
        )}
      </div>
    </div>
  );
};

export default MapCropper;
