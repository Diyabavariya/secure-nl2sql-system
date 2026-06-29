import { useState, useCallback } from 'react';
import { submitQuery } from '../api/queryApi';
import { useAuth } from '../context/AuthContext';

function parseSecurityStatus(response) {
  if (!response) {
    return { intentPassed: null, sqlPassed: null, rbacPassed: null, overallStatus: 'idle' };
  }

  if (!response.error) {
    return { intentPassed: true, sqlPassed: true, rbacPassed: true, overallStatus: 'success' };
  }

  const err = response.error.toLowerCase();

  if (err.includes('dangerous intent'))      return { intentPassed: false, sqlPassed: null,  rbacPassed: null,  overallStatus: 'blocked_intent' };
  if (err.includes('sql validation failed')) return { intentPassed: true,  sqlPassed: false, rbacPassed: null,  overallStatus: 'blocked_sql' };
  if (err.includes('access denied'))         return { intentPassed: true,  sqlPassed: true,  rbacPassed: false, overallStatus: 'denied_rbac' };

  return { intentPassed: true, sqlPassed: true, rbacPassed: true, overallStatus: 'db_error' };
}

export function useQueryShield() {
  // ROOT CAUSE FIX: Read the authenticated user's role from AuthContext.
  // The backend's QueryResponse model does not include 'role' (by design —
  // roles belong in the JWT, not in query responses). We inject it here on
  // the frontend so every history entry carries the correct role label.
  const { role } = useAuth();

  const [loading,        setLoading]        = useState(false);
  const [result,         setResult]         = useState(null);
  const [history,        setHistory]        = useState([]);
  const [securityStatus, setSecurityStatus] = useState({
    intentPassed: null, sqlPassed: null, rbacPassed: null, overallStatus: 'idle',
  });
  const [networkError,   setNetworkError]   = useState(null);

  const submitQuestion = useCallback(async (question) => {
    if (!question.trim()) return;

    setLoading(true);
    setNetworkError(null);
    setResult(null);

    try {
      const data = await submitQuery(question);
      setResult(data);
      setSecurityStatus(parseSecurityStatus(data));

      // Inject the current user's role (from JWT/AuthContext) into the history
      // entry. Previously, 'role' was missing from the response object, causing
      // QueryHistory to display "Unknown Role" for every entry.
      setHistory((prev) => [
        { ...data, role, timestamp: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Network error — is the backend running?';
      setNetworkError(errorMessage);
      setSecurityStatus({ intentPassed: null, sqlPassed: null, rbacPassed: null, overallStatus: 'network_error' });
    } finally {
      setLoading(false);
    }
  // Include 'role' in the dependency array so the latest role is always captured.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const clearResult = useCallback(() => {
    setResult(null);
    setNetworkError(null);
    setSecurityStatus({ intentPassed: null, sqlPassed: null, rbacPassed: null, overallStatus: 'idle' });
  }, []);

  return { loading, result, history, securityStatus, networkError, submitQuestion, clearResult };
}
