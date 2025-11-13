// src/pages/UserMenu.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  Divider,
  Modal,
  IconButton,
} from "@mui/material";
import { pageStyle } from "../data/styles";
import categoryPng from "../data/images/categoryPng.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FooterTab from "./FooterTab";
import HeaderPage from "./HeaderPage";
import SnackbarCompo from "../components/SnackbarCompo";
import VegIndicatorComp from "../components/VegIndicatorComp";
import { theamOrange } from "../data/contents/items";

// ✅ Your API helpers (adjust paths as needed)
import {
  fetchQRStatsByTableId,
  addToCart,
  clearCart,
  removeFromCart,
  createOrder,
  fetchTodayOrders,
} from "../services/api";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  // ────────────────────────────
  // 0) Base UI state
  // ────────────────────────────
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [tableID, settableID] = useState(0);
  const tableData = useMemo(
    () => JSON.parse(localStorage.getItem("resloctab") || "{}"),
    []
  );

  // ────────────────────────────
  // 1) Menu + Categories + Search/Filter
  // ────────────────────────────
  const [allItems, setAllItems] = useState([]);
  // store categories as array<string>
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filters");

  // ────────────────────────────
  // 2) Server cart + local quantities
  // ────────────────────────────
  const [serverCart, setServerCart] = useState([]);
  // quantities from serverCart (id => qty)
  const [quantities, setQuantities] = useState({});

  // ────────────────────────────
  // 3) Modal (cart view)
  // ────────────────────────────
  const [shortModal, setShortModal] = useState(false);

  // ────────────────────────────
  // 4) Notes (kept in memory until Place Order)
  // ────────────────────────────
  const [itemNotes, setItemNotes] = useState({});
  const [showNoteInput, setShowNoteInput] = useState({});
  const [orderNote, setOrderNote] = useState("");

  // ────────────────────────────
  // 5) Existing placed order (local) – optional continuity
  // ────────────────────────────
  const [currentOrder, setCurrentOrder] = useState({
    items: [],
    subtotal: 0,
    createdAt: null,
    order_id: null,
    orderNote: "",
  });

  // Snackbars
  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");

  const navigate = useNavigate();

  // ────────────────────────────
  // Helpers to load/save the “placed order draft” locally
  // ────────────────────────────
  const loadCurrentOrder = async () => {
    try {
      const res = await fetchTodayOrders({
        loc_id: tableData.loc_id,
        table_id: tableData.table_id,
      });

      const payload = res?.data?.data;
      // console.log(payload);

      if (!payload || (Array.isArray(payload) && payload.length === 0)) {
        return {
          items: [],
          subtotal: 0,
          createdAt: null,
          order_id: null,
          orderNote: "",
        };
      }

      // your corrected shape: array with a single order object at 0
      const order = Array.isArray(payload) ? payload[0] : payload;

      // OrderItems is an array per your correction
      const itemsArr = Array.isArray(order?.OrderItems) ? order.OrderItems : [];

      const items = itemsArr.map((oi, idx) => {
        const menu = oi?.MenuItem ?? {};
        const qty = Number(oi?.quantity ?? 0);
        const unit = Number(oi?.unit_price ?? 0);
        const total = Number(oi?.total_price ?? qty * unit);
        const rawType = menu?.item_type;

        const type =
          rawType === "non_veg"
            ? "nonveg"
            : rawType === "vegan"
            ? "vegan"
            : rawType || "veg";

        return {
          // item_id might be missing in your example (Water Bottle) — keep best-effort
          item_id: menu?.item_id ?? oi?.item_id ?? null,
          name: menu?.name ?? "Item",
          type,
          qty,
          price: unit, // your UI uses price * qty
          note: oi?.special_instructions ?? "",
          // (optional) stable key if you ever need it: `${menu?.item_id ?? "x"}-${idx}`
        };
      });

      return {
        items,
        subtotal: Number(order?.subtotal ?? 0), // "524.98" -> 524.98
        createdAt: order?.created_at ?? null, // "2025-11-12T10:04:00.000Z"
        order_id: order?.order_id ?? null, // 9
        orderNote: order?.internal_notes ?? "", // "fast"
      };
    } catch (e) {
      console.error("loadCurrentOrder error", e);
      return {
        items: [],
        subtotal: 0,
        createdAt: null,
        order_id: null,
        orderNote: "",
      };
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbarOpen(false);
  };

  // ────────────────────────────
  // Initial load: table + menu + cart + existing order
  // ────────────────────────────
  useEffect(() => {
    if (tableData?.table_number) {
      settableID(Number(tableData.table_number));
    } else {
      navigate("/");
    }
    (async () => {
      await fetchMenuAndCart();
      const order = await loadCurrentOrder();
      setCurrentOrder(order);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ────────────────────────────
  // Real-time cart polling (multi-device sync)
  // ────────────────────────────
  useEffect(() => {
    if (!tableData?.table_id) return;

    const POLL_MS = 10000;
    let timerId = null;
    let isRunning = false;

    const tick = async () => {
      // guard: don't overlap runs
      if (isRunning) return;
      // guard: don't fight user actions or hidden tab/offline
      if (
        mutating ||
        document.hidden ||
        (typeof navigator !== "undefined" && !navigator.onLine)
      )
        return;

      try {
        isRunning = true;
        // Only updating the cart is enough for “live” feel.
        // If you also expect new items/categories to be added by the server in real time,
        // call fetchMenuAndCart() instead of refreshCart().
        await refreshCart();
      } catch (e) {
        console.error("poll tick error:", e);
      } finally {
        isRunning = false;
      }
    };

    // run once immediately when mounted/ready
    tick();

    // set up interval
    timerId = setInterval(tick, POLL_MS);

    // refresh as soon as tab becomes active again
    const onVis = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    // optional: refresh when back online
    const onOnline = () => tick();
    window.addEventListener("online", onOnline);

    return () => {
      clearInterval(timerId);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, [tableData?.table_id, mutating]);

  // ────────────────────────────
  // Fetch items + cart in one go
  // ────────────────────────────
  const fetchMenuAndCart = async () => {
    try {
      setLoading(true);
      const res = await fetchQRStatsByTableId(tableData.table_id);
      const payload = res?.data?.data || {};
      const items = Array.isArray(payload.items) ? payload.items : [];
      const cartItems = Array.isArray(payload.cartItems)
        ? payload.cartItems
        : [];
      // console.log(cartItems);

      // Normalize items
      const normalizedItems = items.map((it) => ({
        id: it.item_id ?? it.id,
        loc_id: it.loc_id,
        name: it.name,
        price: Number(it.price) || 0,
        type:
          it.item_type === "non_veg"
            ? "nonveg"
            : it.item_type === "vegan"
            ? "vegan"
            : it.item_type,
        category: it.MenuCategory?.name || it.category || "Others",
        description:
          it.description || it.short_description || "No description provided.",
      }));
      setAllItems(normalizedItems);

      // Build categories from items
      const uniqueCats = [
        ...new Set(normalizedItems.map((i) => i.category || "Others")),
      ];
      setCategories(uniqueCats);

      // Normalize server cart
      const normalizedCart = cartItems
        .map((ci) => {
          const item = normalizedItems.find(
            (x) => Number(x.id) === Number(ci.item_id)
          );
          if (!item) return null;
          return {
            item_id: item.id,
            loc_id: item.loc_id,
            table_id: tableData.table_id,
            name: item.name,
            type: item.type,
            unit_price: item.price,
            qty: Number(ci.quantity ?? ci.qty ?? 1) || 1,
          };
        })
        .filter(Boolean);
      // console.log(normalizedCart);

      setServerCart(normalizedCart);

      // quantities (for quick UI lookups)
      const q = {};
      normalizedCart.forEach(({ item_id, qty }) => (q[item_id] = qty));
      setQuantities(q);

      // Open first category by default
      if (uniqueCats.length) setExpandedCategories([uniqueCats[0]]);
      else setExpandedCategories([]);
    } catch (err) {
      console.error("fetchMenuAndCart error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    try {
      const res = await fetchQRStatsByTableId(tableData.table_id);
      const payload = res?.data?.data || {};
      const items = Array.isArray(payload.items) ? payload.items : [];
      const cartItems = Array.isArray(payload.cartItems)
        ? payload.cartItems
        : [];

      const normalizedItems = items.map((it) => ({
        id: it.item_id ?? it.id,
        loc_id: it.loc_id,
        name: it.name,
        price: Number(it.price) || 0,
        type:
          it.item_type === "non_veg"
            ? "nonveg"
            : it.item_type === "vegan"
            ? "vegan"
            : it.item_type,
        category: it.MenuCategory?.name || it.category || "Others",
        description:
          it.description || it.short_description || "No description provided.",
      }));

      const normalizedCart = cartItems
        .map((ci) => {
          const item = normalizedItems.find(
            (x) => Number(x.id) === Number(ci.item_id)
          );
          if (!item) return null;
          return {
            item_id: item.id,
            loc_id: item.loc_id,
            table_id: tableData.table_id,
            name: item.name,
            type: item.type,
            unit_price: item.price,
            qty: Number(ci.quantity ?? ci.qty ?? 1) || 1,
          };
        })
        .filter(Boolean);

      setServerCart(normalizedCart);
      const q = {};
      normalizedCart.forEach(({ item_id, qty }) => (q[item_id] = qty));
      setQuantities(q);
    } catch (e) {
      console.error("refreshCart error", e);
    }
  };

  // ────────────────────────────
  // Cart +/- with backend
  // ────────────────────────────
  const changeQty = async (item, nextQty) => {
    setMutating(true);

    // optimistic update
    setQuantities((prev) => {
      const c = { ...prev };
      if (nextQty <= 0) delete c[item.id];
      else c[item.id] = nextQty;
      return c;
    });

    try {
      const cur = quantities[item.id] || 0;

      // Case 1: First time adding (cur=0, next>0) -> use addToCart
      if (cur === 0 && nextQty > 0) {
        await addToCart({
          loc_id: item.loc_id,
          table_id: tableData.table_id,
          item_id: item.id,
          quantity: nextQty,
          unit_price: item.price,
          variant_id: 1,
        });
      }
      // Case 2: Decrementing (next < cur) -> use removeFromCart
      else if (nextQty < cur) {
        await removeFromCart({
          loc_id: item.loc_id,
          table_id: tableData.table_id,
          item_id: item.id,
        });
      }
      // Case 3: Incrementing (next > cur) -> use addToCart
      else if (nextQty > cur) {
        await addToCart({
          loc_id: item.loc_id,
          table_id: tableData.table_id,
          item_id: item.id,
          quantity: 1,
          unit_price: item.price,
          variant_id: 1,
        });
      }

      await refreshCart();
    } catch (e) {
      console.error("changeQty error", e);
      await refreshCart(); // rollback
    } finally {
      setMutating(false);
    }
  };

  const increment = (id) => {
    const item = allItems.find((x) => Number(x.id) === Number(id));
    if (!item) return;
    const cur = quantities[id] || 0;
    changeQty(item, cur + 1);
  };

  const decrement = (id) => {
    const item = allItems.find((x) => Number(x.id) === Number(id));
    if (!item) return;
    const cur = quantities[id] || 0;
    if (cur > 1) {
      changeQty(item, cur - 1);
    } else if (cur === 1) {
      changeQty(item, 0); // triggers removeFromCart
    }
  };

  // ────────────────────────────
  // Derived: filtered items, grouped by category
  // ────────────────────────────
  const filteredItems = useMemo(() => {
    let list = [...allItems];
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter((it) => it.name?.toLowerCase().includes(q));
    } else if (selectedCategory) {
      list = list.filter((it) => it.category === selectedCategory);
    }

    if (filter === "vegan") {
      list = list.filter((it) => it.type === "vegan");
    } else if (filter === "NonVeg") {
      list = list.filter((it) => it.type === "nonveg" || it.type === "non_veg");
    } else if (filter === "PriceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filter === "PriceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [allItems, search, filter, selectedCategory]);

  useEffect(() => {
    if (!filteredItems.length) {
      setExpandedCategories([]);
      return;
    }
    // ensure first visible category is open
    const firstCat = filteredItems[0]?.category || "Others";
    setExpandedCategories((prev) =>
      prev.includes(firstCat) ? prev : [firstCat]
    );
  }, [filteredItems]);

  const groupedItems = useMemo(() => {
    const groups = {};
    for (const item of filteredItems) {
      const cat = item.category || "Others";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [filteredItems]);

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleDescription = (id) => {
    setExpandedItem((prev) => (prev === id ? null : id));
  };

  // ────────────────────────────
  // Floating cart + modal
  // ────────────────────────────
  const totalItems = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  );

  useEffect(() => {
    if (shortModal && totalItems === 0) {
      setShortModal(false);
      setsnackbarContent("Cart is empty");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    }
  }, [shortModal, totalItems]);

  const subtotal = useMemo(
    () =>
      serverCart.reduce(
        (sum, it) => sum + it.unit_price * (quantities[it.item_id] || it.qty),
        0
      ),
    [serverCart, quantities]
  );

  const viewClick = () => {
    if (totalItems > 0) setShortModal(true);
    else {
      setsnackbarContent("Cart is empty");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    }
  };

  // ────────────────────────────
  // Clear entire cart
  // ────────────────────────────
  const handleClearCart = async () => {
    try {
      setMutating(true);
      await clearCart({
        loc_id: tableData.loc_id,
        table_id: tableData.table_id,
      });

      setServerCart([]);
      setQuantities({});
      setItemNotes({});
      setOrderNote("");

      setShortModal(false); // <— close right away

      setsnackbarContent("Cart cleared");
      setSnackbarMode("success");
      setSuccessSnackbarOpen(true);
    } catch (e) {
      console.error("handleClearCart error", e);
      setsnackbarContent("Unable to clear cart");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    } finally {
      setMutating(false);
    }
  };

  // ────────────────────────────
  // Place Order → keep notes in local until then
  // ────────────────────────────
  const createOrderHandler = async () => {
    try {
      if (!serverCart.length) {
        setsnackbarContent("Cart is empty");
        setSnackbarMode("error");
        setSuccessSnackbarOpen(true);
        return;
      }

      // Prefer state; fetch only if empty
      const existing = (currentOrder?.items?.length
        ? currentOrder
        : await loadCurrentOrder()) || {
        items: [],
        subtotal: 0,
        order_id: null,
        orderNote: "",
      };

      // Flatten server cart -> use latest UI qty if present
      const newItems = serverCart.map((ci) => {
        const qty = Number(quantities[ci.item_id] ?? ci.qty ?? 1);
        const unit = Number(ci.unit_price ?? 0);
        return {
          item_id: ci.item_id,
          loc_id: ci.loc_id,
          table_id: ci.table_id,
          unit_price: unit,
          quantity: qty,
          special_instructions: itemNotes[ci.item_id] || "",
          total_price: Number((qty * unit).toFixed(2)),
          variant_id: 1,
        };
      });

      const isNewOrder = !existing.items?.length;

      const updated = isNewOrder
        ? {
            items: newItems,
            res_id: tableData.res_id,
            loc_id: tableData.loc_id,
            table_id: tableData.table_id,
            order_type: "dine_in",
            priority: "normal",
            subtotal: Number(subtotal.toFixed(2)),
            discount_amount: 0,
            tax_rate: 0,
            tax_amount: 0,
            gratuity: 0,
            total_amount: 0,
            estimated_preparation_time: 25,
            internal_notes: orderNote || "",
            order_id: 0,
            is_existing_order: false,
          }
        : {
            // ...existing,
            items: newItems,
            res_id: tableData.res_id,
            loc_id: tableData.loc_id,
            table_id: tableData.table_id,
            order_type: "dine_in",
            priority: "normal",
            subtotal: Number(existing.subtotal) + Number(subtotal),
            discount_amount: 0,
            tax_rate: 0,
            tax_amount: 0,
            gratuity: 0,
            total_amount: 0,
            estimated_preparation_time: 25,
            internal_notes: orderNote || existing.orderNote || "",
            order_id: existing.order_id, // ← use the same source
            is_existing_order: true,
          };

      await createOrder(updated);

      // Refresh local state to match server (good after appends)
      const fresh = await loadCurrentOrder();
      setCurrentOrder(fresh);

      // Clear local cart UI
      setItemNotes({});
      setOrderNote("");
      await refreshCart();

      setsnackbarContent("Order Placed Successfully");
      setSnackbarMode("success");
      setSuccessSnackbarOpen(true);
      setShortModal(false);
      navigate("/my_order");
    } catch (e) {
      console.error("placeOrderHandler error", e);
      setsnackbarContent("Unable to Place order");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    }
  };

  // ────────────────────────────
  // Modal render
  // ────────────────────────────
  const renderModal = () => (
    <Modal
      open={shortModal}
      onClose={() => setShortModal(false)}
      sx={{ display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <Box
        sx={{
          width: "100%",
          bgcolor: "#fff",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          p: 2,
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography sx={{ fontWeight: "bold", mr: 1 }}>
            Your Cart Summary
          </Typography>
          <IconButton onClick={() => setShortModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* 1) Existing order (read-only) */}
        {(currentOrder.items || []).length > 0 && (
          <Box sx={{ mt: 1, mb: 2 }}>
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Already Ordered Items
            </Typography>

            {(currentOrder.items || []).map((it, idx) => (
              <Box key={`existing-${idx}`} sx={{ p: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "start",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VegIndicatorComp type={it.type} />
                    <Typography sx={{ color: "grey" }}>{it.name}</Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "12px", color: "grey" }}>
                      Qty: {it.qty}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "12px",
                        fontWeight: "500pt",
                        color: "grey",
                      }}
                    >
                      ₹{" "}
                      {(Number(it.price || 0) * Number(it.qty || 0)).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                {it.note ? (
                  <Typography
                    sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}
                  >
                    Note: {it.note}
                  </Typography>
                ) : null}
              </Box>
            ))}

            <Divider sx={{ my: 1 }} />
          </Box>
        )}

        {/* 2) Current server cart (editable) */}
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>New Order</Typography>
          {serverCart.map((ci) => (
            <Box key={ci.item_id} sx={{ p: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <VegIndicatorComp type={ci.type} />
                  <Typography>{ci.name}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {quantities[ci.item_id] ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: `1px solid ${theamOrange}`,
                        borderRadius: "4px",
                      }}
                    >
                      <Button
                        size="small"
                        disabled={mutating}
                        onClick={() => decrement(ci.item_id)}
                        sx={{ minWidth: 30, color: theamOrange }}
                      >
                        -
                      </Button>
                      <Typography sx={{ px: 1 }}>
                        {quantities[ci.item_id]}
                      </Typography>
                      <Button
                        size="small"
                        disabled={mutating}
                        onClick={() => increment(ci.item_id)}
                        sx={{ minWidth: 30, color: theamOrange }}
                      >
                        +
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={mutating}
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        borderColor: theamOrange,
                        color: theamOrange,
                      }}
                      onClick={() => increment(ci.item_id)}
                    >
                      + Add
                    </Button>
                  )}
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: "500pt",
                      width: "100%",
                      textAlign: "end",
                    }}
                  >
                    ₹{" "}
                    {(
                      ci.unit_price * (quantities[ci.item_id] || ci.qty)
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              {/* Item note (kept until Place Order) */}
              {!showNoteInput[ci.item_id] ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={() =>
                    setShowNoteInput((p) => ({ ...p, [ci.item_id]: true }))
                  }
                  sx={{
                    textTransform: "none",
                    color: "grey",
                    border: "none",
                    borderBottom: "2px dashed grey",
                    fontWeight: "bold",
                  }}
                >
                  Add Note
                </Button>
              ) : (
                <TextField
                  placeholder="Enter dish instructions..."
                  value={itemNotes[ci.item_id] || ""}
                  onChange={(e) =>
                    setItemNotes((p) => ({
                      ...p,
                      [ci.item_id]: e.target.value,
                    }))
                  }
                  fullWidth
                  size="small"
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                      "&.Mui-focused": { boxShadow: "0 0 5px rgba(0,0,0,0.2)" },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(0,0,0,0.12)",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ mr: 1, color: "grey" }}>
                        <DescriptionOutlinedIcon />
                      </Box>
                    ),
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ borderBottom: "2px dashed grey", my: 1 }} />
        <TextField
          placeholder="Enter a note for the entire order..."
          value={orderNote}
          onChange={(e) => setOrderNote(e.target.value)}
          sx={{
            my: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
              "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
              "&.Mui-focused": { boxShadow: "0 0 5px rgba(0,0,0,0.2)" },
              "&.Mui-focused fieldset": { borderColor: "rgba(0,0,0,0.12)" },
            },
          }}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <Box component="span" sx={{ mr: 1, color: "grey" }}>
                <DescriptionOutlinedIcon />
              </Box>
            ),
          }}
        />

        {/* Modal footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: theamOrange,
            p: 2,
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: "bold", color: "white", fontSize: 16 }}
            >
              ₹ {subtotal.toFixed(2)}
            </Typography>
            <Typography sx={{ color: "white", fontSize: "10px" }}>
              CART TOTAL
            </Typography>
          </Box>
          <Button
            variant="contained"
            sx={{
              color: theamOrange,
              bgcolor: "#fff",
              py: 1.5,
              textTransform: "none",
              fontWeight: "bold",
              "&:hover": { color: "#e67a24", bgcolor: "whitesmoke" },
            }}
            disabled={loading || mutating || totalItems === 0}
            onClick={() => createOrderHandler()}
          >
            Place Order
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  // ────────────────────────────
  // Render
  // ────────────────────────────
  return (
    <Box>
      {/* Large screen warning */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        Not compatible with large screens. Please use Mobile or smaller screen
        devices.
      </Box>

      {/* Mobile view */}
      <Box sx={{ width: "100vw", display: { xs: "flex", md: "none" } }}>
        <Box sx={pageStyle}>
          {/* Header */}
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 2,
              width: "100%",
              backgroundColor: "#fff9f8",
            }}
          >
            <HeaderPage tableID={tableID} viewClick={viewClick} />

            {/* Search + Filter */}
            <Box sx={{ px: 1, position: "sticky", top: 0, zIndex: 2, pb: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ bgcolor: "#fff" }}
              >
                <TextField
                  size="small"
                  placeholder="Search item"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    if (e.target.value.trim() !== "") setSelectedCategory(null);
                  }}
                  sx={{ flex: 1 }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ opacity: 0.6, mr: 1 }} />,
                  }}
                />

                <Select
                  size="small"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="Filters">Filters</MenuItem>
                  <MenuItem value="PriceAsc">Price: Low to High</MenuItem>
                  <MenuItem value="PriceDesc">Price: High to Low</MenuItem>
                  <MenuItem value="vegan">veg</MenuItem>
                  <MenuItem value="NonVeg">Non-Veg</MenuItem>
                </Select>
              </Stack>
            </Box>
          </Box>

          {/* Content */}
          <Box
            sx={{
              pt: "93px",
              height: "calc(100vh - 166px)",
              overflowY: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Categories (from items) */}
            <Box sx={{ mt: 1, px: 1 }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {categories.map((name) => {
                  const active = selectedCategory === name;
                  return (
                    <Box
                      key={name}
                      sx={{
                        borderBottom: active
                          ? `3px solid ${theamOrange}`
                          : "none",
                        pb: 0.5,
                      }}
                    >
                      <Box
                        onClick={() => {
                          setSelectedCategory(active ? null : name);
                          setExpandedCategories([name]);
                        }}
                        sx={{
                          width: 60,
                          cursor: "pointer",
                          textAlign: "center",
                          p: 1,
                          borderRadius: 2,
                          border: active
                            ? `1px solid ${theamOrange}`
                            : `1px solid rgba(0,0,0,0.2)`,
                          backgroundColor: active ? "#fff8f2" : "#fff",
                          mt: 1,
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            width: "70%",
                            height: "70%",
                            mx: "auto",
                          }}
                        >
                          {active && (
                            <CheckCircleIcon
                              sx={{
                                position: "absolute",
                                top: -18,
                                right: -28,
                                zIndex: 3,
                                color: theamOrange,
                                bgcolor: "#fff",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <img
                            src={categoryPng}
                            alt={name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "contain",
                            }}
                          />
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          width: "100%",
                          height: "30%",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: "bold",
                            color: active ? theamOrange : "black",
                            textAlign: "center",
                          }}
                        >
                          {name}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Items grouped by category */}
            <Box sx={{ px: 1, pb: 1 }}>
              {Object.keys(groupedItems).map((cat) => {
                const items = groupedItems[cat];
                const isOpen = expandedCategories.includes(cat);

                return (
                  <Box key={cat} sx={{ mb: 2 }}>
                    <Box
                      onClick={() => toggleCategory(cat)}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        p: 1,
                        background: "#fff",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        {cat} ({items.length})
                      </Typography>
                      {isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    <Divider />

                    {isOpen && (
                      <Stack>
                        {items.map((it) => (
                          <Box
                            key={it.id}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1,
                              background: "#fff",
                              boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                              borderBottom: "1px dashed grey",
                            }}
                          >
                            <Box>
                              <VegIndicatorComp type={it.type} />
                              <Typography sx={{ fontWeight: 600 }}>
                                {it.name}
                              </Typography>
                              <Typography>₹ {it.price}</Typography>

                              <Typography
                                sx={{ color: "text.secondary", fontSize: 13 }}
                              >
                                {expandedItem === it.id
                                  ? it.description
                                  : `${it.description.slice(0, 60)}${
                                      it.description.length > 60 ? "..." : ""
                                    }`}
                                {it.description.length > 60 && (
                                  <Button
                                    size="small"
                                    sx={{
                                      textTransform: "none",
                                      color: theamOrange,
                                      ml: 0.5,
                                    }}
                                    onClick={() => toggleDescription(it.id)}
                                  >
                                    {expandedItem === it.id
                                      ? "Read Less"
                                      : "Read More"}
                                  </Button>
                                )}
                              </Typography>
                            </Box>

                            {/* Add / Remove */}
                            {quantities[it.id] ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  border: `1px solid ${theamOrange}`,
                                  borderRadius: "4px",
                                }}
                              >
                                <Button
                                  size="small"
                                  disabled={mutating}
                                  onClick={() => decrement(it.id)}
                                  sx={{ minWidth: 30, color: theamOrange }}
                                >
                                  -
                                </Button>
                                <Typography sx={{ px: 1 }}>
                                  {quantities[it.id]}
                                </Typography>
                                <Button
                                  size="small"
                                  disabled={mutating}
                                  onClick={() => increment(it.id)}
                                  sx={{ minWidth: 30, color: theamOrange }}
                                >
                                  +
                                </Button>
                              </Box>
                            ) : (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={mutating}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: "none",
                                  borderColor: theamOrange,
                                  color: theamOrange,
                                }}
                                onClick={() => increment(it.id)}
                              >
                                + Add
                              </Button>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* spacer to keep FAB visible */}
          <Box p={totalItems > 0 ? "9vh" : "5.5vh"} backgroundColor="#fff9f8" />
        </Box>

        {/* 3) Floating cart summary */}
        <Box
          sx={{
            position: "fixed",
            bottom: "10vh",
            left: 0,
            right: 0,
            bgcolor: "#fee8db",
            color: theamOrange,
            py: 1.5,
            px: 2,
            mx: 2,
            borderRadius: 2,
            display: totalItems > 0 ? "flex" : "none",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <Typography sx={{ fontWeight: "bold" }}>
            {totalItems} {totalItems === 1 ? "item" : "items"} in cart
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              variant="contained"
              color="warning"
              onClick={viewClick}
              sx={{ textTransform: "none" }}
            >
              View Cart
            </Button>
            <IconButton
              onClick={() => handleClearCart()}
              size="small"
              sx={{ bgcolor: "white", color: "black" }}
              disabled={mutating}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            position: "fixed",
            zIndex: 1,
            bottom: 0,
            left: 0,
            width: "100%",
            height: "10vh",
            backgroundColor: "#fff",
          }}
        >
          <FooterTab />
        </Box>
      </Box>

      {/* Snackbar + Modal */}
      <SnackbarCompo
        successSnackbarOpen={successSnackbarOpen}
        handleSnackbarClose={handleSnackbarClose}
        snackbarContent={snackbarContent}
        snackbarMode={snackbarMode}
      />
      {renderModal()}
    </Box>
  );
};

export default UserMenu;
