import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { pageStyle } from "../data/styles";
import { page3BGColor, theamOrange } from "../data/contents/items";
import FooterTab from "./FooterTab";
import { useNavigate } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import noOrderImg from "./pageImages/no_orders_yet.svg";
import VegIndicatorComp from "../components/VegIndicatorComp";
import HeaderPage from "./HeaderPage";
import SnackbarCompo from "../components/SnackbarCompo";
import ContactModal from "./ContactModal";
import ServiceChargeRow from "./ServiceChargeRow";
import ConfirmationComponent from "../components/ConfirmationComponent";
import { fetchTodayOrders, payBill } from "../services/api";

const UserOrders = () => {
  const [loading, setLoading] = useState(false);
  const [tableID, settableID] = useState(0);
  const tableData = useMemo(
    () => JSON.parse(localStorage.getItem("resloctab") || "{}"),
    []
  );
  const [serverOrder, setServerOrder] = useState(null);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [contactModal, setContactModal] = useState(false);

  const [snackbarContent, setsnackbarContent] = useState("");
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [snackbarMode, setSnackbarMode] = useState("");

  // const [totalOrderList, setTotalOrderList] = useState([]);
  const [serviceCharge, setServiceCharge] = useState(50);

  const navigate = useNavigate();

  // helpers
  const toNum = (v) => Number(v || 0);
  const paise = (v) => Math.round(toNum(v) * 100);
  const rs = (p) => p / 100;

  useEffect(() => {
    if (tableData?.table_number) {
      settableID(Number(tableData.table_number));
    } else {
      navigate("/");
    }
    loadActiveOrder();
  }, []);

  // const loadActiveOrder = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await fetchTodayOrders({
  //       loc_id: tableData.loc_id,
  //       table_id: tableData.table_id,
  //     });
  //     const payload = res?.data?.data;
  //     const order = Array.isArray(payload) ? payload[0] : payload;
  //     localStorage.setItem("oid", JSON.stringify(order?.order_id));
  //     if (!order) {
  //       setServerOrder(null);
  //       return;
  //     }

  //     const rawItems = order?.OrderItems ?? [];
  //     const itemsArr = Array.isArray(rawItems)
  //       ? rawItems
  //       : rawItems
  //       ? [rawItems]
  //       : [];

  //     const items = itemsArr.map((oi) => {
  //       const m = oi?.MenuItem ?? {};
  //       const qty = toNum(oi?.quantity);
  //       const unit = toNum(oi?.unit_price);
  //       const lineTotal = toNum(oi?.total_price ?? unit * qty);
  //       const rawType = m?.item_type;

  //       return {
  //         item_id: m?.item_id ?? oi?.item_id ?? null,
  //         name: m?.name ?? "Item",
  //         type:
  //           rawType === "non_veg"
  //             ? "nonveg"
  //             : rawType === "vegan"
  //             ? "vegan"
  //             : rawType || "veg",
  //         qty,
  //         unit,
  //         lineTotal,
  //         note: oi?.special_instructions ?? "",
  //       };
  //     });

  //     const normalized = {
  //       order_id: toNum(order?.order_id),
  //       status: order?.status ?? "Pending",
  //       subtotal: toNum(order?.subtotal),
  //       tax_rate: toNum(order?.tax_rate ?? 5), // cgst+sgst
  //       gratuity: toNum(order?.gratuity ?? 50),
  //       internal_notes: order?.internal_notes ?? "",
  //       loc_id: toNum(order?.loc_id),
  //       table_id: toNum(order?.table_id),
  //       items,
  //     };

  //     setServerOrder(normalized);
  //     setServiceCharge(normalized.gratuity);
  //   } catch (e) {
  //     console.error("loadActiveOrder error:", e);
  //     setServerOrder(null);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const currentOrderCount = useMemo(() => {
    const n = serverOrder?.items?.length ?? 0;
    return n.toString().padStart(2, "00");
  }, [serverOrder]);

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") return;
    setSuccessSnackbarOpen(false);
    setLoading(false);
  };

  // const hasActiveOrder = useMemo(() => {
  //   return (
  //     Array.isArray(totalOrderList) &&
  //     totalOrderList.some((o) => o?.active === true)
  //   );
  // }, [totalOrderList]);

  // const confirmByModal = () => {
  //   const contact = localStorage.getItem("contactInfo");
  //   if (contact) {
  //     const c = JSON.parse(contact);
  //     setName(c.name);
  //     setPhone(c.phone);
  //   }
  //   setContactModal(true);
  // };

  // const handlePayBill = () => setConfirmModalOpen(true);
  // const handleCloseConfirmModal = () => setConfirmModalOpen(false);

  // ---- totals (display + API) ----
  const subTotalNum = toNum(serverOrder?.subtotal);
  const taxRate = toNum(serverOrder?.tax_rate || 5);
  const cgstRate = taxRate / 2;
  const sgstRate = taxRate / 2;

  const cgstAmt = (subTotalNum * cgstRate) / 100;
  const sgstAmt = (subTotalNum * sgstRate) / 100;
  const taxAmount = cgstAmt + sgstAmt;

  const subtotalP = paise(subTotalNum);
  const cgstP = paise(cgstAmt);
  const sgstP = paise(sgstAmt);
  const serviceP = paise(serviceCharge);

  const preTotalP = subtotalP + cgstP + sgstP + serviceP;
  const roundedTotalP = Math.round(rs(preTotalP)) * 100;
  const roundOffP = roundedTotalP - preTotalP;

  const cgstAmtRs = rs(cgstP);
  const sgstAmtRs = rs(sgstP);
  const roundOff = rs(roundOffP);
  const grandTotal = rs(roundedTotalP);

  const loadActiveOrder = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const res = await fetchTodayOrders({
        loc_id: tableData.loc_id,
        table_id: tableData.table_id,
        // If your API layer supports AbortSignal, you can add { signal } here
      });
      
      const payload = res?.data?.data;
      const order = Array.isArray(payload) ? payload[0] : payload;
      // console.log(order);
      localStorage.setItem("oid", JSON.stringify(order?.order_id));
      if (!order) {
        setServerOrder(null);
        return;
      }

      const rawItems = order?.OrderItems ?? [];
      const itemsArr = Array.isArray(rawItems)
        ? rawItems
        : rawItems
        ? [rawItems]
        : [];

      const items = itemsArr.map((oi) => {
        const m = oi?.MenuItem ?? {};
        const qty = toNum(oi?.quantity);
        const unit = toNum(oi?.unit_price);
        const lineTotal = toNum(oi?.total_price ?? unit * qty);
        const rawType = m?.item_type;

        return {
          item_id: m?.item_id ?? oi?.item_id ?? null,
          name: m?.name ?? "Item",
          type:
            rawType === "non_veg"
              ? "nonveg"
              : rawType === "vegan"
              ? "vegan"
              : rawType || "veg",
          qty,
          unit,
          lineTotal,
          note: oi?.special_instructions ?? "",
        };
      });

      const normalized = {
        order_id: toNum(order?.order_id),
        status: order?.status ?? "Pending",
        subtotal: toNum(order?.subtotal),
        tax_rate: toNum(order?.tax_rate ?? 5),
        gratuity: toNum(order?.gratuity ?? 50),
        internal_notes: order?.internal_notes ?? "",
        loc_id: toNum(order?.loc_id),
        table_id: toNum(order?.table_id),
        items,
      };

      setServerOrder(normalized);
      setServiceCharge(normalized.gratuity);
    } catch (e) {
      console.error("loadActiveOrder error:", e);
      setServerOrder((prev) => prev ?? null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const orderSnapshot = (o) =>
    o
      ? JSON.stringify({
          id: o.order_id,
          status: o.status,
          subtotal: o.subtotal,
          gratuity: o.gratuity,
          tax_rate: o.tax_rate,
          itemsLen: o.items?.length ?? 0,
          items: (o.items ?? []).map((x) => ({
            id: x.item_id,
            q: x.qty,
            lt: x.lineTotal,
          })),
        })
      : "NO_ORDER";

  useEffect(() => {
    if (!tableData?.table_id) return;

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
        // silent = true so we don’t flash the spinner each tick
        await loadActiveOrder({ silent: true });
        // UI will auto-switch based on serverOrder state
      } catch (e) {
        console.error("order poll tick error:", e);
      } finally {
        running = false;
      }
    };

    // initial fetch with spinner once
    loadActiveOrder({ silent: false });

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
  }, [tableData?.table_id]); // keep deps minimal

  // A. Click “Pay Bill” -> open confirm modal
  const handlePayBillClick = () => {
    setConfirmModalOpen(true);
  };

  // B. Confirm modal: YES -> close confirm, open contact modal
  const handleConfirmYes = () => {
    setConfirmModalOpen(false);
    setContactModal(true);
  };

  // C. Confirm modal: NO/close
  const handleConfirmNo = () => {
    setConfirmModalOpen(false);
  };

  // D. Contact modal submit -> we call onPayBill(name, phone)
  const handleContactSubmit = async () => {
    // rely ONLY on name & phone from ContactModal fields
    await onPayBill(name.trim(), phone.trim());
    // if success, you may close the contact modal here (onPayBill can also do it)
  };

  // E. (Optional) Contact modal cancel
  const handleContactCancel = () => {
    setContactModal(false);
  };

  const clearAll = () => {
    setServerOrder(null);
    setServiceCharge(50);
    setSuccessSnackbarOpen(false);
    setsnackbarContent("");
    setSnackbarMode("");
  };

  const onPayBill = async (custName, custPhone) => {
    try {
      setLoading(true);

      // compute taxes & grandTotal (you already have these values)
      const taxRate = Number(serverOrder?.tax_rate || 5);
      const subTotalNum = Number(serverOrder?.subtotal || 0);
      const cgstRate = taxRate / 2;
      const sgstRate = taxRate / 2;
      const cgstAmt = (subTotalNum * cgstRate) / 100;
      const sgstAmt = (subTotalNum * sgstRate) / 100;
      const taxAmount = cgstAmt + sgstAmt;

      const preTotal = subTotalNum + taxAmount + Number(serviceCharge || 0);
      const roundedTotal = Math.round(preTotal); // nearest ₹
      // const roundOff = roundedTotal - preTotal; // available if you need it

      const payload = {
        order_id: serverOrder?.order_id,
        // status: "Completed",
        subtotal: Number(subTotalNum.toFixed(2)),
        tax_rate: Number(taxRate),
        tax_amount: Number(taxAmount.toFixed(2)),
        gratuity: Number(serviceCharge),
        total_amount: Number(roundedTotal.toFixed(2)),
        // table_id: serverOrder?.table_id ?? tableData?.table_id,
        cust_name: custName, // 👈 from ContactModal
        cust_phone: custPhone, // 👈 from ContactModal
      };

      await payBill(payload);
          localStorage.setItem("bg", true);
      // close contact modal and move on
      setContactModal(false);
      clearAll();
      navigate("/bill");
    } catch (e) {
      console.error("payBill failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const viewClick = () => console.log("in orders");

  // ----------------- UI -----------------
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
                  (serverOrder?.items?.length ?? 0) > 0
                    ? `3px solid ${theamOrange}`
                    : "1px solid grey",
                color:
                  (serverOrder?.items?.length ?? 0) > 0 ? theamOrange : "grey",
              }}
            >
              <AssignmentOutlinedIcon
                sx={{
                  mr: 2,
                  color:
                    (serverOrder?.items?.length ?? 0) > 0
                      ? theamOrange
                      : "grey",
                }}
              />{" "}
              Item List{" "}
              <span
                style={{
                  marginLeft: 20,
                  borderRadius: "50%",
                  height: "25px",
                  width: "25px",
                  backgroundColor:
                    (serverOrder?.items?.length ?? 0) > 0
                      ? theamOrange
                      : "grey",
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

          {/* CASE 1: No order yet */}
          {!loading &&
            (!serverOrder || (serverOrder.items?.length ?? 0) === 0) && (
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
                    color="warning"
                    sx={{ textTransform: "none" }}
                    onClick={() => navigate("/menu")}
                  >
                    Start Ordering
                  </Button>
                </Box>
              </Box>
            )}

          {/* CASE 2: Current Order List */}
          {!loading && serverOrder && (serverOrder.items?.length ?? 0) > 0 && (
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
              {/* Status */}
              <Box
                sx={{
                  width: "90%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#fff",
                    backgroundColor:
                      serverOrder?.status === "Preparing"
                        ? "#00A389"
                        : serverOrder?.status === "Pending"
                        ? "#FF9800"
                        : serverOrder?.status === "Completed"
                        ? "#4CAF50"
                        : "#607D8B",
                  }}
                >
                  Status: {serverOrder?.status}
                </Box>
              </Box>

              <Paper sx={{ width: "90%", borderRadius: "15px" }}>
                {serverOrder?.items?.map((it, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 2,
                      borderBottom:
                        index === (serverOrder?.items?.length ?? 1) - 1
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
                        ₹ {toNum(it.lineTotal).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {/* Totals */}
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
                    <Typography>CGST@{cgstRate}%</Typography>
                    <Typography>₹ {cgstAmtRs.toFixed(2)}</Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Typography>SGST@{sgstRate}%</Typography>
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

              {/* Pay Bill */}
              <Button
                variant="contained"
                color="warning"
                sx={{ textTransform: "none" }}
                onClick={() => handlePayBillClick()}
                // disabled={serverOrder?.status === "Completed"}
              >
                Pay Bill
              </Button>
            </Box>
          )}

          <Box p="5.5vh" backgroundColor={page3BGColor} />
        </Box>

        <ConfirmationComponent
          open={confirmModalOpen}
          title="Confirm"
          message="Are you sure you want to close ordering? Orders won't be accepted until payment."
          onConfirm={handleConfirmYes}
          handleClose={handleConfirmNo}
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
          // remove hasActiveOrder prop entirely
          // call our submit from inside the modal's primary button
          paybillHandle={handleContactSubmit}
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

export default UserOrders;
