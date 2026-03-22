import React, { useState, useEffect } from "react";
import useToastStore from "../../stores/toastStore";
import Spinner from "../common/Spinner";
import categoryService from "../../services/categoryService";
import { useCategories } from "../../hooks/useCategories";
import { Ic } from "../common/Icons";

export default function CategoryModal({
  isOpen,
  categorySlug,
  onClose,
  onSaved,
}) {
  const addToast = useToastStore((state) => state.addToast);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categoryData, setCategoryData] = useState(null);

  const { data: allCategories = [] } = useCategories();

  const isNew = !categorySlug;

  const [form, setForm] = useState({
    name_en: "",
    name_ja: "",
    slug: "",
    emoji: "",
    description_en: "",
    description_ja: "",
    parent_id: "",
    is_active: true,
    image_url: "",
  });

  const [errors, setErrors] = useState({});

  // Fetch category data when editing
  useEffect(() => {
    if (!isNew && categorySlug) {
      setLoading(true);
      categoryService
        .getCategory(categorySlug)
        .then((response) => {
          const data = response.data || response;
          setCategoryData(data);
          setForm({
            name_en: data.name?.en || "",
            name_ja: data.name?.ja || "",
            slug: data.slug || "",
            emoji: data.emoji || "",
            description_en: data.description?.en || "",
            description_ja: data.description?.ja || "",
            parent_id: data.parent_id || "",
            is_active: data.is_active !== undefined ? data.is_active : true,
            image_url: data.image_url || "",
          });
          setErrors({});
        })
        .catch((error) => {
          addToast(
            error?.response?.data?.message || "Failed to load category.",
            "error",
          );
          onClose();
        })
        .finally(() => setLoading(false));
    }
  }, [isNew, categorySlug, onClose, addToast]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name_en?.trim()) {
      newErrors.name_en = "English name is required";
    }
    if (!form.name_ja?.trim()) {
      newErrors.name_ja = "Japanese name is required";
    }
    if (!form.slug?.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(form.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        name: {
          en: form.name_en,
          ja: form.name_ja,
        },
        slug: form.slug,
        emoji: form.emoji || null,
        description: {
          en: form.description_en || "",
          ja: form.description_ja || "",
        },
        parent_id: form.parent_id || null,
        is_active: form.is_active,
        image_url: form.image_url || null,
      };

      if (isNew) {
        await categoryService.createCategory(payload);
        addToast("Category created successfully.", "success");
      } else {
        await categoryService.updateCategory(categorySlug, payload);
        addToast("Category updated successfully.", "success");
      }

      onSaved();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        (isNew ? "Failed to create category." : "Failed to update category.");
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isNew ? "Add Category" : "Edit Category"}
            </div>
            <div className="modal-sub">
              {isNew
                ? "Create a new product category"
                : "Update category information"}
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            disabled={saving}
            type="button"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <Spinner />
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Name (English)</label>
                    <input
                      type="text"
                      className="input"
                      value={form.name_en}
                      onChange={(e) =>
                        handleInputChange("name_en", e.target.value)
                      }
                      placeholder="e.g., Electronics"
                      disabled={saving}
                    />
                    {errors.name_en && (
                      <div
                        style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}
                      >
                        {errors.name_en}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Name (Japanese)</label>
                    <input
                      type="text"
                      className="input"
                      value={form.name_ja}
                      onChange={(e) =>
                        handleInputChange("name_ja", e.target.value)
                      }
                      placeholder="e.g., 電子機器"
                      disabled={saving}
                    />
                    {errors.name_ja && (
                      <div
                        style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}
                      >
                        {errors.name_ja}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Slug</label>
                  <input
                    type="text"
                    className="input"
                    value={form.slug}
                    onChange={(e) => handleInputChange("slug", e.target.value)}
                    placeholder="e.g., electronics"
                    disabled={saving || !isNew}
                  />
                  {errors.slug && (
                    <div
                      style={{ fontSize: 11, color: "#b91c1c", marginTop: 4 }}
                    >
                      {errors.slug}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="label">Emoji (Optional)</label>
                  <input
                    type="text"
                    className="input"
                    value={form.emoji}
                    onChange={(e) => handleInputChange("emoji", e.target.value)}
                    placeholder="e.g., 🍵"
                    maxLength="2"
                    disabled={saving}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Description (English)</label>
                    <textarea
                      className="input"
                      value={form.description_en}
                      onChange={(e) =>
                        handleInputChange("description_en", e.target.value)
                      }
                      placeholder="Optional description in English"
                      disabled={saving}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Description (Japanese)</label>
                    <textarea
                      className="input"
                      value={form.description_ja}
                      onChange={(e) =>
                        handleInputChange("description_ja", e.target.value)
                      }
                      placeholder="Optional description in Japanese"
                      disabled={saving}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="label">Parent Category (Optional)</label>
                  <select
                    className="select"
                    value={form.parent_id}
                    onChange={(e) =>
                      handleInputChange("parent_id", e.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="">No parent category</option>
                    {allCategories
                      .filter(
                        (cat) => cat.id !== categoryData?.id && !cat.parent_id,
                      )
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name?.en || cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        handleInputChange("is_active", e.target.checked)
                      }
                      disabled={saving}
                    />
                    <span className="label" style={{ margin: 0 }}>
                      Active
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="topbar-btn btn-outline"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="topbar-btn btn-primary"
                  disabled={saving}
                >
                  {saving && <Spinner />}
                  {isNew ? "Create Category" : "Update Category"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
