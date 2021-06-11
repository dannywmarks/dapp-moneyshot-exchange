import React, { Component } from "react";
import { connect } from "react-redux";
import { barSelector } from "../store/selectors";
import { loadAllOrders, subscribeToEvents } from "../store/interactions";
import DrinkOrders from "../components/DrinkOrders";
import OrderBook from "../components/OrderBook";
import MyTransactions from "../components/MyTransactions"
import PriceChart from './PriceChart'
import Balance from './Balance'
import NewOrder from './NewOrder'

class Content extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props);
  }

  async loadBlockchainData(props) {
    const { bar, dispatch} = props
    await loadAllOrders(bar, dispatch);
    await subscribeToEvents(bar, dispatch)
  }

  render() {
    return (
      <div className="content">
        <div className="vertical-split">
          <Balance />
          <NewOrder />
        </div>
        <OrderBook />
        <div className="vertical-split">
          <PriceChart />
         <MyTransactions />
        </div>

        <DrinkOrders />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    bar: barSelector(state),
  };
}

export default connect(mapStateToProps)(Content);
