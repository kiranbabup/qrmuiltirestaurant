import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { pageStyle } from "../../data/styles";
import { page3BGColor, theamOrange } from "../../data/contents/items";
import FooterTab from "../FooterTab";
import { useNavigate } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DiningIcon from "@mui/icons-material/Dining";
import noOrderImg from "./pageImages/no_orders_yet.svg";
import LoopIcon from "@mui/icons-material/Loop";
import VegIndicatorComp from "../../components/VegIndicatorComp";
import HeaderPage from "../HeaderPage";

const Page3 = () => {
  const [loading, setLoading] = useState(false);
  const [displaymode, setDisplaymode] = useState(false);
  const [tableID, settableID] = useState(0);

  const [currentOrderList, setCurrentOrderList] = useState([]);
  const [currentOrderCount, setCurrentOrderCount] = useState("00");

  const [totalOrderList, setTotalOrderList] = useState([]);
  const [totalOrderCount, setTotalOrderCount] = useState("00");

  const navigate = useNavigate();

  useEffect(() => {
    const locid = localStorage.getItem("locresid");
    settableID(locid);
    viewOrderedItems();
    viewTotalOrders();
  }, []);

  const viewClick = () => {
    // console.log("in orders");
  };

  const viewOrderedItems = () => {
    setLoading(true);
    try {
      const orderdItems = localStorage.getItem("currentOrderData");
      if (orderdItems) {
        setDisplaymode(true);
        const parsedOrderdItems = JSON.parse(orderdItems);
        // console.log(parsedOrderdItems);
        setCurrentOrderList(parsedOrderdItems);
        setCurrentOrderCount(
          parsedOrderdItems.items.length.toString().padStart(2, "00")
        );
        setLoading(false);
      } else {
        setCurrentOrderList([]);
        setCurrentOrderCount("00");
        setLoading(false);
      }
    } catch (e) {
      console.error("Error retrieving order data:", e);
    }
  };

  const viewTotalOrders = () => {
    setLoading(true);
    try {
      const totalOrdersKept = localStorage.getItem("totalOrdersData");
      if (totalOrdersKept) {
        const parsedtotalOrdersKept = JSON.parse(totalOrdersKept);
        // console.log(parsedtotalOrdersKept);
        setTotalOrderList(parsedtotalOrdersKept);
        setTotalOrderCount(
          parsedtotalOrdersKept.length.toString().padStart(2, "00")
        );
        setLoading(false);
      } else {
        setTotalOrderList([]);
        setTotalOrderCount("00");
        setLoading(false);
      }
    } catch (e) {
      console.error("Error retrieving order data:", e);
    }
  };

  const onClickDisplay = () => {
    setDisplaymode(!displaymode);
  };

  const paybillHandle = () => {
    try {
      // read existing total orders (if any)
      const raw = localStorage.getItem("totalOrdersData");
      let list = [];
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) list = parsed;
        } catch (err) {
          console.error(
            "Failed to parse totalOrdersData, resetting to empty array",
            err
          );
        }
      }

      // compute next KOT number from existing entries (KOT1, KOT2, ...)
      let maxKot = 0;
      for (const o of list) {
        if (o && typeof o.orderID === "string") {
          const m = o.orderID.match(/^KOT(\d+)$/);
          if (m) {
            const n = parseInt(m[1], 10);
            if (!isNaN(n) && n > maxKot) maxKot = n;
          }
        }
      }
      const nextKot = maxKot + 1;
      const orderID = `KOT${nextKot}`;

      // random 4-digit bill id
      const billId = Math.floor(1000 + Math.random() * 9000).toString();

      // add timestamps
      const billConfirmedAt = new Date().toISOString();

      // create the enriched order object to store
      const orderToStore = {
        ...currentOrderList,
        orderID,
        billId,
        billConfirmedAt,
        storedAt: new Date().toISOString(),
        active: true,
      };

      // add current order object to array
      list.push(orderToStore);

      // persist updated array
      localStorage.setItem("totalOrdersData", JSON.stringify(list));
      navigate("/bill");
    } catch (e) {
      console.error("Error in paybillHandle:", e);
    }
  };

  const hasActiveOrder = useMemo(() => {
    return totalOrderList.some((order) => order.active === true);
  }, [totalOrderList]);

  const handlePayBill = () => {
    // Case 1 & 2: No orders exist or no active orders
    if (!hasActiveOrder) {
      paybillHandle(); // Creates new order with active=true
      return;
    }

    // Case 3: Active order exists - navigate to bill page
    navigate("/bill");
  };

  // helper: returns "4 sec ago", "8 min ago", "8 hrs ago", "10 days ago", "2 months ago", "1 year ago"
  const timeAgo = (iso) => {
    if (!iso) return "";
    const then = new Date(iso).getTime();
    if (isNaN(then)) return "";
    const now = Date.now();
    const diff = Math.max(0, now - then);

    const sec = Math.floor(diff / 1000);
    if (sec < 60) return `${sec} sec ago`;

    const min = Math.floor(sec / 60);
    if (min < 60) return `${min} min ago`;

    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs} hrs ago`;

    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

    const years = Math.floor(months / 12);
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const onReorderClick = (item) => {
    try {
      if (hasActiveOrder) {
        navigate("/bill");
        return;
      }

      // store complete item objects (shallow clone)
      const itemsToStore = item.items.map((it) => ({ ...it }));

      // persist full objects (new key)
      localStorage.setItem("dishs_full", JSON.stringify(itemsToStore));

      // also keep legacy compact shape (id, qty) so existing code keeps working
      const compact = itemsToStore.map((it) => ({
        id: it.id,
        qty: it.qty ?? 1,
      }));
      localStorage.setItem("dishs", JSON.stringify(compact));

      // verify immediately
      // try {
      //   console.log(
      //     "stored dishs_full:",
      //     JSON.parse(localStorage.getItem("dishs_full"))
      //   );
      //   console.log(
      //     "stored dishs (compact):",
      //     JSON.parse(localStorage.getItem("dishs"))
      //   );
      // } catch (err) {
      //   console.error("verify stored dishs failed", err);
      // }

      // go to menu
      navigate("/menu");
    } catch (e) {
      console.error("Error in reorder:", e);
    }
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
            {/* logo & table */}
            <HeaderPage tableID={tableID} viewClick={viewClick} />

            {/* buttons switching */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                width: "100%",
              }}
            >
              {/* left */}
              <Button
                sx={{
                  width: "50%",
                  textTransform: "none",
                  borderBottom: displaymode
                    ? "1px solid grey"
                    : `3px solid ${theamOrange}`,
                  color: displaymode ? "grey" : theamOrange,
                }}
                onClick={() => {
                  onClickDisplay();
                  viewTotalOrders();
                }}
              >
                <DiningIcon
                  sx={{
                    mr: 1,
                    bgcolor: displaymode ? "grey" : theamOrange,
                    color: "white",
                    borderRadius: "5px",
                  }}
                />{" "}
                Orders{" "}
                <span
                  style={{
                    marginLeft: 5,
                    borderRadius: "50%",
                    height: "25px",
                    width: "25px",
                    backgroundColor: displaymode ? "grey" : theamOrange,
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {totalOrderCount}
                </span>
              </Button>
              {/* right */}
              <Button
                sx={{
                  width: "50%",
                  textTransform: "none",
                  borderBottom: displaymode
                    ? `3px solid ${theamOrange}`
                    : "1px solid grey",
                  color: displaymode ? theamOrange : "grey",
                }}
                onClick={() => onClickDisplay()}
              >
                <AssignmentOutlinedIcon
                  sx={{ mr: 1, color: displaymode ? theamOrange : "grey" }}
                />{" "}
                Item List{" "}
                <span
                  style={{
                    marginLeft: 5,
                    borderRadius: "50%",
                    height: "25px",
                    width: "25px",
                    backgroundColor: displaymode ? theamOrange : "grey",
                    color: "white",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {currentOrderCount}
                </span>
              </Button>
            </Box>
          </Box>
          {/* Content */}
          <Box>
            {!displaymode ? (
              <Box>
                {/* Total Orders List */}
                {totalOrderCount > 0 && !loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      pt: "93px",
                      minHeight: `calc(100vh - 166px)`,
                      backgroundColor: page3BGColor,
                    }}
                  >
                    <Box p="2px" />
                    {totalOrderList.reverse().map((item, i) => (
                      <Paper
                        sx={{ width: "90%", borderRadius: "15px" }}
                        key={i}
                      >
                        <Box
                          sx={{
                            borderTopLeftRadius: "15px",
                            borderTopRightRadius: "15px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom: "2px solid grey",
                            p: 2,
                          }}
                        >
                          <Typography>{item.orderID}</Typography>
                          <Typography sx={{ color: "grey", fontSize: 10 }}>
                            {timeAgo(item.storedAt)}
                          </Typography>
                        </Box>
                        {item.items.map((it, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              borderBottom:
                                index === it.length - 1
                                  ? "none"
                                  : "1px solid grey",
                            }}
                          >
                            <Box
                              sx={{
                                width: "60%",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <VegIndicatorComp type={it.type} />

                              <Typography
                                sx={{ fontSize: 12, fontWeight: "bold" }}
                              >
                                {it.name}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "40%",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography sx={{ fontSize: 12, color: "grey" }}>
                                x{it.qty}
                              </Typography>
                              <Typography
                                sx={{ fontSize: 12, fontWeight: "bold" }}
                              >
                                ₹ {it.price.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}

                        <Box
                          sx={{
                            backgroundColor: "#dfd0d0ff",
                            borderBottomLeftRadius: "15px",
                            borderBottomRightRadius: "15px",
                            textAlign: "center",
                          }}
                        >
                          <Button
                            startIcon={<LoopIcon />}
                            sx={{ color: theamOrange, textTransform: "none" }}
                            onClick={() => onReorderClick(item)}
                          >
                            Reorder
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  // image
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "calc(100vh - 11vh)",
                      backgroundColor: "#edededff",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={noOrderImg}
                        alt="No order Found"
                        style={{ width: "45%", marginBottom: "1rem" }}
                      />
                      <Typography sx={{ fontWeight: "bold", my: 1 }}>
                        No Orders Yet
                      </Typography>
                      <Typography
                        sx={{ color: "grey", textAlign: "center", px: "10%" }}
                      >
                        You haven't ordered anything yet. Place your first
                        order.
                      </Typography>
                      <Box p={2} />
                      <Button
                        variant="contained"
                        // size="small"
                        color="warning"
                        sx={{ textTransform: "none" }}
                        onClick={() => navigate("/menu")}
                      >
                        Start Ordering
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
                {/* Current Order List */}
                {currentOrderCount > 0 && !loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                      pt: "93px",
                      minHeight: `calc(100vh - 166px)`,
                      backgroundColor: "#edededff",
                    }}
                  >
                    <Box p="2px" />
                    <Paper sx={{ width: "90%", borderRadius: "15px" }}>
                      {currentOrderList.items.map((it, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderBottom:
                              index === currentOrderList.items.length - 1
                                ? "none"
                                : "1px dashed grey",
                          }}
                        >
                          <Box
                            sx={{
                              width: "60%",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <VegIndicatorComp type={it.type} />

                            <Typography
                              sx={{ fontSize: 12, fontWeight: "bold" }}
                            >
                              {it.name}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              width: "40%",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: 12, color: "grey" }}>
                              x{it.qty}
                            </Typography>
                            <Typography
                              sx={{ fontSize: 12, fontWeight: "bold" }}
                            >
                              ₹ {it.price.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                      <Box
                        sx={{
                          backgroundColor: theamOrange,
                          color: "white",
                          p: 1,
                          borderBottomLeftRadius: "15px",
                          borderBottomRightRadius: "15px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontSize: 13 }}>
                            SUBTOTAL
                          </Typography>
                          <Typography sx={{ color: "wheat", fontSize: 13 }}>
                            (Extra Charges may apply)
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: 13 }}>
                          ₹ {currentOrderList.subtotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Paper>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{
                        textTransform: "none",
                      }}
                      onClick={() => handlePayBill()}
                    >
                      Pay Bill
                    </Button>
                  </Box>
                ) : (
                  // image
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "calc(100vh - 11vh)",
                      backgroundColor: "#edededff",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={noOrderImg}
                        alt="No order Found"
                        style={{ width: "45%", marginBottom: "1rem" }}
                      />
                      <Typography sx={{ fontWeight: "bold", my: 1 }}>
                        No Orders Yet
                      </Typography>
                      <Typography
                        sx={{ color: "grey", textAlign: "center", px: "10%" }}
                      >
                        You haven't ordered anything yet. Place your first
                        order.
                      </Typography>
                      <Box p={2} />
                      <Button
                        variant="contained"
                        // size="small"
                        color="warning"
                        sx={{ textTransform: "none" }}
                        onClick={() => navigate("/menu")}
                      >
                        Start Ordering
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          <Box p="5.5vh" backgroundColor={page3BGColor} />
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
    </Box>
  );
};
export default Page3;
