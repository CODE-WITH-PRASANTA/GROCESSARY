import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import API from "../api/axios";

// ======================================================
// GET CART
// ======================================================

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get("/cart");

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to fetch cart"
        );
      }

      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart"
      );
    }
  }
);

// ======================================================
// ADD TO CART
// ======================================================

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, quantity = 1, product }, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // ==================================================
      // GUEST USER
      // ==================================================

      if (!token) {
        if (!product) {
          return rejectWithValue(
            "Product information is required for guest cart."
          );
        }

        dispatch(
          addGuestItem({
            product,
            quantity,
          })
        );

        return {
          guest: true,
        };
      }

      // ==================================================
      // LOGGED-IN USER
      // ==================================================

      const response = await API.post("/cart/add", {
        productId,
        quantity,
      });

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to add product"
        );
      }

      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add product"
      );
    }
  }
);

// ======================================================
// UPDATE QUANTITY
// ======================================================

export const updateCartQuantity = createAsyncThunk(
  "cart/updateCartQuantity",
  async ({ productId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // ==================================================
      // GUEST USER
      // ==================================================

      if (!token) {
        dispatch(
          updateGuestQuantity({
            productId,
            quantity,
          })
        );

        return {
          guest: true,
        };
      }

      // ==================================================
      // LOGGED-IN USER
      // ==================================================

      const response = await API.put(
        `/cart/update/${productId}`,
        {
          quantity,
        }
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to update quantity"
        );
      }

      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to update cart quantity"
      );
    }
  }
);

// ======================================================
// REMOVE FROM CART
// ======================================================

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // ==================================================
      // GUEST USER
      // ==================================================

      if (!token) {
        dispatch(removeGuestItem(productId));

        return {
          guest: true,
        };
      }

      // ==================================================
      // LOGGED-IN USER
      // ==================================================

      const response = await API.delete(
        `/cart/remove/${productId}`
      );

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to remove product"
        );
      }

      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to remove product"
      );
    }
  }
);

// ======================================================
// CLEAR CART
// ======================================================

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");

      // ==================================================
      // GUEST USER
      // ==================================================

      if (!token) {
        dispatch(clearGuestCart());

        return {
          guest: true,
        };
      }

      // ==================================================
      // LOGGED-IN USER
      // ==================================================

      const response = await API.delete("/cart/clear");

      if (!response.data?.success) {
        return rejectWithValue(
          response.data?.message || "Failed to clear cart"
        );
      }

      return response.data.cart;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to clear cart"
      );
    }
  }
);

// ======================================================
// INITIAL STATE
// ======================================================

const initialState = {
  cart: null,

  // This contains both guest and logged-in cart items
  items: [],

  loading: false,
  error: null,
  success: false,
};

// ======================================================
// SLICE
// ======================================================

const cartSlice = createSlice({
  name: "cart",

  initialState,

  reducers: {
    // ==================================================
    // ADD GUEST ITEM
    // ==================================================

    addGuestItem: (state, action) => {
      const {
        product,
        quantity = 1,
      } = action.payload;

      if (!product?._id) {
        return;
      }

      const existingItem = state.items.find(
        (item) =>
          item.product?._id?.toString() ===
          product._id.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          product,
          quantity,
        });
      }

      state.success = true;
      state.error = null;
    },

    // ==================================================
    // UPDATE GUEST QUANTITY
    // ==================================================

    updateGuestQuantity: (state, action) => {
      const {
        productId,
        quantity,
      } = action.payload;

      const item = state.items.find(
        (item) =>
          item.product?._id?.toString() ===
          productId.toString()
      );

      if (!item) {
        return;
      }

      if (quantity <= 0) {
        state.items = state.items.filter(
          (item) =>
            item.product?._id?.toString() !==
            productId.toString()
        );
      } else {
        item.quantity = quantity;
      }

      state.success = true;
    },

    // ==================================================
    // REMOVE GUEST ITEM
    // ==================================================

    removeGuestItem: (state, action) => {
      const productId = action.payload;

      state.items = state.items.filter(
        (item) =>
          item.product?._id?.toString() !==
          productId.toString()
      );

      state.success = true;
    },

    // ==================================================
    // CLEAR GUEST CART
    // ==================================================

    clearGuestCart: (state) => {
      state.items = [];
      state.cart = null;
      state.error = null;
      state.success = true;
    },

    // ==================================================
    // CLEAR CART STATE
    // ==================================================

    clearCartState: (state) => {
      state.cart = null;
      state.items = [];
      state.error = null;
      state.success = false;
    },

    // ==================================================
    // CLEAR ERROR
    // ==================================================

    clearCartError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    // ==================================================
    // FETCH CART
    // ==================================================

    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;

        state.cart = action.payload;

        state.items =
          action.payload?.items || [];

        state.success = true;
      })

      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;

        state.success = false;
      });

    // ==================================================
    // ADD TO CART
    // ==================================================

    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;

        // Guest cart was already updated
        // inside addGuestItem.
        if (action.payload?.guest) {
          state.success = true;
          return;
        }

        // Logged-in cart
        state.cart = action.payload;

        state.items =
          action.payload?.items || [];

        state.success = true;
      })

      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;

        state.success = false;
      });

    // ==================================================
    // UPDATE QUANTITY
    // ==================================================

    builder
      .addCase(updateCartQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        updateCartQuantity.fulfilled,
        (state, action) => {
          state.loading = false;

          // Guest cart already updated
          if (action.payload?.guest) {
            state.success = true;
            return;
          }

          state.cart = action.payload;

          state.items =
            action.payload?.items || [];

          state.success = true;
        }
      )

      .addCase(
        updateCartQuantity.rejected,
        (state, action) => {
          state.loading = false;

          state.error = action.payload;

          state.success = false;
        }
      );

    // ==================================================
    // REMOVE FROM CART
    // ==================================================

    builder
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        removeFromCart.fulfilled,
        (state, action) => {
          state.loading = false;

          // Guest cart already updated
          if (action.payload?.guest) {
            state.success = true;
            return;
          }

          state.cart = action.payload;

          state.items =
            action.payload?.items || [];

          state.success = true;
        }
      )

      .addCase(
        removeFromCart.rejected,
        (state, action) => {
          state.loading = false;

          state.error = action.payload;

          state.success = false;
        }
      );

    // ==================================================
    // CLEAR CART
    // ==================================================

    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;

        // Guest cart already cleared
        if (action.payload?.guest) {
          state.cart = null;
          state.items = [];
          state.success = true;
          return;
        }

        state.cart = action.payload;

        state.items =
          action.payload?.items || [];

        state.success = true;
      })

      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;

        state.error = action.payload;

        state.success = false;
      });
  },
});

// ======================================================
// EXPORT ACTIONS
// ======================================================

export const {
  addGuestItem,
  updateGuestQuantity,
  removeGuestItem,
  clearGuestCart,
  clearCartState,
  clearCartError,
} = cartSlice.actions;

export default cartSlice.reducer;