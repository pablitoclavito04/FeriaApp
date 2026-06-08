const { remapLocation, sanitizeCrop } = require('../src/services/cropMap');

// The crop coordinate math is the delicate part (Leaflet CRS.Simple has a
// flipped vertical axis), so it is unit-tested in isolation here.

describe('cropMap.sanitizeCrop', () => {
  it('clamps a rectangle to the image bounds', () => {
    const crop = sanitizeCrop({ x: -10, y: 5, width: 2000, height: 50 }, 1000, 800);
    expect(crop).toEqual({ x: 0, y: 5, width: 1000, height: 50 });
  });

  it('returns null for a zero-area rectangle', () => {
    expect(sanitizeCrop({ x: 10, y: 10, width: 0, height: 100 }, 1000, 800)).toBeNull();
  });

  it('returns null when fully outside the image', () => {
    expect(sanitizeCrop({ x: 2000, y: 2000, width: 100, height: 100 }, 1000, 800)).toBeNull();
  });

  it('rounds fractional coordinates (origin and far edge rounded independently)', () => {
    // x = round(10.4) = 10; right = round(10.4 + 100.5) = round(110.9) = 111;
    // width = 111 - 10 = 101. y = round(20.6) = 21; bottom = round(71.1) = 71;
    // height = 71 - 21 = 50.
    const crop = sanitizeCrop({ x: 10.4, y: 20.6, width: 100.5, height: 50.5 }, 1000, 800);
    expect(crop).toEqual({ x: 10, y: 21, width: 101, height: 50 });
  });
});

describe('cropMap.remapLocation', () => {
  // Original image: 1000 wide x 800 tall. A caseta at pixel (200, 300) from the
  // top-left has stored location { x: 800 - 300, y: 200 } = { x: 500, y: 200 }.
  const originalHeight = 800;
  const stored = { x: 500, y: 200 };

  it('keeps a caseta inside the crop and re-expresses it against the new origin', () => {
    // Crop rectangle [100, 100, 400, 400] in top-left pixels.
    const crop = { x: 100, y: 100, width: 400, height: 400 };
    // pixel (200,300) -> new pixel (100,200) -> location { x: 400-200, y: 100 }
    expect(remapLocation(stored, originalHeight, crop)).toEqual({ x: 200, y: 100 });
  });

  it('drops a caseta whose center is left of the crop', () => {
    const crop = { x: 300, y: 100, width: 400, height: 400 }; // pixelX 200 < cropX 300
    expect(remapLocation(stored, originalHeight, crop)).toBeNull();
  });

  it('drops a caseta whose center is above the crop', () => {
    const crop = { x: 100, y: 400, width: 400, height: 300 }; // pixelY 300 < cropY 400
    expect(remapLocation(stored, originalHeight, crop)).toBeNull();
  });

  it('drops a caseta below the crop', () => {
    const crop = { x: 100, y: 100, width: 400, height: 150 }; // pixelY 300 > cropY+H 250
    expect(remapLocation(stored, originalHeight, crop)).toBeNull();
  });

  it('a full-image crop leaves the location unchanged', () => {
    const crop = { x: 0, y: 0, width: 1000, height: 800 };
    expect(remapLocation(stored, originalHeight, crop)).toEqual(stored);
  });
});
