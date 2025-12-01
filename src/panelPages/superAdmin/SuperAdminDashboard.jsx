import { Box, Typography } from "@mui/material";
import LeftPannel from "../../components/LeftPannel";
import HeaderPannel from "../../components/HeaderPannel";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { useEffect, useState } from "react";
// import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, YAxis, XAxis, Bar } from "recharts";
import CountCard from "../../components/CountCard";
// import { getDashboardStats } from "../../services/api";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import BrandingWatermarkRoundedIcon from "@mui/icons-material/BrandingWatermarkRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import BookmarkRemoveIcon from "@mui/icons-material/BookmarkRemove";
import DangerousIcon from "@mui/icons-material/Dangerous";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import StoreIcon from "@mui/icons-material/Store";
import { useNavigate } from "react-router-dom";
import LsService, { storageKey } from "../../services/localstorage";
import { formatToINR } from "../../data/functions";
import SmallScreenError from "../../components/panelComponents/SmallScreenError";
import { headerBoxStyle, lrgScreenStyle, rightInnerBoxStyle } from "../../components/panelComponents/panelStyles";
import MainNavHeader from "../../components/panelComponents/MainNavHeader";

const COLORS = ["green", "red"];

const SuperAdminDashboard = () => {
  // const [allProduactsCount, setAllProduactsCount] = useState(0);
  // const [allStores, setAllStores] = useState(0);
  const [counts, setCounts] = useState({});
  const navigate = useNavigate();

  // useEffect(() => {
  //   // getAllStores().then(res => {
  //   //   console.log(res.data);
  //   //   // setAllStores(res.data.products?.length || 0);
  //   // })
  //   //   .catch(() => setAllStores(0));

  //   getDashboardStats().then(res => {
  //     // console.log(res.data);
  //     setCounts(res.data || {});
  //   })
  //     .catch(() => setCounts({}));
  // }, []);

  const user = LsService.getItem(storageKey);

  useEffect(() => {
    if (!user || user.role !== "super_admin") {
      LsService.removeItem(storageKey);
      navigate("/");
    }
  }, [user, navigate]);

  const itemValues = [
    {
      HeadTitle: "Total Items",
      IconCompo: LocalMallIcon,
      Value: counts?.totalProducts ? counts?.totalProducts : 0,
      navpath: "/items",
    },
    {
      HeadTitle: "Total Staff",
      IconCompo: SupervisorAccountIcon,
      Value: counts?.totalUsers ? counts?.totalUsers : 0,
      navpath: "/users_management",
    },
    {
      HeadTitle: "Total Orders",
      IconCompo: TrackChangesIcon,
      Value: counts?.totalOrders ? counts?.totalOrders : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Total Categories",
      IconCompo: CategoryRoundedIcon,
      Value: counts?.categoriesCount ? counts?.categoriesCount : 0,
      navpath: "/categories",
    },
    {
      HeadTitle: "Total Sales",
      IconCompo: ShowChartIcon,
      Value: counts?.totalSales ? `₹${formatToINR(counts?.totalSales)}` : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Daily Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts?.todaySales ? `₹${formatToINR(counts?.todaySales)}` : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Total Weekly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts?.weekSales ? `₹${formatToINR(counts?.weekSales)}` : 0,
      navpath: "/billings",
    },
    {
      HeadTitle: "Total Monthly Sales",
      IconCompo: TrendingDownRoundedIcon,
      Value: counts?.monthSales ? `₹${formatToINR(counts?.monthSales)}` : 0,
      navpath: "/billings",
    },
  ];

  // const pieData = [
  // { name: "Payment Received", value: paymentReceivedValue },
  // { name: "Withdraw Requested", value: withdrawRequestedValue },
  // ];

  return (
    <Box>
      {/* Large screen view */}
      <Box sx={lrgScreenStyle}>
        <Box sx={headerBoxStyle}>
          <MainNavHeader
            headerTitle="Super Admin Dashboard"
            headerNavStartTitle="Home / Super Admin Dashboard"
            homeNavigate=""
            headerNavEndTitle=""
          />
        </Box>

        <Box sx={rightInnerBoxStyle}>
          <Box
            sx={{
              width: "96%",
              p: 2,
            }}
          >
            <Box
              sx={{
                overflowY: "auto",
                "&::-webkit-scrollbar": { width: 0, height: 0 },
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 1 }}>
                {itemValues.map((item, idx) => (
                  <CountCard
                    key={idx}
                    HeadTitle={item.HeadTitle}
                    IconCompo={item.IconCompo}
                    Value={item.Value}
                    Navpath={item.navpath}
                  />
                ))}
              </Box>

              {/* <Box sx={{ display: "flex", gap: 2, pt: 4, pb: 4 }}> */}

              {/* <Box sx={{
              width: 400, height: 300, mt: 4, borderRadius: "10px",
              boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px",
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    fill="#8884d8"
                    label
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box> */}
              {/* Payment Received Graph */}
              {/* <Box sx={{ width: 400, height: 300, borderRadius: "10px", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px", p: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Payment Received</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={paymentReceivedGraph}>
                  <XAxis dataKey="done_on" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#0088FE" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
              {/* Withdraw Requested Graph */}
              {/* <Box sx={{ width: 400, height: 300, borderRadius: "10px", boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px", p: 2 }}>
              <Typography variant="h6" align="center" sx={{ mb: 2 }}>Withdraw Requested</Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={withdrawRequestedGraph}>
                  <XAxis dataKey="addedon" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#FF8042" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </Box> */}
              {/* </Box> */}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Mobile View warning*/}
      <SmallScreenError />
    </Box>
  );
};

export default SuperAdminDashboard;
