import React, { Component } from "react";
import { connect } from "react-redux";
import { barSelector } from "../store/selectors";
import { loadAllOrders, subscribeToEvents } from "../store/interactions";
import DrinkOrders from "../components/DrinkOrders";
import OrderBook from "../components/OrderBook";
import MyTransactions from "../components/MyTransactions"
import PriceChart from './PriceChart'

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
          <div className="card bg-dark text-white">
            <div className="card-header">Card Title</div>
            <div className="card-body">
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <a href="/#" className="card-link">
                Card link
              </a>
            </div>
          </div>
          <div className="card bg-dark text-white">
            <div className="card-header">Card Title</div>
            <div className="card-body">
              <p className="card-text">
                Some quick example text to build on the card title and make up
                the bulk of the card's content.
              </p>
              <a href="/#" className="card-link">
                Card link
              </a>
            </div>
          </div>
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
