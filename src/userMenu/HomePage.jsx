// HomePage.jsx
import React from "react";
import withRouter from "../components/withRouter";
import BaseComponent from "../components/BaseComponent";
import Page1 from "./page1";
import Menu from "./Menu";

class HomePage extends React.Component {
  constructor(props) {
    super(props);
  }

  renderTable = (data) => {
    console.log(data);
    const cart = JSON.parse(localStorage.getItem("dishs"));
    console.log(cart);

    return (
      <main className="customer-menu-page" ref={this.mainRef}>
        {cart?.length >= 1 ? <Menu data={data} /> : <Page1 data={data} />}
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
