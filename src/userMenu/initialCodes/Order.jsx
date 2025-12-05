import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { pageStyle } from "../../data/styles";
import { page3BGColor, theamOrange } from "../../data/contents/items";
import FooterTab from "../FooterTab";
import { useNavigate } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import noOrderImg from "./pageImages/no_orders_yet.svg";
import VegIndicatorComp from "../../components/VegIndicatorComp";
import HeaderPage from "../HeaderPage";
import SnackbarCompo from "../../components/SnackbarCompo";
import ContactModal from "../ContactModal";
import ServiceChargeRow from "../ServiceChargeRow";
import ConfirmationComponent from "../../components/ConfirmationComponent";

const cgst = 2.5;
const sgst = 2.5;

const Order = () => {
  const [loading, setLoading] = useState(false);
  const [tableID, settableID] = useState(0);

  const [currentOrderList, setCurrentOrderList] = useState([]);
  const [currentOrderCount, setCurrentOrderCount] = useState("00");
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactModal, setContactModal] = useState(false);

  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");

  const [totalOrderList, setTotalOrderList] = useState([]);

  const [serviceCharge, setServiceCharge] = useState(50);

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
      // check active bill directly from storage to avoid timing issues
      const rawOrders = localStorage.getItem("totalOrdersData");
      const list = rawOrders ? JSON.parse(rawOrders) : [];
      const activeExists =
        Array.isArray(list) && list.some((o) => o?.active === true);
      if (activeExists) {
        setCurrentOrderList([]);
        setCurrentOrderCount("00");
        setLoading(false);
        return; // don't show/compute currentOrderData at all
      }

      const orderedItems = localStorage.getItem("currentOrderData");
      if (orderedItems) {
        const parsed = JSON.parse(orderedItems);
        setCurrentOrderList(parsed);
        setCurrentOrderCount(parsed.items.length.toString().padStart(2, "00"));
      } else {
        setCurrentOrderList([]);
        setCurrentOrderCount("00");
      }
    } catch (e) {
      console.error("Error retrieving order data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSuccessSnackbarOpen(false);
    setLoading(false);
  };

  const viewTotalOrders = () => {
    try {
      const totalOrdersKept = localStorage.getItem("totalOrdersData");
      if (totalOrdersKept) {
        const parsedtotalOrdersKept = JSON.parse(totalOrdersKept);
        // console.log(parsedtotalOrdersKept);
        setTotalOrderList(parsedtotalOrdersKept);
      }
    } catch (e) {
      console.error("Error retrieving order data:", e);
    }
  };

  const paybillHandle = () => {
    try {
      // 🔒 Always check localStorage directly
      const rawExisting = localStorage.getItem("totalOrdersData");
      const list = rawExisting ? JSON.parse(rawExisting) || [] : [];
      const activeExists =
        Array.isArray(list) && list.some((o) => o?.active === true);

      if (activeExists) {
        // An active order already exists – just go to Bill page
        navigate("/bill");
        return;
      }

      const contact = JSON.parse(localStorage.getItem("contactInfo") || "null");
      const raw = localStorage.getItem("totalOrdersData");
      let nextList = Array.isArray(JSON.parse(raw || "[]"))
        ? JSON.parse(raw || "[]")
        : [];

      // compute next KOT number
      let maxKot = 0;
      for (const o of nextList) {
        const m = o?.orderID?.match(/^KOT(\d+)$/);
        if (m) {
          const n = parseInt(m[1], 10);
          if (!isNaN(n) && n > maxKot) maxKot = n;
        }
      }
      const nextKot = maxKot + 1;
      const orderID = `KOT${nextKot}`;

      const billId = Math.floor(1000 + Math.random() * 9000).toString();
      const now = new Date().toISOString();

      const orderToStore = {
        ...currentOrderList, // items, (old) subtotal, createdAt, etc.
        orderID,
        billId,
        billConfirmedAt: now,
        storedAt: now,
        active: true,
        contact,
        // 💡 add normalized charges block (bill uses this)
        charges: {
          subtotal: toNumber(subTotalNum),
          cgstRate: cgst, // 2.5
          cgstAmount: cgstAmtRs, // e.g., 37.49
          sgstRate: sgst, // 2.5
          sgstAmount: sgstAmtRs,
          serviceCharge: toNumber(serviceCharge),
          roundOff: roundOff, // can be +/- (e.g., 0.51)
          total: grandTotal, // integer-rounded total
        },
      };

      nextList.push(orderToStore);
      localStorage.setItem("totalOrdersData", JSON.stringify(nextList));

      // keep UI state in sync
      setTotalOrderList(nextList);
      // we’ve generated a bill; remove the cart copy and reset UI counters
      localStorage.removeItem("currentOrderData");
      setCurrentOrderList([]);
      setCurrentOrderCount("00");
      navigate("/bill");
    } catch (e) {
      console.error("Error in paybillHandle:", e);
    }
  };

  const hasActiveOrder = useMemo(() => {
    return (
      Array.isArray(totalOrderList) &&
      totalOrderList.some((o) => o?.active === true)
    );
  }, [totalOrderList]);

  const confirmByModal = () => {
    // Case 1 & 2: No orders exist or no active orders
    const contact = localStorage.getItem("contactInfo");
    if (contact) {
      // Existing user with contact info
      setName(JSON.parse(contact).name);
      setPhone(JSON.parse(contact).phone);
    }
    // Show contact modal for both new and existing users
    setContactModal(true);
  };

  const handlePayBill = () => {
    setConfirmModalOpen(true);
  };

  const handleCloseConfirmModal =()=>{
    setConfirmModalOpen(false)
  }

  const subTotalNum = Number(currentOrderList?.subtotal || 0);

  // helpers
  const toNumber = (v) => Number(v || 0);
  const toPaise = (v) => Math.round(toNumber(v) * 100);
  const rs = (p) => p / 100;

  // taxes (percent values already defined: cgst = 2.5; sgst = 2.5)
  const cgstAmt = (subTotalNum * cgst) / 100;
  const sgstAmt = (subTotalNum * sgst) / 100;

  const subtotalP = toPaise(subTotalNum);
  const cgstP = toPaise(cgstAmt);
  const sgstP = toPaise(sgstAmt);
  const serviceP = toPaise(serviceCharge);

  const preTotalP = subtotalP + cgstP + sgstP + serviceP;
  const roundedTotalP = Math.round(rs(preTotalP)) * 100; // nearest rupee (use Math.ceil to always round up)
  const roundOffP = roundedTotalP - preTotalP;

  // expose rupees for UI where needed
  const cgstAmtRs = rs(cgstP);
  const sgstAmtRs = rs(sgstP);
  const roundOff = rs(roundOffP);
  const grandTotal = rs(roundedTotalP);

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

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
                height: "5vh",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                borderBottom:
                  currentOrderCount > 0
                    ? `3px solid ${theamOrange}`
                    : "1px solid grey",
                color: currentOrderCount > 0 ? theamOrange : "grey",
              }}
            >
              <AssignmentOutlinedIcon
                sx={{
                  mr: 2,
                  color: currentOrderCount > 0 ? theamOrange : "grey",
                }}
              />{" "}
              Item List{" "}
              <span
                style={{
                  marginLeft: 20,
                  borderRadius: "50%",
                  height: "25px",
                  width: "25px",
                  backgroundColor: currentOrderCount > 0 ? theamOrange : "grey",
                  color: "white",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {currentOrderCount}
              </span>
            </Box>
          </Box>
          {/* Content */}

          {/* Current Order List */}
          {!hasActiveOrder && currentOrderCount > 0 && !loading ? (
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

                      <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
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
                      <Typography sx={{ fontSize: 12, fontWeight: "bold" }}>
                        ₹{" "}
                        {(Number(it.price || 0) * Number(it.qty || 0)).toFixed(
                          2
                        )}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                <Box
                  sx={{
                    backgroundColor: theamOrange,
                    color: "white",
                    p: 2,
                    borderBottomLeftRadius: "15px",
                    borderBottomRightRadius: "15px",
                  }}
                >
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>SUBTOTAL</Typography>
                    <Typography>₹ {subTotalNum.toFixed(2)}</Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>CGST@{cgst}%</Typography>
                    <Typography>₹ {cgstAmtRs.toFixed(2)}</Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>SGST@{sgst}%</Typography>
                    <Typography>₹ {sgstAmtRs.toFixed(2)}</Typography>
                  </Box>

                  <ServiceChargeRow
                    subTotalNum={subTotalNum}
                    initialCharge={serviceCharge}
                    onChange={setServiceCharge}
                  />

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>Round Off</Typography>
                    <Typography>₹ {roundOff.toFixed(2)}</Typography>
                  </Box>

                  <Box
                    sx={{
                      mt: 1,
                      borderTop: "1px dashed white",
                      pt: 1,
                      display: "flex",
                      justifyContent: "space-between",
                      fontWeight: "bold",
                    }}
                  >
                    <Typography>Total</Typography>
                    <Typography>₹ {grandTotal.toFixed(2)}</Typography>
                  </Box>
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
                  You haven't ordered anything yet. Place your first order.
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
          <Box p="5.5vh" backgroundColor={page3BGColor} />
        </Box>

        <ConfirmationComponent
          open={confirmModalOpen}
          title="Confirm"
          message="Are you sure you want to close ordering? Orders won't be accepted until payment."
          onConfirm={confirmByModal}
          // onCancel
          handleClose={handleCloseConfirmModal}
          loading={loading}
        />

        <ContactModal
          contactModal={contactModal}
          setContactModal={setContactModal}
          phone={phone}
          setPhone={setPhone}
          name={name}
          setName={setName}
          loading={loading}
          setLoading={setLoading}
          setSuccessSnackbarOpen={setSuccessSnackbarOpen}
          setsnackbarContent={setsnackbarContent}
          setSnackbarMode={setSnackbarMode}
          hasActiveOrder={hasActiveOrder}
          paybillHandle={paybillHandle}
        />
        <SnackbarCompo
          successSnackbarOpen={successSnackbarOpen}
          handleSnackbarClose={handleSnackbarClose}
          snackbarContent={snackbarContent}
          snackbarMode={snackbarMode}
        />
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
export default Order;
