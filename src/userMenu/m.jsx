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
import { theamOrange } from "../data/contents/items";
import FooterTab from "./FooterTab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ContactModal from "./ContactModal";
import SnackbarCompo from "../components/SnackbarCompo";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { useNavigate } from "react-router-dom";
import VegIndicatorComp from "../components/VegIndicatorComp";
import { fetchCategoriesById } from "../services/api";
import HeaderPage from "./HeaderPage";

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
  const [contactModal, setContactModal] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState({});
  const [orderingList, setOrderingList] = useState(() => {
    try {
      const rawFull = localStorage.getItem("dishs_full");
      const raw = rawFull ?? localStorage.getItem("dishs");
      if (!raw) return [];
      const arr = JSON.parse(raw);
      // normalise to full item objects (name/price/type may be empty until fetchMenu runs)
      return arr.map((it) => ({
        id: it.id,
        name: it.name ?? "",
        price: it.price ?? 0,
        qty: it.qty ?? 1,
        type: it.type ?? "vegan",
      }));
    } catch (e) {
      return [];
    }
  });

  const [itemNotes, setItemNotes] = useState(() => {
    try {
      return {};
    } catch (e) {
      return {};
    }
  });

  const [quantities, setQuantities] = useState(() => {
    try {
      const rawFull = localStorage.getItem("dishs_full");
      const raw = rawFull ?? localStorage.getItem("dishs");
      if (!raw) return {};
      const arr = JSON.parse(raw);
      // convert stored array (full or compact) -> map of id -> qty
      return arr.reduce((acc, item) => {
        acc[item.id] = item.qty ?? 1;
        return acc;
      }, {});
    } catch (e) {
      return {};
    }
  });

  const navigate = useNavigate();

  useEffect(() => {
    console.log(data?.data?.data);
    console.log(data?.data?.loc_id);
    if (data?.lenght >= 1) {
      localStorage.setItem("menubyloc", JSON.stringify(data?.data?.data));
      localStorage.setItem("locresid", data?.data?.loc_id);
    }
  }, [data]);

  useEffect(() => {
    const locid = localStorage.getItem("locresid");
    settableID(locid);
    fetchCatigories();
    fetchMenu();
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
      // console.log(menubyloc);

      // normalize here
      const normalized = menubyloc.map((item) => {
        return {
          // what the UI expects:
          id: item.item_id ?? item.id,
          name: item.name,
          price: Number(item.price) || 0,
          // normalize "vegan"/"nonveg"
          type:
            item.item_type === "non_veg"
              ? "nonveg"
              : item.item_type === "vegan"
              ? "vegan"
              : item.item_type,
          // THIS is the important part 👇
          category: item.MenuCategory?.name || "Others",
          description:
            item.description ||
            item.short_description ||
            "No description provided.",
          // keep the original too, in case needed
          raw: item,
        };
      });

      setallItems(normalized);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // console.log(expandedCategories);
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessSnackbarOpen(false);
    setLoading(false);
  };

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleItemNoteInput = (id) =>
    setShowNoteInput((p) => ({ ...p, [id]: !p[id] }));

  const handleItemNoteChange = (id, value) =>
    setItemNotes((p) => ({ ...p, [id]: value }));

  // derived list based on search/filter/category
  const filteredItems = useMemo(() => {
    let list = [...allItems];

    const q = search.trim().toLowerCase();

    // 1) search
    if (q) {
      list = list.filter((it) => it.name?.toLowerCase().includes(q));
    } else if (selectedCategory) {
      // 2) category
      list = list.filter((it) => it.category === selectedCategory);
    }

    // 3) filters
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
    // if we have items
    if (filteredItems.length > 0) {
      // pick the first item's category (works for your API too)
      const firstCat =
        filteredItems[0].category ||
        filteredItems[0].MenuCategory?.name ||
        "Others";

      setExpandedCategories([firstCat]);
    } else {
      setExpandedCategories([]);
    }
  }, [filteredItems]);

  // group items by category
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

  // helper to persist quantities as array of {id,name,price,qty}
  const saveDishs = (qtyMap) => {
    try {
      const arr = Object.keys(qtyMap).map((id) => {
        // try to find full metadata from the static items list
        const it = (allItems || []).find((x) => String(x.id) === String(id));
        return it
          ? {
              id: it.id,
              name: it.name,
              price: it.price,
              qty: qtyMap[id],
              type: it.type,
            }
          : // fallback: preserve id and qty so we don't lose data
            { id, qty: qtyMap[id] };
      });
      setOrderingList(arr);
      localStorage.setItem("dishs", JSON.stringify(arr));
      // also keep a "full" copy if we have full metadata (optional)
      const hasFull = arr.every((x) => x.name && x.price !== undefined);
      if (hasFull) localStorage.setItem("dishs_full", JSON.stringify(arr));
    } catch (e) {
      // ignore storage errors
      console.error("saveDishs error", e);
    }
  };

  useEffect(() => {
    try {
      const rawFull = localStorage.getItem("dishs_full");
      const raw = rawFull ?? localStorage.getItem("dishs");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      // normalize to orderingList shape and quantities map
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
      // debug
      // console.log("init orderingList from storage:", parsed);
    } catch (e) {
      console.error("init orderingList error", e);
    }
  }, []);

  // keep local storage in sync if quantities state changes externally
  useEffect(() => {
    saveDishs(quantities);
  }, [quantities]);

  const increment = (id) => {
    setQuantities((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      // saveDishs(next);  // optional here because useEffect will save, but safe to call
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

  // Add this computed value for total items
  const totalItems = useMemo(() => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  }, [quantities]);

  const viewClick = () => {
    if (totalItems > 0) {
      setShortModal(true);
      // const contact = localStorage.getItem("contactInfo");
      // if (contact) {
      //   // Existing user with contact info
      //   setName(JSON.parse(contact).name);
      //   setPhone(JSON.parse(contact).phone);
      // }
      // // Show contact modal for both new and existing users
      // setContactModal(true);
    } else {
      setsnackbarContent("Cart is empty");
      setSnackbarMode("error");
      setSuccessSnackbarOpen(true);
    }
  };

  const renderContactModal = () => (
    <ContactModal
      contactModal={contactModal}
      setContactModal={setContactModal}
      setShortModal={setShortModal}
      phone={phone}
      setPhone={setPhone}
      name={name}
      setName={setName}
      loading={loading}
      setLoading={setLoading}
      setSuccessSnackbarOpen={setSuccessSnackbarOpen}
      setsnackbarContent={setsnackbarContent}
      setSnackbarMode={setSnackbarMode}
    />
  );

  const subtotal = useMemo(() => {
    return Object.keys(quantities).reduce((sum, id) => {
      const it = allItems.find((x) => String(x.id) === String(id));
      const qty = quantities[id] || 0;
      return sum + (it ? it.price * qty : 0);
    }, 0);
  }, [quantities]);

  const placeOrderHandler = () => {
    setLoading(true);
    const items = (orderingList || []).map((it) => {
      const qty = (quantities && quantities[it.id]) ?? it.qty ?? 1;
      return {
        id: it.id,
        name: it.name,
        price: it.price,
        qty,
        type: it.type,
        note: itemNotes[it.id] || "",
      };
    });

    const currentOrderData = {
      items,
      orderNote: orderNote || "",
      subtotal: subtotal,
      createdAt: new Date().toISOString(),
    };

    // persist under key "currentOrderData"
    try {
      localStorage.setItem(
        "currentOrderData",
        JSON.stringify(currentOrderData)
      );
      // feedback + close
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

  // Add the modal component before the return statement
  const renderModal = () => (
    <Modal
      open={shortModal}
      onClose={() => setShortModal(false)}
      sx={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
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
            {/* {totalItems} {totalItems === 1 ? "item" : "items"} in cart */}
            Your Order Summary
          </Typography>
          <IconButton onClick={() => setShortModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Box sx={{ mt: 1 }}>
          {orderingList.map((it) => (
            <Box
              key={it.id}
              sx={{
                p: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "start",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {/* vegan marker + name */}
                  {it.type === "vegan" ? (
                    <Box
                      sx={{
                        width: "12px",
                        height: "12px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "2px solid green",
                        borderRadius: "2px",
                      }}
                    >
                      <Box
                        sx={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "green",
                          borderRadius: "50%",
                        }}
                      ></Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        width: "12px",
                        height: "12px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        border: "2px solid crimson",
                        borderRadius: "2px",
                      }}
                    >
                      <Box
                        sx={{
                          width: 0,
                          height: 0,
                          borderLeft: "6px solid transparent",
                          borderRight: "6px solid transparent",
                          borderBottom: "7px solid crimson", // triangle color
                          display: "inline-block",
                        }}
                        aria-hidden="true"
                      ></Box>
                    </Box>
                  )}
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
                  {/* qty controls */}
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
                  {/* per-item price */}
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
              {/* per-item Add Note button or TextField (one per item) */}
              {!showNoteInput[it.id] ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DescriptionOutlinedIcon />}
                  onClick={() => toggleItemNoteInput(it.id)}
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
                  onChange={(e) => handleItemNoteChange(it.id, e.target.value)}
                  fullWidth
                  size="small"
                  sx={{
                    mt: 1,
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      // background: "#fff",
                      "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 5px rgba(0,0,0,0.2)", // subtle grey shadow on focus
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "rgba(0,0,0,0.12)",
                      }, // keep outline muted
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ mr: 1, color: "grey" }}>
                        <DescriptionOutlinedIcon />
                      </Box>
                    ),
                    // endAdornment: (
                    //   <Button
                    //     size="small"
                    //     onClick={() => toggleItemNoteInput(it.id)}
                    //     sx={{ textTransform: "none", ml: 1 }}
                    //   >
                    //     Done
                    //   </Button>
                    // ),
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
              // background: "#fff",
              "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
              "&:hover fieldset": { borderColor: "rgba(0,0,0,0.18)" },
              "&.Mui-focused": {
                boxShadow: "0 0 5px rgba(0,0,0,0.2)", // subtle grey shadow on focus
              },
              "&.Mui-focused fieldset": { borderColor: "rgba(0,0,0,0.12)" }, // keep outline muted
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
              SUBTOTAL
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
              "&:hover": {
                color: "#e67a24",
                bgcolor: "whitesmoke",
              },
            }}
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
            <Box
              sx={{
                px: 1,
                position: "sticky",
                top: 0,
                zIndex: 2,
                pb: 1,
              }}
            >
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
                    // clear category when searching
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
              "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar for Chrome, Safari
              scrollbarWidth: "none", // Hide for Firefox
              msOverflowStyle: "none", // Hide for IE 10+
            }}
          >
            <Box sx={{ mt: 1, px: 1 }}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": { display: "none" }, // Chrome, Safari
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE 10+
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
                              // borderRadius: 2,
                              boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                              // borderBottom: "1px dashed grey",
                              borderBottom:
                                index === items.length - 1
                                  ? "none"
                                  : "1px dashed grey",
                            }}
                          >
                            <Box>
                              {/* Veg/Non-Veg Indicator */}

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

        {/* Add this floating cart summary box */}
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
          <Box
            sx={{
              display: "flex",
              // justifyContent: "space-between",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="warning"
              onClick={() => viewClick()}
              sx={{
                textTransform: "none",
              }}
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
      {/* Render the modal for short cart summary */}
      {renderContactModal()}
      {renderModal()}
    </Box>
  );
};
// export default Menu;



<Divider />

{/* 1) Existing order (read-only) */}
{(currentOrder.items || []).length > 0 && (
  <Box sx={{ mt: 1, mb: 2 }}>
    <Typography sx={{ fontWeight: 600, mb: 1 }}>Already in kitchen</Typography>
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
            <Typography>{it.name}</Typography>
          </Box>
          {/* read-only qty and line total */}
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: "12px" }}>Qty: {it.qty}</Typography>
            <Typography sx={{ fontSize: "12px", fontWeight: "500pt" }}>
              ₹ {(Number(it.price || 0) * Number(it.qty || 0)).toFixed(2)}
            </Typography>
          </Box>
        </Box>
        {it.note ? (
          <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.5 }}>
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
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}
        >
          {/* controls ALWAYS enabled for cart items, even if same id exists in current order */}
          {quantities[it.id] ? (
            <Box sx={{ display: "flex", alignItems: "center", border: `1px solid ${theamOrange}`, borderRadius: "4px" }}>
              <Button size="small" onClick={() => decrement(it.id)} sx={{ minWidth: 30, color: theamOrange }}>
                -
              </Button>
              <Typography sx={{ px: 1 }}>{quantities[it.id]}</Typography>
              <Button size="small" onClick={() => increment(it.id)} sx={{ minWidth: 30, color: theamOrange }}>
                +
              </Button>
            </Box>
          ) : (
            <Button
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none", borderColor: theamOrange, color: theamOrange }}
              onClick={() => increment(it.id)}
            >
              + Add
            </Button>
          )}

          {/* line total */}
          {(() => {
            const qty = (quantities && quantities[it.id]) ?? it.qty ?? 1;
            return (
              <Typography sx={{ fontSize: "12px", fontWeight: "500pt", width: "100%", textAlign: "end" }}>
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
          onClick={() => setShowNoteInput((p) => ({ ...p, [it.id]: true }))}
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
              "&.Mui-focused fieldset": { borderColor: "rgba(0,0,0,0.12)" },
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
