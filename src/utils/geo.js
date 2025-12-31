/**
 * Geo utilities for location-based operations
 * Point-in-polygon checking for beach boundaries
 */

/**
 * Check if a point is inside a polygon using the Ray Casting algorithm
 * @param {number} lat - Latitude of the point
 * @param {number} lng - Longitude of the point
 * @param {Array} polygon - Array of polygon vertices [{lat, lng} or [lng, lat]]
 * @returns {boolean} - True if point is inside polygon
 */
export function isPointInPolygon(lat, lng, polygon) {
  if (!polygon || !Array.isArray(polygon) || polygon.length < 3) {
    return false;
  }

  let isInside = false;
  
  // Handle both formats: [{lat, lng}] or [[lng, lat]]
  const normalizePoint = (point) => {
    if (Array.isArray(point)) {
      // Format: [lng, lat]
      return { lat: point[1], lng: point[0] };
    }
    // Format: {lat, lng}
    return point;
  };

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const pi = normalizePoint(polygon[i]);
    const pj = normalizePoint(polygon[j]);

    const xi = pi.lng;
    const yi = pi.lat;
    const xj = pj.lng;
    const yj = pj.lat;

    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    
    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}

/**
 * Find a beach whose polygon boundary contains the given point
 * @param {number} lat - Latitude of the point
 * @param {number} lng - Longitude of the point
 * @param {Array} beaches - Array of beach objects
 * @returns {Object|null} - The matching beach or null
 */
export function findBeachInPolygon(lat, lng, beaches) {
  if (!beaches || !Array.isArray(beaches)) {
    return null;
  }

  return beaches.find((beach) => {
    if (!beach.polygonBoundary) {
      return false;
    }
    return isPointInPolygon(lat, lng, beach.polygonBoundary);
  }) || null;
}

