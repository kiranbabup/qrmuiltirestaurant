import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { pageStyle } from "../data/styles";
import { page3BGColor, theamOrange } from "../data/contents/items";
import FooterTab from "./FooterTab";
import { useNavigate } from "react-router-dom";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import DiningIcon from "@mui/icons-material/Dining";
import noOrderImg from "./pageImages/no_orders_yet.svg";
import LoopIcon from "@mui/icons-material/Loop";
import VegIndicatorComp from "../components/VegIndicatorComp";
import HeaderPage from "./HeaderPage";

const Cart = () => {
  const [loading, setLoading] = useState(false);
  const [tableID, settableID] = useState(0);

  const [currentOrderList, setCurrentOrderList] = useState([]);
  const [currentOrderCount, setCurrentOrderCount] = useState("00");

  const navigate = useNavigate();

  useEffect(() => {
    const locid = localStorage.getItem("locresid");
    settableID(locid);
    viewOrderedItems();
  }, []);

  const viewClick = () => {
    console.log("in orders");
  };

  const viewOrderedItems = () => {
    setLoading(true);
    try {
      const orderdItems = localStorage.getItem("currentOrderData");
      if (orderdItems) {
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

  const placeOrderHandler = () => {
    setLoading(true);
    // const items = (orderingList || []).map((it) => {
    //   const qty = (quantities && quantities[it.id]) ?? it.qty ?? 1;
    //   return {
    //     id: it.id,
    //     name: it.name,
    //     price: it.price,
    //     qty,
    //     type: it.type,
    //     note: itemNotes[it.id] || "",
    //   };
    // });

    const currentOrderData = {
    //   items,
    //   orderNote: orderNote || "",
    //   subtotal: subtotal,
      createdAt: new Date().toISOString(),
    };

    // persist under key "currentOrderData"
    try {
      localStorage.setItem(
        "currentOrderData",
        JSON.stringify(currentOrderData)
      );
      // feedback + close
    //   setsnackbarContent("Order Placed Successfully");
    //   setSnackbarMode("success");
    //   setSuccessSnackbarOpen(true);
      setLoading(false);
    //   clearCart();
      navigate("/my_order");
    } catch (e) {
    //   setsnackbarContent("Unable to Place order");
    //   setSnackbarMode("error");
    //   setSuccessSnackbarOpen(true);
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
              Cart Items {" "}
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
                    <Typography sx={{ fontSize: 13 }}>SUBTOTAL</Typography>
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
                onClick={() => placeOrderHandler()}
              >
                Place Order
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
export default Cart;