'use client';

import { useEffect, useState } from 'react';
import { AuditLogTable } from '@/components/AuditLogTable';
import { AuditLog, getAuditLogs } from '@/lib/api';
import { getSessionFromStorage } from '@/lib/auth';

export default function AuditPage() {
  const DEFAULT_LIMIT = 10;
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function loadLogs(nextPage = page) {
    setIsLoading(true);

    try {
      const response = await getAuditLogs(nextPage, DEFAULT_LIMIT);
      setLogs(response.data);
      setPage(response.page);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const session = getSessionFromStorage();
    if (session.role !== 'ADMIN') {
      setError('Only admins can access audit logs.');
      setIsLoading(false);
      return;
    }

    loadLogs(1);
  }, []);

  return (
    <section className="stack">
      <h1 className="page-title">Audit Log</h1>
      {error ? <p className="error">{error}</p> : null}
      {isLoading ? <p className="info">Loading audit logs...</p> : <AuditLogTable logs={logs} />}
      <div className="pagination-row">
        <span className="pagination-meta">
          Page {page} of {totalPages} • Total {total}
        </span>
        <div className="row">
          <button
            className="btn btn-soft"
            onClick={() => loadLogs(page - 1)}
            disabled={isLoading || page <= 1}
          >
            Previous
          </button>
          <button
            className="btn btn-soft"
            onClick={() => loadLogs(page + 1)}
            disabled={isLoading || page >= totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
