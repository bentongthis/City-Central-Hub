const HOSPITAL_URL  = 'http://localhost/smart-city-api/public/hospital_summary.php';
const SCHOOL_URL    = 'http://localhost/smart-city-api/public/school_summary.php';
const BUSINESS_URL  = 'http://localhost/smart-city-api/public/business_summary.php';
const TRANSIT_URL   = 'http://localhost/smart-city-api/public/transit_summary.php';
const CITY_LOGS_URL = 'http://localhost/smart-city-api/public/city_logs.php';

/**
 * Core fetch wrapper — NEVER throws. Always returns { data, error }.
 * Accepts an AbortSignal so callers can cancel in-flight requests on unmount.
 */
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      // Return error without throwing — keeps all code paths non-throwing
      return { data: null, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return { data: null, error: 'Invalid JSON response from server' };
    }

    return { data, error: null };
  } catch (err) {
    // Abort errors are expected on cleanup — surface a clean message
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request aborted' };
    }
    return { data: null, error: err instanceof Error ? err.message : String(err) };
  }
}

export const fetchHospitalData = (options) => safeFetch(HOSPITAL_URL, options);
export const fetchSchoolData   = (options) => safeFetch(SCHOOL_URL,   options);
export const fetchBusinessData = (options) => safeFetch(BUSINESS_URL, options);
export const fetchTransitData  = (options) => safeFetch(TRANSIT_URL,  options);
export const fetchCityLogs     = (options) => safeFetch(CITY_LOGS_URL, options);
