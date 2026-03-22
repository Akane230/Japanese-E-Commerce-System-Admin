import React from "react";
import { Ic } from "./Icons";

function getPageWindow(page, totalPages) {
  const windowSize = 7;
  const delta = Math.floor(windowSize / 2);
  const start = Math.max(
    1,
    Math.min(page - delta, totalPages - windowSize + 1),
  );
  const end = Math.min(totalPages, start + windowSize - 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function Pagination({ page, total, pageSize = 20, onPage }) {
  const validPageSize = Math.max(1, Math.floor(pageSize));
  const totalPages = Math.ceil(total / validPageSize);

  if (totalPages <= 1) return null;

  const pages = getPageWindow(page, totalPages);

  return (
    <div className="pagination">
      <button
        className="page-btn"
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
      >
        <Ic.ChevL />
      </button>

      {pages[0] > 1 && (
        <>
          <button className="page-btn" onClick={() => onPage(1)}>
            1
          </button>
          {pages[0] > 2 && <span className="page-ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`page-btn ${p === page ? "active" : ""}`}
          onClick={() => onPage(p)}
        >
          {p}
        </button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="page-ellipsis">…</span>
          )}
          <button className="page-btn" onClick={() => onPage(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      <button
        className="page-btn"
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
      >
        <Ic.ChevR />
      </button>
      <span className="page-info">{total} total</span>
    </div>
  );
}
