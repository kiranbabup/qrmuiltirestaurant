// HomePage.jsx
import React from "react";
import withRouter from "../components/withRouter";
import BaseComponent from "../components/BaseComponent";
import Page1 from "./page1";
import UserMenu from "./UserMenu";

class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  renderTable = (data) => {
    // console.log(data);
    // console.log(data.data.table);
    localStorage.setItem("resloctab", JSON.stringify(data?.data?.table));
    localStorage.setItem("bg", false);
    localStorage.removeItem("oid");

    return (
      <main className="customer-menu-page" ref={this.mainRef}>
        {data?.data?.cartItems?.length >= 1 ? <UserMenu /> : <Page1 />}
        {/* <Page1 data={data} /> */}
      </main>
    );
  };

  render() {
    return (
      <BaseComponent
        render={this.renderTable}
        params={this.props.params}
        // params={this.props.params.id}
        navigate={this.props.navigate}
      />
    );
  }
}

export default withRouter(HomePage);
