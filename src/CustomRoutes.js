import { Navigate, Routes, Route } from "react-router-dom";
import Page404 from "./components/Page404";

import HomePage from "./userMenu/HomePage";
import Menu from "./userMenu/Menu";
// import Cart from "./userMenu/Cart";
import Order from "./userMenu/Order";
import BillingPage from "./userMenu/BillingPage";
import FinalPage from "./userMenu/FinalPage";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./LoginPage";
import SuperAdminDashboard from "./panelPages/superAdmin/SuperAdminDashboard";
import RestaurantsManagement from "./panelPages/superAdmin/RestaurantsManagement";
import CreateRestaurant from "./panelPages/superAdmin/CreateRestaurant";
import VeiwRestaurantes from "./panelPages/superAdmin/VeiwRestaurantes";

const CustomeRoutes = () => {
  return (
    <Routes>
      {/* home */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/404" element={<Page404 />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/home/:id" element={<HomePage />} />

      <Route path="/menu" element={<Menu />} />
      {/* <Route path="/cart" element={<Cart />} /> */}
      <Route path="/my_order" element={<Order />} />
      <Route path="/bill" element={<BillingPage />} />
      <Route path="/thank-you" element={<FinalPage />} />

      <Route element={<ProtectedRoute loggedinUserRole="super_admin" />}>
        <Route path="/super_admin" element={<SuperAdminDashboard />} />
        <Route path="/create_restaurant" element={<CreateRestaurant />} />
        <Route path="/restaurants_list" element={<VeiwRestaurantes />} />

        <Route path="/restaurants_management" element={<RestaurantsManagement />} />
      </Route>


      <Route element={<ProtectedRoute loggedinUserRole="restaurant_admin" />}>
        {/* <Route path="/store-manager" element={<StoreAdminDashboard />} /> */}
      </Route>

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default CustomeRoutes;
