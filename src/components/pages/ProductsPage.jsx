import React, { useState, useEffect } from "react";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import Pagination from "../common/Pagination";
import Stars from "../common/Stars";
import ProductModal from "../modals/ProductModal";
import { Ic } from "../common/Icons";
import { fmt } from "../../utils/helpers";

import { useProducts } from "../../hooks/useProducts";
import { useDeleteProduct } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import useToastStore from "../../stores/toastStore";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editSlug, setEditSlug] = useState(undefined);

  const deleteProduct = useDeleteProduct();
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    if (deleteProduct.isSuccess) {
      addToast("Product deleted successfully", "success");
    }
  }, [deleteProduct.isSuccess, addToast]);

  const handleDelete = (slug) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(slug);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const newSearch = search.trim();
      setDebouncedSearch(newSearch);
      // Reset page when search changes
      if (newSearch !== debouncedSearch) {
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const { data: productData, isLoading: loading } = useProducts({
    search: debouncedSearch,
    page,
  });

  // Debug: log the response structure
  React.useEffect(() => {
    if (productData) {
      console.log("Products API Response:", {
        hasResults: !!productData.results,
        resultsCount: productData.results?.length || 0,
        count: productData.count,
        totalPages: productData.total_pages,
        page,
        debouncedSearch,
      });
    }
  }, [productData, page, debouncedSearch]);

  const categoriesQuery = useCategories();
  const loadingCategories = categoriesQuery.isLoading;

  const categories = React.useMemo(() => {
    const map = {};
    if (categoriesQuery.data) {
      categoriesQuery.data.forEach((cat) => {
        map[cat.id] = {
          id: cat.id,
          name: cat.name?.en || cat.name || cat.id,
          fullName: cat.name?.en || cat.name || cat.id,
        };
      });
    }
    return map;
  }, [categoriesQuery.data]);

  const products = productData?.results || productData?.products || [];
  const count = productData?.count || 0;

  const getProductThumbnail = (product) => {
    if (product.thumbnail_url) {
      return product.thumbnail_url;
    }

    if (product.media) {
      if (product.media.thumbnail_url) {
        return product.media.thumbnail_url;
      }
      if (product.media.thumbnail) {
        return `https://res.cloudinary.com/sample/image/upload/${product.media.thumbnail}`;
      }
    }

    return null;
  };

  const getCategoryNames = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return "—";

    const names = categoryIds
      .map((id) => {
        if (categories[id]) {
          const cat = categories[id];
          return typeof cat === "object" ? cat.name : cat;
        }
        return id.length > 8 ? `${id.substring(0, 8)}...` : id;
      })
      .filter((name) => name);

    if (names.length === 0) return "—";

    if (names.length === 1) return names[0];
    return `${names[0]} +${names.length - 1}`;
  };

  const getCategoryTooltip = (categoryIds) => {
    if (!categoryIds || categoryIds.length === 0) return "No categories";

    const names = categoryIds
      .map((id) => categories[id] || id)
      .filter((name) => name);

    return names.join(", ");
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="filters" style={{ flex: 1 }}>
            <div className="search-wrap">
              <Ic.Search size={14} />
              <input
                className="input input-search"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <button
            className="topbar-btn btn-primary"
            onClick={() => setEditSlug(null)}
          >
            <Ic.Plus /> Add Product
          </button>
        </div>
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <Empty icon="🛍️" title="No products found" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Thumbnail</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Categories</th>
                <th>Status</th>
                <th>Rating</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const thumbSrc = getProductThumbnail(p);

                return (
                  <tr key={p.id}>
                    <td>
                      {thumbSrc ? (
                        <img
                          src={thumbSrc}
                          alt={p.name}
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 6,
                            objectFit: "cover",
                            border: "1px solid var(--border)",
                          }}
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.target.style.display = "none";
                            e.target.parentNode.innerHTML =
                              '<div style="width:48px;height:48px;border-radius:6px;background-color:var(--bg-muted);display:flex;align-items:center;justify-content:center;font-size:20px;">🖼️</div>';
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 6,
                            backgroundColor: "var(--bg-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                          }}
                        >
                          🖼️
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                        {p.slug}
                      </div>
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                      {p.sku}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>
                        {fmt(p.pricing?.sale_price || p.pricing?.base_price)}
                      </div>
                      {p.pricing?.sale_price && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--ink-muted)",
                            textDecoration: "line-through",
                          }}
                        >
                          {fmt(p.pricing?.base_price)}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {loadingCategories ? (
                        <span style={{ color: "var(--ink-muted)" }}>
                          Loading...
                        </span>
                      ) : p.category_ids && p.category_ids.length > 0 ? (
                        <div
                          className="category-display"
                          title={getCategoryTooltip(p.category_ids)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            backgroundColor: "var(--bg-muted)",
                            padding: "4px 8px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            color: "var(--ink)",
                          }}
                        >
                          <span style={{ opacity: 0.7 }}>📁</span>
                          <span>{getCategoryNames(p.category_ids)}</span>
                          {p.category_ids.length > 1 && (
                            <span
                              style={{
                                marginLeft: "2px",
                                backgroundColor: "var(--border)",
                                borderRadius: "12px",
                                padding: "2px 6px",
                                fontSize: "10px",
                                fontWeight: 600,
                              }}
                            >
                              {p.category_ids.length}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: "var(--ink-muted)" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`chip ${p.is_active ? "chip-paid" : "chip-cancelled"}`}
                      >
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Stars
                          rating={Math.round(p.rating_summary?.average || 0)}
                        />
                        <span
                          style={{ fontSize: 12, color: "var(--ink-muted)" }}
                        >
                          ({p.rating_summary?.count || 0})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          className="topbar-btn btn-outline btn-sm btn-icon"
                          onClick={() => setEditSlug(p.slug)}
                          title="Edit"
                        >
                          <Ic.Edit />
                        </button>
                        <button
                          className="topbar-btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDelete(p.slug)}
                          title="Delete"
                        >
                          <Ic.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <Pagination
          page={page}
          total={count}
          pageSize={20}
          onPage={handlePageChange}
        />
      </div>
      {editSlug !== undefined && (
        <ProductModal
          productSlug={editSlug}
          onClose={() => setEditSlug(undefined)}
          onSaved={() => {
            setEditSlug(undefined);
          }}
        />
      )}
    </>
  );
}
