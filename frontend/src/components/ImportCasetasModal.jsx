import { useState, useRef } from 'react';
import casetaService from '../services/casetaService';
import useToast from '../context/useToast';
import MapReview from './MapReview';

// Published map size casetas were originally calibrated against. Used only to
// warn when an uploaded map has different dimensions (positions may not align
// with previously saved casetas on the same fair).
const PUBLISHED_MAP = { width: 1514, height: 1052 };

// Upload a fair map, run AI detection, review the detected casetas, and save
// the selected ones to a fair. Steps: upload -> detecting -> review.
const ImportCasetasModal = ({ fairs, onClose, onImported }) => {
  const { showToast } = useToast();
  const [step, setStep] = useState('upload');
  const [imageFile, setImageFile] = useState(null);
  const [fairId, setFairId] = useState('');
  const [detection, setDetection] = useState(null); // { mapUrl, bounds, imageSize, expectedCount }
  const [rows, setRows] = useState([]); // [{ id, number, confidence, location, review }]
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [existingCount, setExistingCount] = useState(0); // casetas already in the target fair
  const nextId = useRef(0); // monotonic id source for manually added casetas

  const handleDetect = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      showToast('Please choose a map image', 'error');
      return;
    }
    setStep('detecting');
    try {
      // How many casetas the target fair already has, so we can warn before a
      // re-import overwrites the fair's map / leaves stale positions. Only
      // meaningful for an explicitly chosen fair (a fair-less "Active fair"
      // count would mix every fair together), so skip it otherwise.
      if (fairId) {
        try {
          const existing = await casetaService.getCasetas({ fair: fairId, limit: 1 });
          setExistingCount(existing.total ?? 0);
        } catch {
          setExistingCount(0); // count is advisory; never block detection on it
        }
      } else {
        setExistingCount(0);
      }

      const formData = new FormData();
      formData.append('image', imageFile);
      const data = await casetaService.detectFromMap(formData);

      const detected = data.casetas.map((c, i) => ({ ...c, id: i }));
      nextId.current = detected.length;
      // Pre-select confident, non-review casetas with a number.
      const preselected = new Set(
        detected.filter((c) => c.number != null && !c.review).map((c) => c.id)
      );
      setDetection(data);
      setRows(detected);
      setSelectedIds(preselected);
      setStep('review');
    } catch (err) {
      const code = err.response?.data?.code;
      const messages = {
        AI_NO_KEY: 'AI detection is not configured on the server (missing API key)',
        AI_TIMEOUT: 'AI detection timed out, please try again',
        AI_FAILED: 'AI detection failed, please try again',
      };
      showToast(messages[code] || 'Detection failed', 'error');
      setStep('upload');
    }
  };

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateNumber = (id, value) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, number: value === '' ? null : Number(value) } : r))
    );
  };

  const updateName = (id, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, name: value } : r)));
  };

  // Drag a marker to its exact position on the map.
  const moveCaseta = (id, latlng) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, location: { x: latlng.lat, y: latlng.lng } } : r))
    );
  };

  // Click an empty spot on the map to add a caseta there (number filled in later).
  const addCaseta = (latlng) => {
    const id = nextId.current;
    nextId.current += 1;
    const caseta = {
      id,
      number: null,
      confidence: 1,
      location: { x: latlng.lat, y: latlng.lng },
      review: true,
    };
    setRows((prev) => [...prev, caseta]);
    setSelectedIds((prev) => new Set(prev).add(id));
  };

  // Remove a caseta (false positive) from the import.
  const removeCaseta = (id) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSave = async () => {
    const selected = rows.filter((r) => selectedIds.has(r.id));
    if (selected.length === 0) {
      showToast('Select at least one caseta to import', 'error');
      return;
    }
    if (selected.some((r) => r.number == null)) {
      showToast('Every selected caseta needs a number', 'error');
      return;
    }
    const numbers = selected.map((r) => r.number);
    const dupes = numbers.filter((n, i) => numbers.indexOf(n) !== i);
    if (dupes.length > 0) {
      showToast(`Duplicate numbers selected: ${[...new Set(dupes)].join(', ')}`, 'error');
      return;
    }

    setSaving(true);
    try {
      const result = await casetaService.bulkCreateCasetas({
        fair: fairId || undefined,
        mapImage: detection.mapUrl,
        mapBounds: detection.imageSize,
        casetas: selected.map((r) => ({
          number: r.number,
          location: r.location,
          ...(r.name && r.name.trim() ? { name: r.name.trim() } : {}),
        })),
      });
      showToast(`Imported ${result.created + result.updated} casetas`, 'success');
      onImported();
    } catch (err) {
      const msg = err.response?.data?.error || 'Error importing casetas';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const dimensionMismatch =
    detection &&
    (detection.imageSize.width !== PUBLISHED_MAP.width ||
      detection.imageSize.height !== PUBLISHED_MAP.height);
  const reviewCount = rows.filter((r) => r.review).length;

  // Show the review list sorted by caseta number (nulls last) for easy scanning.
  const sortedRows = [...rows].sort((a, b) => {
    if (a.number == null) return 1;
    if (b.number == null) return -1;
    return a.number - b.number;
  });

  // Don't let an outside click discard work in progress: while detecting (a
  // multi-minute operation) or reviewing results, only the X / Cancel buttons
  // close the modal. Clicking the backdrop only closes on the upload step.
  const handleOverlayClick = () => {
    if (step === 'upload') onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-casetas-title"
        style={{
          maxWidth: step === 'review' ? '860px' : '440px',
          width: step === 'review' ? '92%' : '90%',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="import-casetas-title">Import casetas from map</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {step === 'upload' && (
          <form onSubmit={handleDetect}>
            <div className="form-group">
              <label>Fair</label>
              <select value={fairId} onChange={(e) => setFairId(e.target.value)}>
                <option value="">Active fair</option>
                {fairs.map((f) => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Map image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0] || null)}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="modal-btn-confirm">Detect</button>
              <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}

        {step === 'detecting' && (
          <p className="modal-body">Running AI vision detection, this can take a minute…</p>
        )}

        {step === 'review' && detection && (
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
            <div style={{ overflowY: 'auto', minHeight: 0, flex: 1 }}>
            {existingCount > 0 && (
              <p className="error">
                This fair already has {existingCount} caseta{existingCount === 1 ? '' : 's'}.
                Importing updates casetas with a matching number and adds new ones; casetas you
                don't re-detect are kept with their old positions, and the fair's map is replaced
                by this one. To set up a different fair instead, cancel and pick (or create) that
                fair first.
              </p>
            )}
            {dimensionMismatch && (
              <p className="error">
                This map ({detection.imageSize.width}×{detection.imageSize.height}) differs from the
                published map size. Saved positions may not align with existing casetas.
              </p>
            )}
            <p className="modal-body" style={{ textAlign: 'left', marginBottom: '0.25rem' }}>
              Detected {rows.length}. To review: {reviewCount}. Selected: {selectedIds.size}.
            </p>
            <p className="modal-body" style={{ textAlign: 'left', marginBottom: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Drag a marker to fix its position. Click an empty spot to add a caseta. Use the trash icon to remove one.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flex: '1 1 58%' }}>
                <MapReview
                  mapUrl={detection.mapUrl}
                  bounds={detection.bounds}
                  casetas={rows}
                  selectedIds={selectedIds}
                  onToggle={toggle}
                  onMove={moveCaseta}
                  onAdd={addCaseta}
                  height="420px"
                />
              </div>
              <div style={{ flex: '1 1 42%', maxHeight: '460px', overflowY: 'auto' }}>
                <table className="data-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '28px', padding: '0.4rem 0.2rem' }}></th>
                      <th style={{ width: '54px', padding: '0.4rem 0.2rem' }}>#</th>
                      <th style={{ padding: '0.4rem 0.2rem' }}>Name</th>
                      <th style={{ width: '44px', padding: '0.4rem 0.2rem' }}>Conf.</th>
                      <th style={{ width: '40px', padding: '0.4rem 0.2rem' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRows.map((r) => (
                      <tr key={r.id} style={r.review ? { background: 'rgba(239,68,68,0.06)' } : undefined}>
                        <td style={{ padding: '0.3rem 0.2rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(r.id)}
                            onChange={() => toggle(r.id)}
                          />
                        </td>
                        <td style={{ padding: '0.3rem 0.2rem' }}>
                          <input
                            type="number"
                            value={r.number ?? ''}
                            onChange={(e) => updateNumber(r.id, e.target.value)}
                            className={r.review ? 'input-error' : ''}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td style={{ padding: '0.3rem 0.2rem' }}>
                          <input
                            type="text"
                            value={r.name ?? ''}
                            placeholder={r.number != null ? `Caseta ${r.number}` : ''}
                            onChange={(e) => updateName(r.id, e.target.value)}
                            style={{ width: '100%', boxSizing: 'border-box' }}
                          />
                        </td>
                        <td style={{ padding: '0.3rem 0.2rem', textAlign: 'center' }}>{r.confidence}</td>
                        <td style={{ padding: '0.3rem 0.2rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeCaseta(r.id)}
                            title="Remove this caseta"
                            aria-label="Remove this caseta"
                            style={{
                              padding: '0.25rem',
                              lineHeight: 0,
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            </div>
            <div className="modal-actions" style={{ marginTop: '1rem', flexShrink: 0 }}>
              <button className="modal-btn-confirm" onClick={handleSave} disabled={saving}>
                {saving ? 'Importing…' : `Import ${selectedIds.size} casetas`}
              </button>
              <button className="modal-btn-cancel" onClick={onClose} disabled={saving}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportCasetasModal;
