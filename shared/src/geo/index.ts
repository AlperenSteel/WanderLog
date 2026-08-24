const EARTH_RADIUS_M = 6_371_000;

/**
 * İki GPS noktası arasındaki mesafeyi metre cinsinden hesaplar (Haversine formülü)
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/**
 * Rota noktalarının toplam uzunluğunu hesaplar
 */
export function computeRouteDistance(points: Array<{ lat: number; lng: number }>): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng,
    );
  }
  return total;
}

/**
 * Google Encoded Polyline Algorithm — compress için
 */
export function encodePolyline(points: Array<{ lat: number; lng: number }>): string {
  let result = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const point of points) {
    const lat = Math.round(point.lat * 1e5);
    const lng = Math.round(point.lng * 1e5);
    result += encodeValue(lat - prevLat) + encodeValue(lng - prevLng);
    prevLat = lat;
    prevLng = lng;
  }
  return result;
}

function encodeValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let result = '';
  while (v >= 0x20) {
    result += String.fromCharCode(((0x20 | (v & 0x1f)) + 63));
    v >>= 5;
  }
  result += String.fromCharCode(v + 63);
  return result;
}

/**
 * Encoded polyline'ı decode eder
 */
export function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  let lat = 0;
  let lng = 0;
  let i = 0;

  while (i < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dLat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(i++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dLng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * WKT LineString formatına dönüştür (PostGIS için)
 */
export function toLineStringWKT(points: Array<{ lat: number; lng: number }>): string {
  const coords = points.map((p) => `${p.lng} ${p.lat}`).join(', ');
  return `LINESTRING(${coords})`;
}
