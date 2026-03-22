import React, { useState } from "react";
import useToastStore from "../../stores/toastStore";
import Loading from "../common/Loading";
import Empty from "../common/Empty";
import Pagination from "../common/Pagination";
import CategoryModal from "../modals/CategoryModal";
import StatusChip from "../common/StatusChip";
import { Ic } from "../common/Icons";
import { useCategories } from "../../hooks/useCategories";

export default function CategoriesPage() {
  const addToast = useToastStore((state) => state.addToast);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editSlug, setEditSlug] = useState(undefined);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const {
    data: allCategories = [],
    isLoading: loading,
    refetch,
  } = useCategories();

  const displayCategories = allCategories
    .filter((cat) => {
      const searchLower = search.toLowerCase();
      const nameEn = (cat.name?.en || cat.name || "").toLowerCase();
      const nameJa = (cat.name?.ja || "").toLowerCase();
      const slug = (cat.slug || "").toLowerCase();
      return (
        nameEn.includes(searchLower) ||
        nameJa.includes(searchLower) ||
        slug.includes(searchLower)
      );
    })
    .sort((a, b) => (a.depth || 0) - (b.depth || 0));

  const handleSearch = () => {
    setPage(1);
  };

  const handleAddCategory = () => {
    setEditSlug(null);
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (slug) => {
    setEditSlug(slug);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (slug, name) => {
    if (
      !window.confirm(`Are you sure you want to delete the category "${name}"?`)
    ) {
      return;
    }

    try {
      // Import categoryService here to avoid circular imports
      const categoryService = (await import("../../services/categoryService"))
        .default;
      await categoryService.deleteCategory(slug);
      addToast("Category deleted successfully.", "success");
      refetch();
    } catch (error) {
      addToast(
        error?.response?.data?.message || "Failed to delete category.",
        "error",
      );
    }
  };

  const handleModalClose = () => {
    setCategoryModalOpen(false);
    setEditSlug(undefined);
  };

  const handleModalSaved = () => {
    setCategoryModalOpen(false);
    setEditSlug(undefined);
    refetch();
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
                placeholder="Search categories…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <button
            className="topbar-btn btn-primary"
            onClick={handleAddCategory}
          >
            <Ic.Plus /> Add Category
          </button>
        </div>

        {loading ? (
          <Loading />
        ) : displayCategories.length === 0 ? (
          <Empty icon="📁" title="No categories found" />
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Name (EN)</th>
                <th>Name (JA)</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayCategories.map((cat) => {
                const indent = (cat.depth || 0) * 20;

                return (
                  <tr key={cat.id}>
                    <td
                      style={{
                        fontWeight: 500,
                        paddingLeft: `${16 + indent}px`,
                      }}
                    >
                      {cat.emoji && (
                        <span style={{ marginRight: 6 }}>{cat.emoji}</span>
                      )}
                      {cat.name?.en || cat.name || "—"}
                    </td>
                    <td>
                      {cat.emoji && (
                        <span style={{ marginRight: 6 }}>{cat.emoji}</span>
                      )}
                      {cat.name?.ja || "—"}
                    </td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                      {cat.slug || "—"}
                    </td>
                    <td>
                      <StatusChip
                        status={cat.is_active ? "approved" : "rejected"}
                      />
                    </td>
                    <td>
                      <div className="tbl-actions">
                        <button
                          className="topbar-btn btn-outline btn-sm"
                          onClick={() => handleEditCategory(cat.slug)}
                        >
                          <Ic.Edit size={12} />
                        </button>
                        <button
                          className="topbar-btn btn-danger btn-sm"
                          onClick={() =>
                            handleDeleteCategory(
                              cat.slug,
                              cat.name?.en || cat.name,
                            )
                          }
                        >
                          <Ic.Trash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <CategoryModal
        isOpen={categoryModalOpen}
        categorySlug={editSlug}
        onClose={handleModalClose}
        onSaved={handleModalSaved}
      />
    </>
  );
}
