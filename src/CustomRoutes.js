import { Navigate, Routes, Route } from "react-router-dom";
import Page404 from "./components/Page404";
// import ProtectedRoute from "./components/ProtectedRoute";
import Page1 from "./demoMenu/page1";
import Page2 from "./demoMenu/page2";
import Page3 from "./demoMenu/page3";

const CustomeRoutes = () => {
  return (
    <Routes>
      {/* home */}
      <Route path="/" element={<Navigate to="/Page1" />} />
      <Route path="/page1" element={<Page1 />} />
      <Route path="/page2" element={<Page2 />} />
      <Route path="/page3" element={<Page3 />} />


      <Route path="/404" element={<Page404 />} />
      {/* <Route path="/customermenu/:id" element={<CustomerMenu />} /> */}

      {/* <Route element={<ProtectedRoute loggedinUserRole="admin" />}> */}

        

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
};

export default CustomeRoutes;
