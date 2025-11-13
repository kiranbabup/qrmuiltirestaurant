import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Divider, Paper } from "@mui/material";
import { pageStyle } from "../data/styles";
import { page3BGColor, theamOrange } from "../data/contents/items";
import FooterTab from "./FooterTab";
import { useNavigate } from "react-router-dom";
import noBillImg from "./pageImages/bill_generator.svg";
import PayCounterModal from "./PayCounterModal";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import HeaderPage from "./HeaderPage";
import { confirmBill, getOrderDetailsById } from "../services/api";

const BillPage = () => {
  const [loading, setLoading] = useState(false);
  const [tableID, settableID] = useState(0);
  const tableData = useMemo(
    () => JSON.parse(localStorage.getItem("resloctab") || "{}"),
    []
  );

  // hasActiveOrder = whether we should show bill section or placeholder
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  // billData = full server response for the order (object)
  const [billData, setBillData] = useState(null);

  const [payModal, setPayModal] = useState(false);
  const [payHeaderText, setPayHeaderText] = useState("");
  const [payContent, setPayContent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (tableData?.table_number) {
      settableID(Number(tableData.table_number));
    } else {
      navigate("/");
    }
    fetchBillData({ silent: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNum = (v) => Number(v || 0);

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    // 13 Nov 2025, 11:23 AM-style (adjust as you prefer)
    return d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const fetchBillData = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const rawId = localStorage.getItem("oid"); // stored earlier
      const bg = JSON.parse(localStorage.getItem("bg") || "false");

      const orderId = rawId ? Number(rawId) : null;

      // Case 1: no oid OR bg !== true ➜ show placeholder
      if (!orderId || bg !== true) {
        if (!silent) {
          setHasActiveOrder(false);
          setBillData(null);
        }
        return;
      }

      // Case 2: oid present & bg === true ➜ fetch from server
      const res = await getOrderDetailsById(orderId);
      const payload = res?.data?.data || null;

      if (!payload) {
        if (!silent) {
          setHasActiveOrder(false);
          setBillData(null);
        }
        return;
      }
    //   console.log(payload);

      // Only update state if changed (prevents re-render flicker)
      setBillData((prev) => {
        const prevSig = JSON.stringify(prev || {});
        const nextSig = JSON.stringify(payload || {});
        return prevSig === nextSig ? prev : payload;
      });
      setHasActiveOrder(true);
    } catch (e) {
      console.error("Error retrieving bill data:", e);
      if (!silent) {
        setHasActiveOrder(false);
        setBillData(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    const POLL_MS = 10000;
    let timerId = null;
    let running = false;

    const tick = async () => {
      if (running) return;
      if (
        document.hidden ||
        (typeof navigator !== "undefined" && !navigator.onLine)
      )
        return;

      running = true;
      try {
        // silent so we don't flash the spinner
        await fetchBillData({ silent: true });
      } catch (e) {
        console.error("bill poll tick error:", e);
      } finally {
        running = false;
      }
    };

    // start interval
    timerId = setInterval(tick, POLL_MS);

    // refresh when tab becomes visible
    const onVis = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVis);

    // refresh when back online
    const onOnline = () => tick();
    window.addEventListener("online", onOnline);

    return () => {
      if (timerId) clearInterval(timerId);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("online", onOnline);
    };
  }, []); // keep deps empty so the interval isn't reset constantly

  // ---- Derivations from billData (use server fields directly as requested) ----
  const {
    order_id,
    cust_name,
    cust_phone,
    subtotal,
    tax_rate,
    tax_amount,
    gratuity,
    total_amount,
    updated_at,
    OrderItems = [],
  } = billData || {};

  // Split CGST/SGST and compute roundOff
  const taxRateNum = toNum(tax_rate); // e.g. 5
  const cgstRate = taxRateNum / 2; // % split
  const sgstRate = taxRateNum / 2;

  const taxAmountNum = toNum(tax_amount); // e.g. "44.00"
  const cgstAmount = taxAmountNum / 2;
  const sgstAmount = taxAmountNum / 2;

  const serviceCharge = toNum(gratuity);
  const subtotalAmount = toNum(subtotal);
  const totalAmount = toNum(total_amount);

  // roundOff = total_amount - (tax_amount + gratuity + subtotal)
  //   const roundOff = useMemo(() => {
  //     const val = totalAmount - (taxAmountNum + serviceCharge + subtotalAmount);
  //     // keep full precision for math, format with toFixed(2) only for UI
  //     return val;
  //   }, [totalAmount, taxAmountNum, serviceCharge, subtotalAmount]);

  const groupedItems = useMemo(() => {
    if (!Array.isArray(OrderItems)) return [];
    const map = new Map();
    for (const oi of OrderItems) {
      const id = oi?.item_id;
      const name = oi?.MenuItem?.name ?? "Item";
      // key includes id + name (name helps if menu ids collide across branches)
      const key = `${id}||${name}`;
      const qty = toNum(oi?.quantity);
      const lineTotal = toNum(oi?.total_price); // already line total from server
      if (!map.has(key)) {
        map.set(key, {
          item_id: id,
          name,
          quantity: 0,
          total_price: 0,
        });
      }
      const agg = map.get(key);
      agg.quantity += qty;
      agg.total_price += lineTotal;
    }
    return Array.from(map.values());
  }, [OrderItems]);

  const handlePayCounter = () => {
    setPayHeaderText("Pay At Counter?");
    setPayContent(
      "You'll need to check with the biller at the counter to pay via cash"
    );
    setPayModal(true);
  };

  const handlePayOnline = () => {
    setPayHeaderText("Pay Online?");
    //   setPayContent("You can pay online. Do you wish to proceed?");
    setPayContent(
      "(Online Payment will be live soon) Pay via online payment. Do you wish to proceed?"
    );
    setPayModal(true);
  };

  const onYesOnlineHandle = async () => {
    try {
      setLoading(true);

      const rawId = localStorage.getItem("oid");
      const orderId = rawId ? Number(rawId) : null;
      const payload = {
        status: "Completed",
        payment_type: "online",
      };

      await confirmBill(orderId, payload);
      await fetchBillData({ silent: true }); // show latest status/timestamp
      setPayModal(false);
      navigate("/thank-you");
    } catch (e) {
      console.error("Error confirming bill:", e);
      // (optional) show a snackbar/toast here
    } finally {
      setLoading(false);
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
            <HeaderPage tableID={tableID} />
          </Box>

          {/* Content */}
          <Box>
            {/* Loading */}
            {loading && !billData ? (
              <Box
                sx={{ pt: "93px", display: "flex", justifyContent: "center" }}
              >
                <Typography>Loading...</Typography>
              </Box>
            ) : !hasActiveOrder ? (
              // Case 1: No active bill
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
                    src={noBillImg}
                    alt="No bill"
                    style={{ width: "45%", marginBottom: "1rem" }}
                  />
                  <Typography sx={{ fontWeight: "bold", my: 1 }}>
                    No Bill Generated Yet
                  </Typography>
                  <Typography
                    sx={{ color: "grey", textAlign: "center", px: "10%" }}
                  >
                    Your bill will appear here once you place your order.
                  </Typography>
                  <Box p={2} />
                  <Button
                    variant="contained"
                    color="warning"
                    sx={{ textTransform: "none" }}
                    onClick={() => navigate("/menu")}
                  >
                    Start Ordering
                  </Button>
                </Box>
              </Box>
            ) : (
              // Case 2: Show bill from server
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
                <Box
                  sx={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "50%",
                    backgroundColor: theamOrange,
                    color: "whitesmoke",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "absolute",
                    top: "70px",
                    zIndex: 1,
                  }}
                >
                  <ReceiptLongOutlinedIcon />
                </Box>

                <Paper
                  sx={{
                    width: "90%",
                    borderRadius: "15px",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  {/* Header numbers */}
                  <Box sx={{ p: 2, textAlign: "center", position: "relative" }}>
                    <Typography sx={{ fontSize: 12, color: "grey", pt: 2 }}>
                      Order ID : {order_id ?? "-"}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 23, fontWeight: "bold", my: 1 }}
                    >
                      ₹ {totalAmount.toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "grey" }}>
                      {formatDateTime(updated_at)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "grey" }}>
                      Name: {cust_name || "-"}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "grey" }}>
                      Contact: {cust_phone || "-"}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* Items */}
                  <Box>
                    {Array.isArray(groupedItems) &&
                      groupedItems.map((it, idx) => {
                        const name = it.name;
                        const qty = toNum(it.quantity) || 1;
                        const lineTotal = toNum(it.total_price);
                        return (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              p: 2,
                              borderBottom:
                                idx === OrderItems.length - 1
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
                              <Typography
                                sx={{ fontSize: 12, fontWeight: "bold" }}
                              >
                                {name}
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
                                x{qty}
                              </Typography>
                              <Typography
                                sx={{ fontSize: 12, fontWeight: "bold" }}
                              >
                                ₹ {lineTotal.toFixed(2)}
                              </Typography>
                            </Box>
                          </Box>
                        );
                      })}
                  </Box>

                  {/* Charges */}
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>SUBTOTAL</Typography>
                      <Typography>₹ {subtotalAmount.toFixed(2)}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>CGST@{cgstRate}%</Typography>
                      <Typography>₹ {cgstAmount.toFixed(2)}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>SGST@{sgstRate}%</Typography>
                      <Typography>₹ {sgstAmount.toFixed(2)}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>Service Charge</Typography>
                      <Typography>₹ {serviceCharge.toFixed(2)}</Typography>
                    </Box>

                    {/* <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography>Round Off</Typography>
                      <Typography>₹ {roundOff.toFixed(2)}</Typography>
                    </Box> */}
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-evenly",
                      alignItems: "center",
                      p: 1,
                      borderTop: "1px solid grey",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ textTransform: "none" }}
                      onClick={() => handlePayOnline()}
                    >
                      Pay Online
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ textTransform: "none" }}
                      onClick={() => handlePayCounter()}
                    >
                      Pay At Counter
                    </Button>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>

          {!loading && <Box p="5.5vh" backgroundColor={page3BGColor} />}
        </Box>

        {/* Footer/Modal */}
        <PayCounterModal
          payHeaderText={payHeaderText}
          payContent={payContent}
          payModal={payModal}
          setPayModal={setPayModal}
          loading={loading}
          onYesOnlineHandle={onYesOnlineHandle}
        />

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

export default BillPage;
