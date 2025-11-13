// BaseComponent.js
import React from "react";
import withRouter from "./withRouter";
import { Box } from "@mui/material";
import "./BaseComp.css";
import { fetchQRStatsByTableId, getMenuById } from "../services/api";

class BaseComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: null,
      codeData: "Loading... Please wait...",
    };
  }

  async componentDidMount() {
    const { id } = this.props.params; // comes from react-router (withRouter)

    if (id) {
      try {
        // call your MySQL API
        const res = await fetchQRStatsByTableId(id);
        // const res = await getMenuById(id);
        // assuming your API returns: { success: true, data: {...} } OR just the object
        // adjust based on your real API response
        const apiData = res.data;

        // if your API returns the menu array directly:
        this.setState({ data: apiData });

        // if your API returns like { data: { menu: [...] } }, then do:
        // this.setState({ data: apiData.data });

      } catch (err) {
        console.error("Error fetching menu:", err);
        // you can navigate to 404 if you want
        if (this.props.navigate) {
          this.props.navigate("/404");
        }
      }
    }
  }

  render() {
    const { data } = this.state;

    if (!data) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "10vh",
          }}
        >
          <div className="dot-loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </Box>
      );
    }

    // pass the fetched data to the render prop
    return <>{this.props.render(data)}</>;
  }
}

export default withRouter(BaseComponent);