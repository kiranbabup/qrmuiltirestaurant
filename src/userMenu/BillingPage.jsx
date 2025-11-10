import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Divider, Paper } from "@mui/material";
import { pageStyle } from "../data/styles";
import { page3BGColor, theamOrange } from "../data/contents/items";
import FooterTab from "./FooterTab";
import { useNavigate } from "react-router-dom";
import noBillImg from "./pageImages/bill_generator.svg";
import PayCounterModal from "./PayCounterModal";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import VegIndicatorComp from "../components/VegIndicatorComp";
import HeaderPage from "./HeaderPage";

const BillingPage = () => {
  const [loading, setLoading] = useState(false);
  const [totalOrderList, setTotalOrderList] = useState([]);
  // const [, forceRerender] = useState(0);
  const [payModal, setPayModal] = useState(false);
  const [tableID, settableID] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const locid = localStorage.getItem("locresid");
    settableID(locid);
    viewTotalOrders();
  }, []);

  const viewTotalOrders = () => {
    setLoading(true);
    try {
      const totalOrdersKept = localStorage.getItem("totalOrdersData");
      if (totalOrdersKept) {
        const parsedtotalOrdersKept = JSON.parse(totalOrdersKept);
        setTotalOrderList(parsedtotalOrdersKept);
        setLoading(false);
      } else {
        setTotalOrderList([]);
        setLoading(false);
      }
    } catch (e) {
      console.error("Error retrieving order data:", e);
    }
  };

  const activeOrder = useMemo(() => {
    if (!Array.isArray(totalOrderList) || totalOrderList.length === 0)
      return null;
    // pick the latest active order (last one with active === true)
    for (let i = totalOrderList.length - 1; i >= 0; i--) {
      if (totalOrderList[i] && totalOrderList[i].active)
        return totalOrderList[i];
    }
    return null;
  }, [totalOrderList]);

  // // NEW: compute subtotal safely (avoid mixing ?? and || inline which caused the parsing error)
  // const subtotalAmount = useMemo(() => {
  //   if (!activeOrder) return 0;
  //   // if subtotal exists use it
  //   if (activeOrder.subtotal !== null && activeOrder.subtotal !== undefined) {
  //     return Number(activeOrder.subtotal) || 0;
  //   }
  //   // otherwise sum item totals
  //   if (Array.isArray(activeOrder.items)) {
  //     return activeOrder.items.reduce((sum, it) => {
  //       const price = Number(it.price) || 0;
  //       const qty = it.qty ?? 1;
  //       return sum + price * qty;
  //     }, 0);
  //   }
  //   return 0;
  // }, [activeOrder]);

  const ch = activeOrder?.charges || null;

  // prefer saved charges; fallback to computed subtotal if old orders lack charges
  const subtotalAmount =
    ch?.subtotal ??
    (Array.isArray(activeOrder?.items)
      ? activeOrder.items.reduce(
          (sum, it) => sum + (Number(it.price) || 0) * (it.qty ?? 1),
          0
        )
      : 0);

  const cgstRate = ch?.cgstRate ?? 2.5;
  const sgstRate = ch?.sgstRate ?? 2.5;
  const cgstAmount = ch?.cgstAmount ?? 0;
  const sgstAmount = ch?.sgstAmount ?? 0;
  const serviceCharge = ch?.serviceCharge ?? 50;
  const roundOff = ch?.roundOff ?? 0;
  const totalAmount =
    ch?.total ??
    subtotalAmount + cgstAmount + sgstAmount + serviceCharge + roundOff;

  const formatDateTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  const onYesHandle = () => {
    setLoading(true);
    try {
      // read existing orders
      const raw = localStorage.getItem("totalOrdersData");
      if (raw) {
        const list = JSON.parse(raw);
        // if activeOrder exists, mark that one inactive, otherwise mark any active entries inactive
        const updated = list.map((o) =>
          activeOrder
            ? o.orderID === activeOrder.orderID
              ? { ...o, active: false }
              : o
            : o.active
            ? { ...o, active: false }
            : o
        );
        localStorage.setItem("totalOrdersData", JSON.stringify(updated));
        setTotalOrderList(updated);
      }

      // remove current order and navigate to thank you
      localStorage.removeItem("currentOrderData");
      navigate("/thank-you");
    } catch (e) {
      console.error("Error updating orders on pay:", e);
    } finally {
      setPayModal(false);
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
            {/* logo & table */}
            <HeaderPage tableID={tableID} />
          </Box>

          {/* Content */}
          <Box>
            {/* Case: Loading */}
            {loading ? (
              <Box
                sx={{ pt: "93px", display: "flex", justifyContent: "center" }}
              >
                <Typography>Loading...</Typography>
              </Box>
            ) : // Case: empty or no active order -> show placeholder image
            !activeOrder ? (
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
              // Case: active order found -> show bill
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
                  <Box sx={{ p: 2, textAlign: "center", position: "relative" }}>
                    <Typography sx={{ fontSize: 12, color: "grey", pt: 2 }}>
                      Bill No. : {activeOrder.billId ?? "-"}
                    </Typography>
                    {/* header number */}
                    <Typography
                      sx={{ fontSize: 23, fontWeight: "bold", my: 1 }}
                    >
                      ₹ {Number(totalAmount).toFixed(2)}
                    </Typography>

                    <Typography sx={{ fontSize: 12, color: "grey" }}>
                      {formatDateTime(
                        activeOrder.storedAt ?? activeOrder.billConfirmedAt
                      )}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "grey" }}>
                      Name: {activeOrder.contact.name}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "grey" }}>
                      Contact: {activeOrder.contact.phone}
                    </Typography>
                  </Box>

                  <Divider />

                  {/* items */}
                  <Box>
                    {Array.isArray(activeOrder.items) &&
                      activeOrder.items.map((it, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            borderBottom:
                              idx === activeOrder.items.length - 1
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
                            {/* veg / non-veg marker */}
                            <VegIndicatorComp type={it.type} />
                            {/* {it.type === "veg" ? (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  border: "2px solid green",
                                  borderRadius: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    backgroundColor: "green",
                                    borderRadius: "50%",
                                  }}
                                />
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  width: 12,
                                  height: 12,
                                  border: "2px solid crimson",
                                  borderRadius: "2px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: "6px solid transparent",
                                    borderRight: "6px solid transparent",
                                    borderBottom: "7px solid crimson",
                                    display: "inline-block",
                                  }}
                                />
                              </Box>
                            )} */}
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
                              x{it.qty ?? 1}
                            </Typography>
                            <Typography
                              sx={{ fontSize: 12, fontWeight: "bold" }}
                            >
                              ₹ {(it.price * (it.qty ?? 1)).toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                  </Box>

                  {/* footer / charges */}
                  {/* footer breakdown */}
                  <Box sx={{ p: 2 }}>
                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>SUBTOTAL</Typography>
                      <Typography>
                        ₹ {Number(subtotalAmount).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>CGST@{cgstRate}</Typography>
                      <Typography>₹ {Number(cgstAmount).toFixed(2)}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>SGST@{sgstRate}</Typography>
                      <Typography>₹ {Number(sgstAmount).toFixed(2)}</Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>Service Charge</Typography>
                      <Typography>
                        ₹ {Number(serviceCharge).toFixed(2)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{ display: "flex", justifyContent: "space-between" }}
                    >
                      <Typography>Round Off</Typography>
                      <Typography>₹ {Number(roundOff).toFixed(2)}</Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      textAlign: "center",
                      p: 1,
                      borderTop: "1px solid grey",
                    }}
                  >
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ textTransform: "none" }}
                      onClick={() => setPayModal(true)}
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
        {/* Footer */}
        <PayCounterModal
          payModal={payModal}
          setPayModal={setPayModal}
          loading={loading}
          onYesHandle={onYesHandle}
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
export default BillingPage;
