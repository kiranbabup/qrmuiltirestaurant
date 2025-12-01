import { projectBackgroundColor } from "../../data/contents"

export const lrgScreenStyle = {
          width: "100%",
          height: "100vh",
          flex: 1,
          display: { md: "flex", xs: "none" },
          flexDirection: "column",
        }
export const headerBoxStyle = {
            width: "100%",
            bgcolor: projectBackgroundColor,
            position: "sticky",
            zIndex: 1,
            borderBottom: "1px solid #E4E7EC",
            top: 0,
            height: "fit-content",
          }
export const rightInnerBoxStyle =  {
            overflowY: "auto",
            "&::-webkit-scrollbar": { width: 0, height: 0 },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }