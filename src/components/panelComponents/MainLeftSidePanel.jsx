// MainLeftSidePanel
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ClassIcon from "@mui/icons-material/Class";
import FactoryIcon from "@mui/icons-material/Factory";
import GroupIcon from "@mui/icons-material/Group";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import ShoppingBasketIcon from "@mui/icons-material/ShoppingBasket";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import InventoryTwoToneIcon from "@mui/icons-material/InventoryTwoTone";
import Inventory2TwoToneIcon from "@mui/icons-material/Inventory2TwoTone";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import MenuIcon from "@mui/icons-material/Menu";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import BadgeIcon from "@mui/icons-material/Badge";

import companyLogo from "../../data/images/QR_menu_logo.png";
import {
  layoutDarkGreenColor,
  layoutLightGreenColor,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
} from "../../data/contents";
import LsService, { storageKey } from "../../services/localstorage";

const MainLeftSidePanel = ({ user }) => {
  const [open, setOpen] = useState(true); // sidebar expanded/collapsed
  const [sections, setSections] = useState([]);
  const [openSection, setOpenSection] = useState("");
  // console.log(user);
  
  const navigate = useNavigate();
  const location = useLocation();

  const isMobile = useMediaQuery("(max-width:768px)");
  const sidebarWidth = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  const isActiveRoute = (route) => {
    const p = location.pathname;
    // exact or nested (/route/xxx)
    return p === route || p.startsWith(route + "/");
  };

  useEffect(() => {
    if (!user) return;

    if (user.role === "super_admin") {
      setSections(superAdminSections);
    } else if (user.role === "admin") {
      setSections(adminPanelSections);
    } else if (user.role === "dnr_super_admin") {
      setSections(superAdminSectionsDrn);
    }
  }, [user?.role]);

  const getSectionForRoute = (pathname) => {
    const found = sections.find((section) =>
      section.items.some((item) => item.route === pathname)
    );
    return found ? found.title : sections[0]?.title ?? "";
  };

  useEffect(() => {
    if (!sections.length) return;
    setOpenSection(getSectionForRoute(location.pathname) || sections[0].title);
  }, [location.pathname, sections]);

  // Map navItems to icons
  const navIcons = {
    "/dnr_super_admin": <DashboardIcon />,
    "/dnr_billings": <ReceiptLongIcon />,

    "/super_admin": <DashboardIcon />,
    "/admin_panel": <DashboardIcon />,
    "/restaurants_registration": <AddBusinessIcon />,
    "/employees_registration": <BadgeIcon />,
    "/restaurants_list": <FactoryIcon />,

    "/manage_clients": <GroupIcon />,
    "/manage_customers": <GroupIcon />,

    "/store-manager": <DashboardIcon />,
    "/categories": <CategoryIcon />,
    "//suppliers": <BusinessIcon />,
    "/units": <ClassIcon />,
    "/brands": <AssignmentTurnedInIcon />,
    "/inventory": <ShoppingBasketIcon />,
    "/add-to-main": <AddShoppingCartIcon />,
    "/add-store-products": <AddShoppingCartIcon />,
    "/store-pendings": <ProductionQuantityLimitsIcon />,
    "/store-recived-products": <ShoppingBagIcon />,
    "/inventory-by-store": <Inventory2TwoToneIcon />,
    "/confirm-store-inventory": <InventoryTwoToneIcon />,
    "/create-combos": <WorkspacesIcon />,
    "/store-inventory": <ShoppingCartIcon />,
    "/branch-billings": <ReceiptLongIcon />,
    "/display-combos": <ShoppingCartIcon />,
  };

  const superAdminSectionsDrn = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", route: "/dnr_super_admin" },
        { label: "Bills Management", route: "/dnr_billings" },
        // { label: "Manage Branches", route: "/manage_branches" },
      ],
    },
    // {
    //   title: "Register",
    //   items: [
    //     { label: "Register Restaurants", route: "/restaurants_registration" },
    // { label: "Register Employees", route: "/employees_registration" },
    // ],
    // },
  ];

  // sections
  const superAdminSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", route: "/super_admin" },
        { label: "Restaurants List", route: "/restaurants_list" },
        // { label: "Manage Branches", route: "/manage_branches" },
      ],
    },
    {
      title: "Register",
      items: [
        { label: "Register Restaurants", route: "/restaurants_registration" },
        // { label: "Register Employees", route: "/employees_registration" },
      ],
    },
  ];

  const adminPanelSections = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", route: "/admin_panel" },
        { label: "Billings", route: "/branch-billings" },
        { label: "Customers", route: "/manage_customers" },
        { label: "Brands", route: "/brands" },
        { label: "Add Inventory", route: "/add-to-main" },
        { label: "Inventory", route: "/inventory" },
        { label: "Add Combos", route: "/create-combos" },
        { label: "Combos Inventory", route: "/display-combos" },
      ],
    },
  ];

  const onHandleNav = () => {
    if (user?.role === "super_admin") {
      navigate("/super_admin");
    } else if (user?.role === "dnr_super_admin") {
      navigate("/dnr_super_admin");
    } else if (user?.role === "admin") {
      navigate("/admin_panel");
    } else {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 2,
        transition: "width 0.4s cubic-bezier(0.4,0,0.2,1)",
        bgcolor: "white",
      }}
    >
      {/* Toggle button (like your other sidebar) */}
      {!isMobile && (
        <Box
          sx={{
            bgcolor: "white",
            position: "absolute",
            top: 2,
            left: `${sidebarWidth}px`,
            zIndex: 2,
          }}
        >
          <IconButton
            size="small"
            sx={{ color: layoutDarkGreenColor }}
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? <MenuOpenIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      )}

      {/* Header (logo + title) */}
      <Box
        sx={{
          height: "10vh",
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          justifyContent: "center",
          px: open ? 2 : 0,
          bgcolor: "white",
        }}
      >
        <Box
          component="img"
          src={companyLogo}
          alt="Company Logo"
          sx={{
            width: open ? 130 : 40,
            mx: "auto",
            my: 2,
            display: "block",
            transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={onHandleNav}
        />
      </Box>

      {/* Menu sections */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 0.5,
          overflow: "hidden",
        }}
      >
        {sections.map((section, idx) => (
          <Box key={section.title} sx={{ width: "100%", mb: 1 }}>
            {/* Section header – hide text when collapsed */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 0.5,
                cursor: "pointer",
                userSelect: "none",
                px: open ? 0.5 : 0,
              }}
              onClick={() =>
                setOpenSection(
                  openSection === section.title ? "" : section.title
                )
              }
            >
              {open && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ flexGrow: 1 }}
                >
                  {section.title}
                </Typography>
              )}
              {open &&
                (openSection === section.title ? (
                  <KeyboardArrowUpIcon fontSize="small" />
                ) : (
                  <KeyboardArrowDownIcon fontSize="small" />
                ))}
            </Box>

            {/* Items */}
            {(openSection === section.title || !open) && (
              <List disablePadding sx={{ width: "100%" }}>
                {section.items.map((item) => {
                  const active = isActiveRoute(item.route);
                  return (
                    <ListItemButton
                      key={item.route}
                      selected={active}
                      onClick={() => navigate(item.route)}
                      sx={{
                        borderRadius: 2,
                        my: 0.5,
                        minHeight: 40,
                        px: open ? 1.5 : 0.5,
                        justifyContent: open ? "flex-start" : "center",

                        // default / not active
                        bgcolor: layoutDarkGreenColor,
                        "&:hover": {
                          bgcolor: layoutLightGreenColor,
                        },

                        // when active (selected)
                        "&.Mui-selected": {
                          bgcolor: layoutLightGreenColor,
                          "&:hover": {
                            bgcolor: layoutLightGreenColor, // keep it dark on hover too
                          },
                        },

                        transition:
                          "padding 0.3s cubic-bezier(0.4,0,0.2,1), justify-content 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.2s",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 0,
                          mr: open ? 1.5 : 0,
                          justifyContent: "center",
                          color: "white",
                        }}
                      >
                        {navIcons[item.route] || <DashboardIcon />}
                      </ListItemIcon>

                      {open && (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: active ? "bold" : "normal",
                            sx: { color: "white", fontSize: 14 },
                          }}
                        />
                      )}
                    </ListItemButton>
                  );
                })}
              </List>
            )}

            {idx < sections.length - 1 && open && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MainLeftSidePanel;
