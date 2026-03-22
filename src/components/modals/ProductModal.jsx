import React, { useState, useEffect } from "react";
import useToastStore from "../../stores/toastStore";
import Spinner from "../common/Spinner";
import Loading from "../common/Loading";
import { Ic } from "../common/Icons";

// hooks
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";

export default function ProductModal({ productSlug, onClose, onSaved }) {
  const addToast = useToastStore((state) => state.addToast);

  // react query hooks
  const { data: categories, isLoading: loadingCategories } = useCategories();

  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();

  // fetch product details when editing
  const {
    data: productData,
    isLoading: productLoading,
    error: productError,
  } = useProduct(productSlug);

  const isNew = !productSlug;

  const [form, setForm] = useState({
    // Basic info
    name: "",
    sku: "",
    slug: "",
    // keep category ids as a comma separated string for the controlled input
    category_ids: "",

    // Pricing
    base_price: "",
    sale_price: "",
    currency: "JPY",
    tax_rate: 0.1,
    tax_included: true,

    // Bilingual descriptions
    description_en: "",
    description_ja: "",

    // Product Attributes
    brand: "",
    weight_grams: "",
    certifications: "",
    ingredients: "",
    allergens: "",
    shelf_life_days: "",
    storage_instructions_en: "",
    storage_instructions_ja: "",
    country_of_origin: "Japan",
    barcode: "",
    net_weight_grams: "",

    // Shipping
    weight_kg: "",
    dimensions_cm: "",
    requires_cold_chain: false,
    ships_internationally: true,
    domestic_only: false,
    prohibited_countries: "",
    handling_days: 2,

    // Discovery
    tags: "",
    search_keywords: "",

    // Status
    is_active: true,
    is_featured: false,
    is_new_arrival: false,
  });

  // State for file uploads
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);

  const [existingMedia, setExistingMedia] = useState({
    thumbnail_url: null,
    thumbnail: null,
    image_urls: [],
    video_url: null,
  });

  const [removeThumbnail, setRemoveThumbnail] = useState(false);
  const [removeVideo, setRemoveVideo] = useState(false);
  const [removeImages, setRemoveImages] = useState([]);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "sample";
  const existingThumbSrc = existingMedia.thumbnail
    ? `https://res.cloudinary.com/${cloudName}/image/upload/${existingMedia.thumbnail}`
    : existingMedia.thumbnail_url || null;

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [activeTab, setActiveTab] = useState("basic"); // basic, attributes, shipping, media

  // Initialize form with product data when editing
  useEffect(() => {
    if (!isNew && productData) {
      const product = productData; // alias
      setForm({
        // Basic info
        name: product.name || "",
        sku: product.sku || "",
        slug: product.slug || "",
        category_ids: (product.category_ids || []).join(", "),

        // Pricing
        base_price: product.pricing?.base_price || "",
        sale_price: product.pricing?.sale_price || "",
        currency: product.pricing?.currency || "JPY",
        tax_rate: product.pricing?.tax_rate || 0.1,
        tax_included:
          product.pricing?.tax_included !== undefined
            ? product.pricing.tax_included
            : true,

        // Bilingual descriptions
        description_en: product.description?.en || "",
        description_ja: product.description?.ja || "",

        // Product Attributes
        brand: product.attributes?.brand || "",
        weight_grams: product.attributes?.weight_grams || "",
        certifications: (product.attributes?.certifications || []).join(", "),
        ingredients: (product.attributes?.ingredients || []).join(", "),
        allergens: (product.attributes?.allergens || []).join(", "),
        shelf_life_days: product.attributes?.shelf_life_days || "",
        storage_instructions_en:
          product.attributes?.storage_instructions?.en || "",
        storage_instructions_ja:
          product.attributes?.storage_instructions?.ja || "",
        country_of_origin: product.attributes?.country_of_origin || "Japan",
        barcode: product.attributes?.barcode || "",
        net_weight_grams: product.attributes?.net_weight_grams || "",

        // Shipping
        weight_kg: product.shipping?.weight_kg || "",
        dimensions_cm: product.shipping?.dimensions_cm || "",
        requires_cold_chain: product.shipping?.requires_cold_chain || false,
        ships_internationally:
          product.shipping?.ships_internationally !== undefined
            ? product.shipping.ships_internationally
            : true,
        domestic_only: product.shipping?.domestic_only || false,
        prohibited_countries: (
          product.shipping?.prohibited_countries || []
        ).join(", "),
        handling_days: product.shipping?.handling_days || 2,

        // Discovery
        tags: (product.tags || []).join(", "),
        search_keywords: (product.search_keywords || []).join(", "),

        // Status
        is_active: product.is_active !== undefined ? product.is_active : true,
        is_featured: product.is_featured || false,
        is_new_arrival: product.is_new_arrival || false,
      });


      if (product.media) {
        setExistingMedia({
          thumbnail_url: product.media.thumbnail_url || null,
          thumbnail: product.media.thumbnail || null,
          image_urls: product.media.image_urls || [],
          video_url:
            product.media.video_url_full || product.media.video_url || null,
        });
      } else if (product.thumbnail_url) {
        // If product has direct thumbnail_url (from list serializer)
        setExistingMedia({
          thumbnail_url: product.thumbnail_url || null,
          thumbnail: null,
          image_urls: [],
          video_url: null,
        });
      }

      // Reset explicit removal flags whenever we (re)load product data
      setRemoveThumbnail(false);
      setRemoveVideo(false);
      setRemoveImages([]);
    }
  }, [productData, isNew]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Handle thumbnail selection
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onload = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
      // Selecting a new file implicitly replaces the old one — not an explicit removal
      setRemoveThumbnail(false);
    }
  };

  // Handle multiple images selection
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);

      // Create previews
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreviews((prev) => [...prev, reader.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Remove an image from the selection
  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle video selection
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = () => setVideoPreview(reader.result);
      reader.readAsDataURL(file);
      setRemoveVideo(false);
    }
  };

  const removeExistingThumbnail = () => {
    setExistingMedia((prev) => ({
      ...prev,
      thumbnail_url: null,
      thumbnail: null,
    }));
    setRemoveThumbnail(true);
  };

  const removeExistingVideo = () => {
    setExistingMedia((prev) => ({ ...prev, video_url: null }));
    setRemoveVideo(true);
  };

  const removeExistingImage = (index) => {
    setExistingMedia((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
    setRemoveImages((prev) => [...prev, index]);
  };

  // Parse comma-separated strings to arrays
  const parseCommaList = (str) => {
    return str
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (!isNew && productLoading) {
    return (
      <div className="modal-backdrop">
        <div className="modal">
          <Loading />
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="modal-backdrop">
        <div className="modal">Error loading product</div>
      </div>
    );
  }

  const submit = async () => {
    setLoading(true);
    setUploadProgress(true);

    try {
      const formData = new FormData();

      // Basic Info
      formData.append("sku", form.sku);
      formData.append("name", form.name);
      if (form.slug) formData.append("slug", form.slug);

      // Category IDs
      const categoryIds = parseCommaList(form.category_ids);
      if (categoryIds.length > 0) {
        categoryIds.forEach((id) => {
          formData.append("category_ids", id);
        });
      } else {
        formData.append("category_ids", "");
      }

      // Pricing
      const pricing = {
        base_price: parseFloat(form.base_price),
        sale_price: form.sale_price ? parseFloat(form.sale_price) : null,
        currency: form.currency,
        tax_rate: parseFloat(form.tax_rate),
        tax_included: form.tax_included,
      };
      formData.append("pricing", JSON.stringify(pricing));

      // Description
      const description = { en: form.description_en, ja: form.description_ja };
      formData.append("description", JSON.stringify(description));

      // Attributes
      const attributes = {
        brand: form.brand,
        weight_grams: form.weight_grams ? parseInt(form.weight_grams) : null,
        certifications: parseCommaList(form.certifications),
        ingredients: parseCommaList(form.ingredients),
        allergens: parseCommaList(form.allergens),
        shelf_life_days: form.shelf_life_days
          ? parseInt(form.shelf_life_days)
          : null,
        storage_instructions: {
          en: form.storage_instructions_en,
          ja: form.storage_instructions_ja,
        },
        country_of_origin: form.country_of_origin,
        barcode: form.barcode,
        net_weight_grams: form.net_weight_grams
          ? parseInt(form.net_weight_grams)
          : null,
      };
      Object.keys(attributes).forEach((key) => {
        if (
          attributes[key] === null ||
          attributes[key] === undefined ||
          attributes[key] === ""
        ) {
          delete attributes[key];
        }
      });
      if (Object.keys(attributes).length > 0) {
        formData.append("attributes", JSON.stringify(attributes));
      }

      // Shipping
      const shipping = {
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        dimensions_cm: form.dimensions_cm,
        requires_cold_chain: form.requires_cold_chain,
        ships_internationally: form.ships_internationally,
        domestic_only: form.domestic_only,
        prohibited_countries: parseCommaList(form.prohibited_countries),
        handling_days: parseInt(form.handling_days) || 2,
      };
      Object.keys(shipping).forEach((key) => {
        if (
          shipping[key] === null ||
          shipping[key] === undefined ||
          shipping[key] === ""
        ) {
          delete shipping[key];
        }
      });
      if (Object.keys(shipping).length > 0) {
        formData.append("shipping", JSON.stringify(shipping));
      }

      // Tags and keywords
      const tags = parseCommaList(form.tags);
      tags.forEach((tag) => formData.append("tags", tag));

      const searchKeywords = parseCommaList(form.search_keywords);
      searchKeywords.forEach((kw) => formData.append("search_keywords", kw));

      // Status flags
      formData.append("is_active", form.is_active ? "true" : "false");
      formData.append("is_featured", form.is_featured ? "true" : "false");
      formData.append("is_new_arrival", form.is_new_arrival ? "true" : "false");

      // Media files — only append when user actually selected something
      if (thumbnailFile) {
        formData.append("thumbnail_file", thumbnailFile);
      }
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append("image_files", file);
        });
      }
      if (videoFile) {
        formData.append("video_file", videoFile);
      }

      // FIX: only send remove flags when the user explicitly clicked "Remove"
      // Never infer removal from the absence of a URL — that would wipe
      // Cloudinary assets that were already saved on a previous save.
      if (!isNew) {
        if (removeThumbnail) {
          formData.append("remove_thumbnail", "true");
        }
        if (removeVideo) {
          formData.append("remove_video", "true");
        }
        if (removeImages.length > 0) {
          formData.append("remove_images", JSON.stringify(removeImages));
        }
      }

      if (isNew) {
        await createProductMutation.mutateAsync(formData);
        addToast("Product created successfully", "success");
      } else {
        await updateProductMutation.mutateAsync({
          slug: productSlug,
          formData,
        });
        addToast("Product updated successfully", "success");
      }

      onSaved();
    } catch (e) {
      // log validation details if available
      console.error("Error saving product:", e);
      if (e.payload) {
        console.error("Payload from server:", e.payload);
        if (e.payload.errors) {
          addToast(
            `Validation error: ${JSON.stringify(e.payload.errors)}`,
            "error",
            { duration: 8000 },
          );
        }
      }
      addToast(e.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
      setUploadProgress(false);
    }
  };

  // Tab navigation
  const tabs = [
    { id: "basic", label: "Basic Info", icon: "📋" },
    { id: "pricing", label: "Pricing", icon: "💰" },
    { id: "attributes", label: "Attributes", icon: "🏷️" },
    { id: "shipping", label: "Shipping", icon: "🚚" },
    { id: "media", label: "Media", icon: "🖼️" },
    { id: "seo", label: "SEO & Tags", icon: "🔍" },
  ];

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal modal-xl">
        <div className="modal-header">
          <div>
            <div className="modal-title">
              {isNew ? "Add New Product" : `Edit Product: ${productData?.name}`}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <Ic.X />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{ borderBottom: "1px solid var(--border)", padding: "0 20px" }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="label"
                style={{
                  padding: "10px 15px",
                  border: "none",
                  borderBottom:
                    activeTab === tab.id ? "2px solid var(--primary)" : "none",
                  background: "none",
                  cursor: "pointer",
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color:
                    activeTab === tab.id
                      ? "var(--primary)"
                      : "var(--ink-muted)",
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="modal-body"
          style={{ maxHeight: "60vh", overflowY: "auto", padding: "20px" }}
        >
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="tab-pane">
              <h3 className="modal-sub" style={{ marginBottom: "20px" }}>
                Basic Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Product Name *</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">SKU *</label>
                  <input
                    className="input"
                    value={form.sku}
                    onChange={(e) => set("sku", e.target.value.toUpperCase())}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">
                    Slug (leave empty to auto-generate)
                  </label>
                  <input
                    className="input"
                    value={form.slug}
                    onChange={(e) => set("slug", e.target.value)}
                    placeholder="product-url-slug"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Categories</label>
                  {loadingCategories ? (
                    <div style={{ padding: "8px", color: "var(--ink-muted)" }}>
                      Loading categories...
                    </div>
                  ) : categories.length === 0 ? (
                    <div style={{ padding: "8px", color: "var(--ink-muted)" }}>
                      No categories available
                    </div>
                  ) : (
                    <select
                      className="input"
                      value={parseCommaList(form.category_ids || "")}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value,
                        );
                        set("category_ids", selectedOptions.join(", "));
                      }}
                      multiple
                      size="6"
                      style={{ minHeight: "150px" }}
                    >
                      {categories.map((cat) => (
                        <option
                          key={cat.id}
                          value={cat.id}
                          style={{
                            paddingLeft: `${cat.level * 20 + 8}px`,
                            fontWeight: cat.level === 0 ? 600 : 400,
                            backgroundColor:
                              cat.level === 0 ? "#f8f9fa" : "transparent",
                            borderBottom:
                              cat.level === 0 ? "1px solid #eee" : "none",
                          }}
                        >
                          {cat.level > 0 ? "—".repeat(cat.level) + " " : ""}
                          {cat.name?.en || cat.name}
                          {cat.level === 0 ? " 📁" : " 📂"}
                        </option>
                      ))}
                    </select>
                  )}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "var(--ink-muted)",
                      marginTop: "5px",
                    }}
                  >
                    Hold Ctrl/Cmd (⌘) to select multiple categories
                  </div>
                  {form.category_ids && (
                    <div style={{ fontSize: "12px", marginTop: "8px" }}>
                      <span style={{ color: "var(--ink-muted)" }}>
                        Selected:{" "}
                      </span>
                      <span style={{ fontWeight: 500 }}>
                        {parseCommaList(form.category_ids || "").length} categor
                        {parseCommaList(form.category_ids || "").length === 1
                          ? "y"
                          : "ies"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="label">Description (English)</label>
                <textarea
                  className="input"
                  rows="4"
                  value={form.description_en}
                  onChange={(e) => set("description_en", e.target.value)}
                  placeholder="Product description in English"
                />
              </div>

              <div className="form-group">
                <label className="label">Description (Japanese)</label>
                <textarea
                  className="input"
                  rows="4"
                  value={form.description_ja}
                  onChange={(e) => set("description_ja", e.target.value)}
                  placeholder="商品説明（日本語）"
                />
              </div>

              <div className="form-row">
                <div
                  className="form-group"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => set("is_active", e.target.checked)}
                  />
                  <label
                    htmlFor="is_active"
                    className="label"
                    style={{ margin: 0 }}
                  >
                    Active
                  </label>
                </div>

                <div
                  className="form-group"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    id="is_featured"
                    checked={form.is_featured}
                    onChange={(e) => set("is_featured", e.target.checked)}
                  />
                  <label
                    htmlFor="is_featured"
                    className="label"
                    style={{ margin: 0 }}
                  >
                    Featured
                  </label>
                </div>

                <div
                  className="form-group"
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <input
                    type="checkbox"
                    id="is_new_arrival"
                    checked={form.is_new_arrival}
                    onChange={(e) => set("is_new_arrival", e.target.checked)}
                  />
                  <label
                    htmlFor="is_new_arrival"
                    className="label"
                    style={{ margin: 0 }}
                  >
                    New Arrival
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Tab */}
          {activeTab === "pricing" && (
            <div className="tab-pane">
              <h3 className="modal-sub" style={{ marginBottom: "20px" }}>
                Pricing Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Base Price *</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.base_price}
                    onChange={(e) => set("base_price", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label">Sale Price</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.sale_price}
                    onChange={(e) => set("sale_price", e.target.value)}
                    placeholder="Leave empty if none"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Currency</label>
                  <select
                    className="input"
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                  >
                    <option value="JPY">JPY (Japanese Yen)</option>
                    <option value="USD">USD (US Dollar)</option>
                    <option value="EUR">EUR (Euro)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Tax Rate (%)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={form.tax_rate}
                    onChange={(e) => set("tax_rate", e.target.value)}
                  />
                </div>
              </div>

              <div
                className="form-group"
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <input
                  type="checkbox"
                  id="tax_included"
                  checked={form.tax_included}
                  onChange={(e) => set("tax_included", e.target.checked)}
                />
                <label
                  htmlFor="tax_included"
                  className="label"
                  style={{ margin: 0 }}
                >
                  Tax included in price
                </label>
              </div>
            </div>
          )}

          {/* Attributes Tab */}
          {activeTab === "attributes" && (
            <div className="tab-pane">
              <h3 className="modal-sub" style={{ marginBottom: "20px" }}>
                Product Attributes
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Brand</label>
                  <input
                    className="input"
                    value={form.brand}
                    onChange={(e) => set("brand", e.target.value)}
                    placeholder="e.g., Uji Tea Co."
                  />
                </div>
                <div className="form-group">
                  <label className="label">Country of Origin</label>
                  <input
                    className="input"
                    value={form.country_of_origin}
                    onChange={(e) => set("country_of_origin", e.target.value)}
                    placeholder="Japan"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Weight (grams)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.weight_grams}
                    onChange={(e) => set("weight_grams", e.target.value)}
                    placeholder="e.g., 500"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Net Weight (grams)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.net_weight_grams}
                    onChange={(e) => set("net_weight_grams", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Barcode</label>
                  <input
                    className="input"
                    value={form.barcode}
                    onChange={(e) => set("barcode", e.target.value)}
                    placeholder="e.g., 4901234567890"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Shelf Life (days)</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.shelf_life_days}
                    onChange={(e) => set("shelf_life_days", e.target.value)}
                    placeholder="e.g., 365"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  Certifications (comma-separated)
                </label>
                <input
                  className="input"
                  value={form.certifications}
                  onChange={(e) => set("certifications", e.target.value)}
                  placeholder="JAS Organic, Rainforest Alliance"
                />
              </div>

              <div className="form-group">
                <label className="label">Ingredients (comma-separated)</label>
                <input
                  className="input"
                  value={form.ingredients}
                  onChange={(e) => set("ingredients", e.target.value)}
                  placeholder="Matcha powder, Rice, Sugar"
                />
              </div>

              <div className="form-group">
                <label className="label">Allergens (comma-separated)</label>
                <input
                  className="input"
                  value={form.allergens}
                  onChange={(e) => set("allergens", e.target.value)}
                  placeholder="Milk, Wheat, Soy"
                />
              </div>

              <div className="form-group">
                <label className="label">Storage Instructions (English)</label>
                <textarea
                  className="input"
                  rows="2"
                  value={form.storage_instructions_en}
                  onChange={(e) =>
                    set("storage_instructions_en", e.target.value)
                  }
                  placeholder="Store in cool, dark place. Refrigerate after opening."
                />
              </div>

              <div className="form-group">
                <label className="label">Storage Instructions (Japanese)</label>
                <textarea
                  className="input"
                  rows="2"
                  value={form.storage_instructions_ja}
                  onChange={(e) =>
                    set("storage_instructions_ja", e.target.value)
                  }
                  placeholder="冷暗所で保存。開封後は冷蔵庫で保管。"
                />
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === "shipping" && (
            <div className="tab-pane">
              <h3 className="modal-sub" style={{ marginBottom: "20px" }}>
                Shipping Information
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Weight (kg)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.weight_kg}
                    onChange={(e) => set("weight_kg", e.target.value)}
                    placeholder="e.g., 0.5"
                  />
                </div>
                <div className="form-group">
                  <label className="label">Dimensions (LxWxH cm)</label>
                  <input
                    className="input"
                    value={form.dimensions_cm}
                    onChange={(e) => set("dimensions_cm", e.target.value)}
                    placeholder="20x15x10"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">Handling Days</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.handling_days}
                    onChange={(e) => set("handling_days", e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="label">
                    Prohibited Countries (ISO codes)
                  </label>
                  <input
                    className="input"
                    value={form.prohibited_countries}
                    onChange={(e) =>
                      set("prohibited_countries", e.target.value)
                    }
                    placeholder="US, GB, AU"
                  />
                </div>
              </div>

              <div
                className="form-group"
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <input
                  type="checkbox"
                  id="requires_cold_chain"
                  checked={form.requires_cold_chain}
                  onChange={(e) => set("requires_cold_chain", e.target.checked)}
                />
                <label
                  htmlFor="requires_cold_chain"
                  className="label"
                  style={{ margin: 0 }}
                >
                  Requires cold chain (refrigerated shipping)
                </label>
              </div>

              <div
                className="form-group"
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <input
                  type="checkbox"
                  id="ships_internationally"
                  checked={form.ships_internationally}
                  onChange={(e) =>
                    set("ships_internationally", e.target.checked)
                  }
                />
                <label
                  htmlFor="ships_internationally"
                  className="label"
                  style={{ margin: 0 }}
                >
                  Ships internationally
                </label>
              </div>

              <div
                className="form-group"
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <input
                  type="checkbox"
                  id="domestic_only"
                  checked={form.domestic_only}
                  onChange={(e) => set("domestic_only", e.target.checked)}
                />
                <label
                  htmlFor="domestic_only"
                  className="label"
                  style={{ margin: 0 }}
                >
                  Domestic only (Japan only)
                </label>
              </div>
            </div>
          )}

          {/* Media Tab */}
          {activeTab === "media" && (
            <div className="tab-pane">
              <h3 className="modal-sub" style={{ marginBottom: "20px" }}>
                Product Media
              </h3>

              {/* Thumbnail Upload */}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="label">Thumbnail Image</label>

                {/* Existing thumbnail preview */}
                {!isNew && existingThumbSrc && !thumbnailPreview && (
                  <div
                    style={{
                      marginBottom: "10px",
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={existingThumbSrc}
                      alt="Current thumbnail"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />

                    <button
                      onClick={removeExistingThumbnail}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "rgba(0,0,0,0.5)",
                        border: "none",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--ink-muted)",
                        marginTop: "5px",
                      }}
                    >
                      Current thumbnail
                    </div>
                  </div>
                )}
                {/* New thumbnail preview */}
                {thumbnailPreview && (
                  <div
                    style={{
                      marginBottom: "10px",
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <img
                      src={thumbnailPreview}
                      alt="New thumbnail preview"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "rgba(0,0,0,0.5)",
                        border: "none",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  className="input"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  style={{ padding: "8px" }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "5px",
                  }}
                >
                  Recommended size: 800x800px or larger. Max 10MB.
                </div>
              </div>

              {/* Multiple Images Upload */}
              <div className="form-group" style={{ marginBottom: "20px" }}>
                <label className="label">Additional Images</label>

                {/* Existing images preview */}
                {!isNew && existingMedia.image_urls.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        marginBottom: "8px",
                        color: "var(--ink-muted)",
                      }}
                    >
                      Current images:
                    </div>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      {existingMedia.image_urls.map((url, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <img
                            src={url}
                            alt={`Product ${idx + 1}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <button
                            onClick={() => removeExistingImage(idx)}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              background: "rgba(255,0,0,0.7)",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              color: "white",
                              cursor: "pointer",
                              fontSize: "12px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                            title="Remove this image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New images previews */}
                {imagePreviews.length > 0 && (
                  <div style={{ marginBottom: "15px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        marginBottom: "8px",
                        color: "var(--ink-muted)",
                      }}
                    >
                      New images to upload:
                    </div>
                    <div
                      style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                    >
                      {imagePreviews.map((preview, idx) => (
                        <div key={idx} style={{ position: "relative" }}>
                          <img
                            src={preview}
                            alt={`Preview ${idx + 1}`}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <button
                            onClick={() => removeImage(idx)}
                            style={{
                              position: "absolute",
                              top: "2px",
                              right: "2px",
                              background: "rgba(0,0,0,0.5)",
                              border: "none",
                              borderRadius: "50%",
                              width: "20px",
                              height: "20px",
                              color: "white",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="file"
                  className="input"
                  accept="image/*"
                  multiple
                  onChange={handleImagesChange}
                  style={{ padding: "8px" }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "5px",
                  }}
                >
                  You can select multiple images. Max 5MB per image.
                </div>
              </div>

              {/* Video Upload */}
              <div className="form-group">
                <label className="label">Product Video (Optional)</label>

                {/* Existing video */}
                {!isNew && existingMedia.video_url && !videoPreview && (
                  <div style={{ marginBottom: "10px" }}>
                    <video
                      src={existingMedia.video_url}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={removeExistingVideo}
                      style={{
                        marginTop: "5px",
                        background: "none",
                        border: "1px solid var(--border)",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Remove video
                    </button>
                  </div>
                )}

                {/* New video preview */}
                {videoPreview && (
                  <div style={{ marginBottom: "10px", position: "relative" }}>
                    <video
                      src={videoPreview}
                      controls
                      style={{
                        width: "100%",
                        maxHeight: "200px",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "rgba(0,0,0,0.5)",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        color: "white",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  className="input"
                  accept="video/*"
                  onChange={handleVideoChange}
                  style={{ padding: "8px" }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "5px",
                  }}
                >
                  Max file size: 100MB. Supported formats: MP4, MOV, AVI
                </div>
              </div>
            </div>
          )}

          {/* SEO & Tags Tab */}
          {activeTab === "seo" && (
            <div className="tab-pane">
              <h3 className="modal-sub" style={{ marginBottom: "20px" }}>
                SEO & Discovery
              </h3>

              <div className="form-group">
                <label className="label">Tags (comma-separated)</label>
                <input
                  className="input"
                  value={form.tags}
                  onChange={(e) => set("tags", e.target.value)}
                  placeholder="matcha, organic, premium, tea"
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "5px",
                  }}
                >
                  Used for filtering and categorization
                </div>
              </div>

              <div className="form-group">
                <label className="label">
                  Search Keywords (comma-separated)
                </label>
                <input
                  className="input"
                  value={form.search_keywords}
                  onChange={(e) => set("search_keywords", e.target.value)}
                  placeholder="抹茶, グリーンティー, matcha, green tea"
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "5px",
                  }}
                >
                  Keywords for search engine optimization (English & Japanese)
                </div>
              </div>

              <div className="form-group">
                <label className="label">Slug</label>
                <input
                  className="input"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="product-url-slug"
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    marginTop: "5px",
                  }}
                >
                  URL-friendly name. Auto-generated from product name if left
                  empty.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="topbar-btn btn-outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="topbar-btn btn-primary"
            onClick={submit}
            disabled={loading || !form.name || !form.sku || !form.base_price}
          >
            {loading ? (
              <>
                <Spinner size={16} />
                {uploadProgress ? " Uploading..." : " Saving..."}
              </>
            ) : isNew ? (
              <>
                <Ic.Plus /> Create Product
              </>
            ) : (
              <>
                <Ic.Check size={14} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
