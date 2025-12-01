import { Button, Card } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

const today = new Date();
export const date = today.toLocaleDateString();
export const time = today.toLocaleTimeString();

export const onDownloadCurrentList = (filename, tableData) => {
  // Remove unwanted fields if needed, or just export as is
  const exportData = tableData.map(({ id, ...rest }) => rest); // remove 'id' if not needed
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, `${filename}`);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const GlassCard = styled(Card)(({ theme }) => ({
  background: "rgba(255,255,255,0.7)",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
  borderRadius: 24,
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.18)",
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: 0,
  flex: 1,
}));

export const AccentButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  fontWeight: 700,
  fontSize: 18,
  minWidth: 140,
  height: 44,
  padding: theme.spacing(0, 3),
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
  color: "#fff",
  '&:hover': {
    background: "linear-gradient(90deg, #0072ff 0%, #00c6ff 100%)",
  }
}));

export const PaymentButton = styled(Button)(({ theme, selected }) => ({
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 16,
  minWidth: 100,
  height: 44,
  margin: theme.spacing(0.5),
  background: selected ? "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)" : "#f4f4f4",
  color: selected ? "#fff" : "#222",
  boxShadow: selected ? "0 2px 8px rgba(67,233,123,0.15)" : "none",
  '&:hover': {
    background: "linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)",
    color: "#fff"
  }
}));

export const formatToINR = (number) => {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

export function useHasVerticalScroll() {
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setHasScroll(
        document.documentElement.scrollHeight >
        document.documentElement.clientHeight
      );
    };

    checkScroll(); // run once on mount
    window.addEventListener("resize", checkScroll);
    window.addEventListener("scroll", checkScroll);

    return () => {
      window.removeEventListener("resize", checkScroll);
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  return hasScroll;
}

export const minDobStr = "1935-01-01";
export const computeMaxDobStr = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  // require strictly older than 18 years -> subtract one day
  d.setDate(d.getDate() - 1);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};
export const maxDobStr = computeMaxDobStr();