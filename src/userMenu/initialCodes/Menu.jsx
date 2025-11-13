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
import { pageStyle } from "../../data/styles";
import categoryPng from "../data/images/categoryPng.png";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { theamOrange } from "../../data/contents/items";
import FooterTab from "../FooterTab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SnackbarCompo from "../../components/SnackbarCompo";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useNavigate } from "react-router-dom";
import VegIndicatorComp from "../../components/VegIndicatorComp";
import { fetchCategoriesById } from "../../services/api";
import HeaderPage from "../HeaderPage";

const Menu = (data) => {
  const [allItems, setallItems] = useState([]);
  const [categoriesFetched, setCategoriesFetched] = useState([]);
  const [tableID, settableID] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Filters");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);
  const [shortModal, setShortModal] = useState(false);

  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");
  const [loading, setLoading] = useState(false);

  const [orderNote, setOrderNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState({});

  // add near your other useStates
  const [currentOrder, setCurrentOrder] = useState({
    items: [],
    subtotal: 0,
    createdAt: null,
  });

  // 👉 Load orderingList from ONLY 'dishs'
  const [orderingList, setOrderingList] = useState(() => {
    try {
      const raw = localStorage.getItem("dishs");
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return arr.map((it) => ({
        id: it.id,
        name: it.name ?? "",
        price: it.price ?? 0,
        qty: it.qty ?? 1,
        type: it.type ?? "vegan",
      }));
    } catch {
      return [];
    }
  });

  const [itemNotes, setItemNotes] = useState({});

  // 👉 Quantities map only from 'dishs'
  const [quantities, setQuantities] = useState(() => {
    try {
      const raw = localStorage.getItem("dishs");
      if (!raw) return {};
      const arr = JSON.parse(raw);
      return arr.reduce((acc, item) => {
        acc[item.id] = item.qty ?? 1;
        return acc;
      }, {});
    } catch {
      return {};
    }
  });

  const navigate = useNavigate();

  // if data is injected, store it to localStorage for fetchers
  useEffect(() => {
    // 🐞 fix length typo
    // console.log(data.data.data);
    
    if (Array.isArray(data?.data?.data?.items) && data?.data?.data?.items.length >= 1) {
      localStorage.setItem("menubyloc", JSON.stringify(data.data.data.items));
      localStorage.setItem("locresid", data?.data?.data?.table?.table_number);
    }
  }, [data]);

  useEffect(() => {
    const locid = localStorage.getItem("locresid");
    settableID(locid);
    fetchCatigories();
    fetchMenu();
    try {
      const raw = localStorage.getItem("dishs");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setOrderingList(
        parsed.map((it) => ({
          id: it.id,
          name: it.name ?? "",
          price: it.price ?? 0,
          qty: it.qty ?? 1,
          type: it.type ?? "vegan",
        }))
      );
      const qtyMap = parsed.reduce((acc, it) => {
        acc[String(it.id)] = it.qty ?? 1;
        return acc;
      }, {});
      setQuantities(qtyMap);
    } catch (e) {
      console.error("init orderingList error", e);
    }
    setCurrentOrder(loadCurrentOrder());
  }, []);

  const fetchCatigories = async () => {
    try {
      const locid = localStorage.getItem("locresid");
      const res = await fetchCategoriesById(locid);
      // console.log(res.data.data);
      setCategoriesFetched(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchMenu = async () => {
    try {
      const menubyloc = JSON.parse(localStorage.getItem("menubyloc")) || [];
      const normalized = menubyloc.map((item) => ({
        id: item.item_id ?? item.id,
        name: item.name,
        price: Number(item.price) || 0,
        type:
          item.item_type === "non_veg"
            ? "nonveg"
            : item.item_type === "vegan"
            ? "vegan"
            : item.item_type,
        category: item.MenuCategory?.name || "Others",
        description:
          item.description ||
          item.short_description ||
          "No description provided.",
        raw: item,
      }));
      setallItems(normalized);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // tiny helpers
  const loadCurrentOrder = () => {
    try {
      const raw = localStorage.getItem("currentOrderData");
      if (!raw) return { items: [], subtotal: 0, createdAt: null };
      const parsed = JSON.parse(raw);
      // handle accidental [] shape
      if (!parsed || Array.isArray(parsed) || !Array.isArray(parsed.items)) {
        return { items: [], subtotal: 0, createdAt: null };
      }
      return parsed;
    } catch {
      return { items: [], subtotal: 0, createdAt: null };
    }
  };

  const saveCurrentOrder = (data) => {
    localStorage.setItem("currentOrderData", JSON.stringify(data));
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbarOpen(false);
    // setLoading(false);
  };

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // const toggleItemNoteInput = (id) =>
  //   setShowNoteInput((p) => ({ ...p, [id]: !p[id] }));

  // const handleItemNoteChange = (id, value) =>
  //   setItemNotes((p) => ({ ...p, [id]: value }));

  // derived list
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
      list = [...list].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filter === "PriceDesc") {
      list = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [allItems, search, filter, selectedCategory]);

  useEffect(() => {
    if (filteredItems.length > 0) {
      const firstCat =
        filteredItems[0].category ||
        filteredItems[0].MenuCategory?.name ||
        "Others";
      setExpandedCategories([firstCat]);
    } else {
      setExpandedCategories([]);
    }
  }, [filteredItems]);

  const groupedItems = useMemo(() => {
    const groups = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  const toggleDescription = (id) => {
    setExpandedItem((prev) => (prev === id ? null : id));
  };

  // ✅ save ONLY 'dishs'
  const saveDishs = (qtyMap) => {
    try {
      const arr = Object.keys(qtyMap).map((id) => {
        const it = (allItems || []).find((x) => String(x.id) === String(id));
        return it
          ? {
              id: it.id,
              name: it.name,
              price: it.price,
              qty: qtyMap[id],
              type: it.type,
            }
          : { id, qty: qtyMap[id] }; // fallback
      });
      setOrderingList(arr);
      localStorage.setItem("dishs", JSON.stringify(arr));
    } catch (e) {
      console.error("saveDishs error", e);
    }
  };

  // keep storage in sync
  useEffect(() => {
    saveDishs(quantities);
  }, [quantities]); // eslint-disable-line react-hooks/exhaustive-deps

  const increment = (id) => {
    setQuantities((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      saveDishs(next);
      return next;
    });
  };

  const decrement = (id) => {
    setQuantities((prev) => {
      const current = prev[id] || 0;
      if (current <= 1) {
        const { [id]: _, ...rest } = prev;
        saveDishs(rest);
        return rest;
      }
      const next = { ...prev, [id]: current - 1 };
      saveDishs(next);
      return next;
    });
  };

  const totalItems = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  );

  const viewClick = () => {
    if (totalItems > 0) {
      setShortModal(true);
    } else {
      setsnackbarContent("Cart is empty");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    }
  };

  // 🧮 depend on allItems too (used in reducer)
  const subtotal = useMemo(() => {
    return Object.keys(quantities).reduce((sum, id) => {
      const it = allItems.find((x) => String(x.id) === String(id));
      const qty = quantities[id] || 0;
      return sum + (it ? it.price * qty : 0);
    }, 0);
  }, [quantities, allItems]);

  // const existingIds = useMemo(
  //   () => new Set((currentOrder.items || []).map((i) => String(i.id))),
  //   [currentOrder]
  // );

  const placeOrderHandler = () => {
    setLoading(true);

    const newItems = (orderingList || []).map((it) => {
      const qty = (quantities && quantities[it.id]) ?? it.qty ?? 1;
      return {
        id: it.id,
        name: it.name,
        price: it.price,
        qty,
        type: it.type,
        note: (itemNotes && itemNotes[it.id]) || "",
      };
    });

    // read existing order (object or empty)
    const existing = loadCurrentOrder();
    const nowISO = new Date().toISOString();

    let updated;
    if (!existing.items || existing.items.length === 0) {
      // create new order
      updated = {
        items: newItems,
        orderNote: orderNote || "",
        subtotal: subtotal, // first batch total
        createdAt: nowISO,
        updatedAt: nowISO,
      };
    } else {
      // append to existing (do not merge)
      updated = {
        ...existing,
        items: [...existing.items, ...newItems],
        // accumulate subtotal across batches
        subtotal: Number(existing.subtotal || 0) + Number(subtotal || 0),
        // you may choose to keep original orderNote or append
        orderNote: existing.orderNote ?? "",
        updatedAt: nowISO,
      };
    }

    try {
      saveCurrentOrder(updated);
      setCurrentOrder(updated);
      setsnackbarContent("Order Placed Successfully");
      setSnackbarMode("success");
      setSuccessSnackbarOpen(true);
      setLoading(false);
      setShortModal(false);
      clearCart();
      navigate("/my_order");
    } catch (e) {
      setsnackbarContent("Unable to Place order");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
      setLoading(false);
    }
  };

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
                    <Typography sx={{color:"grey"}}>{it.name}</Typography>
                  </Box>
                  {/* read-only qty and line total */}
                  <Box sx={{ textAlign: "right" }}>
                    <Typography sx={{ fontSize: "12px", color:"grey" }}>
                      Qty: {it.qty}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", fontWeight: "500pt", color:"grey" }}>
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

        {/* 2) Current cart (editable) */}
        <Box sx={{ mt: 1 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>New Order</Typography>
          {orderingList.map((it) => (
            <Box key={it.id} sx={{ p: 1 }}>
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
                  <Typography>{it.name}</Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {/* controls ALWAYS enabled for cart items, even if same id exists in current order */}
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

                  {/* line total */}
                  {(() => {
                    const qty =
                      (quantities && quantities[it.id]) ?? it.qty ?? 1;
                    return (
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: "500pt",
                          width: "100%",
                          textAlign: "end",
                        }}
                      >
                        ₹ {(it.price * qty).toFixed(2)}
                      </Typography>
                    );
                  })()}
                </Box>
              </Box>

              {/* Notes for cart items only */}
              {!showNoteInput[it.id] ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={() =>
                    setShowNoteInput((p) => ({ ...p, [it.id]: true }))
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
                  value={itemNotes[it.id] || ""}
                  onChange={(e) =>
                    setItemNotes((p) => ({ ...p, [it.id]: e.target.value }))
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
            disabled={loading}
            onClick={() => placeOrderHandler()}
          >
            Place Order
          </Button>
        </Box>
      </Box>
    </Modal>
  );

  const clearCart = () => {
    setQuantities({});
    localStorage.setItem("dishs", JSON.stringify([]));
    // Optional: clean up legacy key if it ever existed
    // localStorage.removeItem("dishs_full");
  };

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

      {/* Mobile View */}
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

            {/* Search + Filter Row */}
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
                {categoriesFetched.map((cat) => {
                  const active = selectedCategory === cat.name;
                  return (
                    <Box
                      sx={{
                        borderBottom: active
                          ? `3px solid ${theamOrange}`
                          : "none",
                        pb: 0.5,
                      }}
                      key={cat.cate_id}
                    >
                      <Box
                        onClick={() => {
                          setSelectedCategory(active ? null : cat.name);
                          setExpandedCategories([cat.name]);
                        }}
                        sx={{
                          width: 60,
                          cursor: "pointer",
                          textAlign: "center",
                          p: 1,
                          borderRadius: 2,
                          border: active
                            ? `1px solid ${theamOrange}`
                            : "1px solid rgba(0,0,0,0.2)",
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
                            alt={cat.name}
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
                          {cat.name}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>

            <Divider sx={{ my: 1 }} />

            {/* Items List */}
            <Box sx={{ px: 1, pb: 1 }}>
              {Object.keys(groupedItems).map((cat) => {
                const items = groupedItems[cat];
                const isOpen = expandedCategories.includes(cat);

                return (
                  <Box key={cat} sx={{ mb: 2 }}>
                    {/* Category Header */}
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

                    {/* Items */}
                    {isOpen && (
                      <Stack>
                        {items.map((it, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              p: 1,
                              background: "#fff",
                              boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                              borderBottom:
                                index === items.length - 1
                                  ? "none"
                                  : "1px dashed grey",
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

                            {/* Add / Remove Button */}
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
          <Box p={totalItems > 0 ? "9vh" : "5.5vh"} backgroundColor="#fff9f8" />
        </Box>

        {/* Floating cart summary */}
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
              onClick={() => viewClick()}
              sx={{ textTransform: "none" }}
            >
              View Cart
            </Button>
            <IconButton
              onClick={() => clearCart()}
              size="small"
              sx={{ bgcolor: "white", color: "black" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
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
export default Menu;
