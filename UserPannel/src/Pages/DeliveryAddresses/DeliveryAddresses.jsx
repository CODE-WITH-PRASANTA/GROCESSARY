import { useEffect, useState } from "react";

import {
  FaMapMarkerAlt,
  FaPlus,
  FaHome,
  FaBuilding,
  FaUsers,
  FaHeart,
  FaPencilAlt,
  FaTrashAlt,
  FaShieldAlt,
  FaTimes,
  FaLocationArrow,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

import Swal from "sweetalert2";

import API from "../../api/axios";

import "./DeliveryAddresses.css";

const emptyForm = {
  type: "Home",
  name: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pincode: "",
  landmark: "",
  isDefault: false,
  latitude: null,
  longitude: null,
  locationAddress: "",
};

// The API stores canonical address fields. Keeping the UI model in one place
// makes edit mode work for both a freshly saved address and one loaded later.
const toAddressViewModel = (address) => ({
  ...address,
  type: address.addressType || address.type || "Home",
  phone: address.mobile || address.phone || "",
  addressLine: address.address || address.addressLine || "",
  city: address.city || "",
  state: address.state || "",
  pincode: address.pincode || "",
  selected: Boolean(address.isDefault),
});

const formatCityStateZip = ({ city, state, pincode }) =>
  [city, state, pincode].filter(Boolean).join(", ");

const hasSavedLocation = ({ latitude, longitude }) =>
  latitude !== null &&
  latitude !== undefined &&
  longitude !== null &&
  longitude !== undefined;

const DeliveryAddresses = () => {
  // ======================================================
  // STATES
  // ======================================================

  const [addresses, setAddresses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [locationLoading, setLocationLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm);

  // ======================================================
  // FORM RESET
  // ======================================================

  const resetForm = () => {
    setFormData(emptyForm);

    setEditingId(null);
  };

  // ======================================================
  // GET ADDRESSES
  // ======================================================

  const fetchAddresses = async () => {
    try {
      setLoading(true);

      const response = await API.get("/delivery-address");

      if (response.data?.success) {
        setAddresses(
          Array.isArray(response.data.addresses)
            ? response.data.addresses.map(toAddressViewModel)
            : [],
        );
      } else {
        setAddresses([]);

        Swal.fire({
          icon: "error",
          title: "Unable to load addresses",
          text: response.data?.message || "Failed to fetch delivery addresses.",
        });
      }
    } catch (error) {
      console.error("Fetch delivery addresses error:", error);

      setAddresses([]);

      if (error.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Login required",
          text: "Please login to manage your delivery addresses.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Something went wrong",
          text:
            error.response?.data?.message ||
            "Failed to fetch delivery addresses.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // INITIAL LOAD
  // ======================================================

  useEffect(() => {
    const loadAddresses = async () => {
      await fetchAddresses();
    };

    void loadAddresses();
  }, []);

  // ======================================================
  // SELECT ADDRESS
  // ======================================================

  const handleSelectAddress = (id) => {
    setAddresses((previous) =>
      previous.map((addr) => ({
        ...addr,
        selected: addr._id === id,
      })),
    );
  };

  // ======================================================
  // OPEN ADD MODAL
  // ======================================================

  const handleOpenAddModal = () => {
    resetForm();

    setFormData({
      ...emptyForm,
      isDefault: addresses.length === 0,
    });

    setIsModalOpen(true);
  };

  // ======================================================
  // OPEN EDIT MODAL
  // ======================================================

  const handleOpenEditModal = (addr, e) => {
    e.stopPropagation();

    const address = toAddressViewModel(addr);

    setEditingId(address._id);

    setFormData({
      type: address.type,
      name: address.name || "",
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
      isDefault: Boolean(address.isDefault),
      latitude: address.latitude ?? null,
      longitude: address.longitude ?? null,
      locationAddress: address.locationAddress || "",
    });

    setIsModalOpen(true);
  };

  // ======================================================
  // GET CURRENT LOCATION
  // ======================================================

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        icon: "error",
        title: "Location unavailable",
        text: "Your browser does not support location services.",
      });

      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude;

          const longitude = position.coords.longitude;

          // ------------------------------------------------
          // Reverse geocoding
          // ------------------------------------------------
          //
          // This uses OpenStreetMap Nominatim to convert
          // coordinates into a readable address.
          //
          // You can later move this into your backend
          // if you want server-side geocoding.
          // ------------------------------------------------

          let locationAddress = "";

          try {
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            );

            if (geoResponse.ok) {
              const geoData = await geoResponse.json();

              locationAddress = geoData.display_name || "";

              const address = geoData.address || {};

              const city =
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                "";

              const state = address.state || "";

              const postcode = address.postcode || "";

              setFormData((previous) => ({
                ...previous,

                latitude,

                longitude,

                locationAddress,

                city: city || previous.city,

                state: state || previous.state,

                pincode: postcode || previous.pincode,

                addressLine:
                  [address.house_number, address.road, address.neighbourhood]
                    .filter(Boolean)
                    .join(", ") || previous.addressLine,
              }));

              await Swal.fire({
                icon: "success",
                title: "Location detected",
                text: "Your current location has been added to this delivery address.",
                timer: 1800,
                showConfirmButton: false,
              });

              return;
            }
          } catch (geoError) {
            console.warn("Reverse geocoding failed:", geoError);
          }

          // ------------------------------------------------
          // If reverse geocoding fails, still save GPS
          // ------------------------------------------------

          setFormData((previous) => ({
            ...previous,
            latitude,
            longitude,
            locationAddress: `Location: ${latitude.toFixed(
              6,
            )}, ${longitude.toFixed(6)}`,
          }));

          await Swal.fire({
            icon: "success",
            title: "Location detected",
            text: "GPS coordinates were detected successfully.",
            timer: 1800,
            showConfirmButton: false,
          });
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        setLocationLoading(false);

        let message = "Unable to fetch your current location.";

        if (error.code === 1) {
          message =
            "Location permission was denied. Please allow location access in your browser.";
        }

        if (error.code === 2) {
          message = "Your current location could not be determined.";
        }

        if (error.code === 3) {
          message = "Location request timed out. Please try again.";
        }

        Swal.fire({
          icon: "warning",
          title: "Location unavailable",
          text: message,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  };

  // ======================================================
  // DELETE ADDRESS
  // ======================================================

  const handleDeleteAddress = async (id, e) => {
    e.stopPropagation();

    const address = addresses.find((item) => item._id === id);

    if (!address) return;

    const result = await Swal.fire({
      icon: "warning",
      title: "Delete address?",
      text: `Are you sure you want to delete your ${address.type} address?`,
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      confirmButtonColor: "#ef4444",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setDeletingId(id);

      const response = await API.delete(`/delivery-address/${id}`);

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to delete address.");
      }

      setAddresses((previous) => previous.filter((item) => item._id !== id));

      await Swal.fire({
        icon: "success",
        title: "Address deleted",
        text: "The delivery address has been removed.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Delete address error:", error);

      Swal.fire({
        icon: "error",
        title: "Delete failed",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to delete address.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  // ======================================================
  // SUBMIT FORM
  // ======================================================

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (saving) return;

    // ----------------------------------------------------
    // Basic validation
    // ----------------------------------------------------

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.addressLine.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Missing information",
        text: "Please fill all required address fields.",
      });

      return;
    }

    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Enter a valid pincode",
        text: "Please enter a six-digit delivery pincode.",
      });

      return;
    }

    try {
      setSaving(true);

      const payload = {
        addressType: formData.type,
        name: formData.name.trim(),
        mobile: formData.phone.trim(),
        address: formData.addressLine.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        landmark: formData.landmark.trim(),
        isDefault: Boolean(formData.isDefault),

        latitude: formData.latitude !== null ? Number(formData.latitude) : null,

        longitude:
          formData.longitude !== null ? Number(formData.longitude) : null,

        locationAddress: formData.locationAddress || "",
      };

      // ==================================================
      // UPDATE
      // ==================================================

      if (editingId) {
        const response = await API.put(
          `/delivery-address/${editingId}`,
          payload,
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to update address.",
          );
        }

        await Swal.fire({
          icon: "success",
          title: "Address updated",
          text: "Your delivery address has been updated successfully.",
          timer: 1700,
          showConfirmButton: false,
        });
      }

      // ==================================================
      // CREATE
      // ==================================================
      else {
        const response = await API.post("/delivery-address", payload);

        if (!response.data?.success) {
          throw new Error(response.data?.message || "Failed to save address.");
        }

        await Swal.fire({
          icon: "success",
          title: "Address saved",
          text: "Your delivery address has been saved successfully.",
          timer: 1700,
          showConfirmButton: false,
        });
      }

      setIsModalOpen(false);

      resetForm();

      await fetchAddresses();
    } catch (error) {
      console.error("Save delivery address error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to save",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to save delivery address.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ======================================================
  // SET DELIVER HERE / DEFAULT
  // ======================================================

  const handleSetDeliverHere = async (id, e) => {
    e.stopPropagation();

    const address = addresses.find((item) => item._id === id);

    if (!address) return;

    try {
      const response = await API.put(`/delivery-address/${id}/default`);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to set default address.",
        );
      }

      setAddresses((previous) =>
        previous.map((item) => ({
          ...item,

          isDefault: item._id === id,

          selected: item._id === id,
        })),
      );

      await Swal.fire({
        icon: "success",
        title: "Delivery address selected",
        text: "This address is now your default delivery address.",
        timer: 1600,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Set default address error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to select address",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to select delivery address.",
      });
    }
  };

  // ======================================================
  // CATEGORY ICON
  // ======================================================

  const renderCategoryIcon = (type) => {
    switch ((type || "").toLowerCase()) {
      case "home":
        return <FaHome className="DeliveryAddresses-type-icon green" />;

      case "work":
        return <FaBuilding className="DeliveryAddresses-type-icon blue" />;

      case "parents home":
      case "parents":
        return <FaUsers className="DeliveryAddresses-type-icon orange" />;

      case "friend's home":
      case "friend":
        return <FaHeart className="DeliveryAddresses-type-icon pink" />;

      default:
        return <FaMapMarkerAlt className="DeliveryAddresses-type-icon green" />;
    }
  };

  // ======================================================
  // ICON TYPE
  // ======================================================

  const getIconType = (address) => {
    const addressText = String(
      address?.address ||
        address?.addressLine ||
        address?.locationAddress ||
        "",
    ).toLowerCase();

    if (
      addressText.includes("home") ||
      address?.addressType === "Home" ||
      address?.type === "Home"
    ) {
      return "home";
    }

    if (
      addressText.includes("office") ||
      addressText.includes("work") ||
      address?.addressType === "Work" ||
      address?.type === "Work"
    ) {
      return "work";
    }

    return "other";
  };

  // ======================================================
  // LOADING UI
  // ======================================================

  if (loading) {
    return (
      <div className="DeliveryAddresses-container">
        <div className="DeliveryAddresses-header">
          <div className="DeliveryAddresses-header-title">
            <FaMapMarkerAlt className="DeliveryAddresses-main-icon" />

            <div>
              <h2>Delivery Addresses</h2>

              <p>Manage all your saved delivery addresses</p>
            </div>
          </div>
        </div>

        <div className="DeliveryAddresses-loading">
          <div className="DeliveryAddresses-loading-spinner">
            <FaSpinner />
          </div>

          <h3>Loading your addresses</h3>

          <p>Please wait while we fetch your saved delivery locations...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // MAIN UI
  // ======================================================

  return (
    <div className="DeliveryAddresses-container">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="DeliveryAddresses-header">
        <div className="DeliveryAddresses-header-title">
          <FaMapMarkerAlt className="DeliveryAddresses-main-icon" />

          <div>
            <h2>Delivery Addresses</h2>

            <p>Manage all your saved delivery addresses</p>
          </div>
        </div>

        <button
          className="DeliveryAddresses-add-btn"
          onClick={handleOpenAddModal}
        >
          <FaPlus />
          Add New Address
        </button>
      </div>

      {/* ==================================================
          ADDRESS LIST
      ================================================== */}

      <div className="DeliveryAddresses-list">
        {addresses.length === 0 ? (
          <div className="DeliveryAddresses-empty">
            <div className="DeliveryAddresses-empty-icon">
              <FaMapMarkerAlt />
            </div>

            <h3>No delivery addresses yet</h3>

            <p>Add your first delivery address to make checkout faster.</p>

            <button
              className="DeliveryAddresses-add-btn"
              onClick={handleOpenAddModal}
            >
              <FaPlus />
              Add Your First Address
            </button>
          </div>
        ) : (
          addresses.map((addr) => (
            <div
              key={addr._id}
              className={`DeliveryAddresses-card ${
                addr.selected ? "selected" : ""
              }`}
              onClick={() => handleSelectAddress(addr._id)}
            >
              {/* DEFAULT */}

              {addr.isDefault && (
                <span className="DeliveryAddresses-top-pill">
                  <FaCheckCircle />
                  Default Address
                </span>
              )}

              <div className="DeliveryAddresses-card-body">
                {/* RADIO */}

                <div className="DeliveryAddresses-radio-wrapper">
                  <span
                    className={`DeliveryAddresses-radio ${
                      addr.selected ? "checked" : ""
                    }`}
                  />
                </div>

                {/* ICON */}

                <div
                  className={`DeliveryAddresses-icon-box ${
                    addr.iconType || getIconType(addr)
                  }`}
                >
                  {renderCategoryIcon(addr.type)}
                </div>

                {/* INFO */}

                <div className="DeliveryAddresses-info">
                  <div className="DeliveryAddresses-type-row">
                    <h3 className="DeliveryAddresses-type-title">
                      {addr.type}
                    </h3>

                    {addr.isDefault && (
                      <span className="DeliveryAddresses-badge-default">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="DeliveryAddresses-person-name">{addr.name}</p>

                  <p className="DeliveryAddresses-person-phone">{addr.phone}</p>

                  {addr.selected && !addr.isDefault && (
                    <button
                      className="DeliveryAddresses-deliver-here-btn"
                      onClick={(e) => handleSetDeliverHere(addr._id, e)}
                    >
                      <FaCheckCircle />
                      Deliver here
                    </button>
                  )}
                </div>

                {/* ADDRESS DETAILS */}

                <div className="DeliveryAddresses-details">
                  <div className="DeliveryAddresses-address-line-wrapper">
                    <FaMapMarkerAlt className="DeliveryAddresses-pin-icon" />

                    <div className="DeliveryAddresses-address-text">
                      <p>{addr.addressLine}</p>

                      <p>{formatCityStateZip(addr)}</p>

                      {addr.landmark && (
                        <p className="DeliveryAddresses-landmark">
                          {addr.landmark}
                        </p>
                      )}

                      {hasSavedLocation(addr) && (
                        <small className="DeliveryAddresses-location-coordinates">
                          <FaLocationArrow />
                          Location saved
                        </small>
                      )}
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="DeliveryAddresses-actions">
                  <button
                    className="DeliveryAddresses-action-btn edit"
                    onClick={(e) => handleOpenEditModal(addr, e)}
                  >
                    <FaPencilAlt />
                    Edit
                  </button>

                  <button
                    className="DeliveryAddresses-action-btn delete"
                    onClick={(e) => handleDeleteAddress(addr._id, e)}
                    disabled={deletingId === addr._id}
                  >
                    {deletingId === addr._id ? (
                      <FaSpinner className="DeliveryAddresses-button-spinner" />
                    ) : (
                      <FaTrashAlt />
                    )}

                    {deletingId === addr._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ==================================================
          SECURITY BANNER
      ================================================== */}

      <div className="DeliveryAddresses-banner">
        <div className="DeliveryAddresses-banner-left">
          <div className="DeliveryAddresses-shield-icon">
            <FaShieldAlt />
          </div>

          <div className="DeliveryAddresses-banner-text">
            <h4>Safe & Secure Deliveries</h4>

            <p>
              Your addresses are safe with us. We ensure secure and hassle-free
              deliveries every time you order.
            </p>
          </div>
        </div>

        <div className="DeliveryAddresses-banner-illustration">
          <div className="DeliveryAddresses-scooter">🛵</div>

          <div className="DeliveryAddresses-map-graphic">📍</div>
        </div>
      </div>

      {/* ==================================================
          ADD / EDIT MODAL
      ================================================== */}

      {isModalOpen && (
        <div className="DeliveryAddresses-modal-overlay">
          <div className="DeliveryAddresses-modal">
            <div className="DeliveryAddresses-modal-header">
              <div>
                <h3>{editingId ? "Edit Address" : "Add New Address"}</h3>

                <p>Save a delivery location for faster checkout.</p>
              </div>

              <button
                type="button"
                className="DeliveryAddresses-close-btn"
                onClick={() => !saving && setIsModalOpen(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              className="DeliveryAddresses-form"
            >
              {/* ADDRESS TYPE */}

              <div className="DeliveryAddresses-form-group">
                <label>Address Type</label>

                <select
                  value={formData.type}
                  onChange={(e) => {
                    const val = e.target.value;

                    setFormData({
                      ...formData,
                      type: val,
                    });
                  }}
                >
                  <option value="Home">Home</option>

                  <option value="Work">Work</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* CURRENT LOCATION */}

              <div className="DeliveryAddresses-location-box">
                <div className="DeliveryAddresses-location-content">
                  <div className="DeliveryAddresses-location-icon">
                    <FaLocationArrow />
                  </div>

                  <div>
                    <h4>Use current location</h4>

                    <p>Automatically detect your current delivery location.</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="DeliveryAddresses-location-btn"
                  onClick={handleGetCurrentLocation}
                  disabled={locationLoading || saving}
                >
                  {locationLoading ? (
                    <>
                      <FaSpinner className="DeliveryAddresses-button-spinner" />
                      Detecting...
                    </>
                  ) : (
                    <>
                      <FaLocationArrow />
                      Detect
                    </>
                  )}
                </button>
              </div>

              {/* FULL NAME */}

              <div className="DeliveryAddresses-form-group">
                <label>Full Name</label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter full name"
                />
              </div>

              {/* PHONE */}

              <div className="DeliveryAddresses-form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* ADDRESS */}

              <div className="DeliveryAddresses-form-group DeliveryAddresses-form-group-full">
                <label>Flat / Plot / House No.</label>

                <input
                  type="text"
                  required
                  value={formData.addressLine}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      addressLine: e.target.value,
                    })
                  }
                  placeholder="Plot No. 123, Kharvel Nagar"
                />
              </div>

              {/* CITY, STATE & PINCODE */}

              <div className="DeliveryAddresses-form-group">
                <label>City</label>

                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      city: e.target.value,
                    })
                  }
                  placeholder="Bhubaneswar"
                  autoComplete="address-level2"
                />
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>State</label>

                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      state: e.target.value,
                    })
                  }
                  placeholder="Odisha"
                  autoComplete="address-level1"
                />
              </div>

              <div className="DeliveryAddresses-form-group">
                <label>Pincode</label>

                <input
                  type="text"
                  required
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pincode: e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                    })
                  }
                  placeholder="751001"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </div>

              {/* LANDMARK */}

              <div className="DeliveryAddresses-form-group">
                <label>
                  Landmark <span>(Optional)</span>
                </label>

                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      landmark: e.target.value,
                    })
                  }
                  placeholder="Near Police Station"
                />
              </div>

              {/* LOCATION STATUS */}

              {formData.latitude !== null && formData.longitude !== null && (
                <div className="DeliveryAddresses-location-success">
                  <FaCheckCircle />

                  <div>
                    <strong>Current location attached</strong>

                    <span>
                      GPS coordinates will be saved securely with this delivery
                      address.
                    </span>
                  </div>
                </div>
              )}

              {/* DEFAULT */}

              <div className="DeliveryAddresses-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        isDefault: e.target.checked,
                      })
                    }
                  />

                  <span>Make this my default address</span>
                </label>
              </div>

              {/* FOOTER */}

              <div className="DeliveryAddresses-modal-footer">
                <button
                  type="button"
                  className="DeliveryAddresses-cancel-btn"
                  onClick={() => !saving && setIsModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="DeliveryAddresses-save-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <FaSpinner className="DeliveryAddresses-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />

                      {editingId ? "Update Address" : "Save Address"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryAddresses;
