import { useState, useCallback } from 'react';
import { submitQuery } from '../api/queryApi';

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
      setHistory((prev) => [{ ...data, timestamp: new Date().toISOString() }, ...prev.slice(0, 49)]);
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Network error — is the backend running?';
      setNetworkError(errorMessage);
      setSecurityStatus({ intentPassed: null, sqlPassed: null, rbacPassed: null, overallStatus: 'network_error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setNetworkError(null);
    setSecurityStatus({ intentPassed: null, sqlPassed: null, rbacPassed: null, overallStatus: 'idle' });
  }, []);

  return { loading, result, history, securityStatus, networkError, submitQuestion, clearResult };
}

