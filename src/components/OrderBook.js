import React, { Component } from "react";
import { connect } from "react-redux";
import { 
  orderBookLoadedSelector, 
  orderBookSelector, 
  barSelector, 
  accountSelector,
  orderFillingSelector, 
} from "../store/selectors";
import Spinner from "./Spinner"
import {OverlayTrigger, Tooltip} from 'react-bootstrap';
import { fillOrder } from '../store/interactions'

const renderOrder = (order, props) => {
  const {dispatch, bar, account } = props
  return (
    <OverlayTrigger
      key={order.id}
      placement="auto"
      overlay={
        <Tooltip id={order.id}>
          {`Click here to ${order.orderFillAction}`}
        </Tooltip>
      }
    >
      <tr 
        key={order.id}
        className="order-book-order"
        onClick = {(e) => fillOrder(dispatch, bar, order, account)}
      >
        <td>{order.tokenAmount}</td>
        <td className={`text-${order.orderTypeClass}`}>{order.tokenPrice}</td>
        <td>{order.etherAmount}</td>
      </tr>
    </OverlayTrigger>
  );
};

const showOrderBook = (props) => {
  // render orders...
  const { orderBook } = props;
  return (
    <tbody>
      {orderBook.sellOrders.map((order) => renderOrder(order, props))}
      <tr>
        <th>SHOT</th>
        <th>SHOT/ETH</th>
        <th>ETH</th>
      </tr>
      {orderBook.buyOrders.map((order) => renderOrder(order, props))}
    </tbody>
  );
};

export class OrderBook extends Component {
  render() {
    console.log(this.props.showOrderBook, this.props.orderBook);
    return (
      <div className="vertical">
        <div className="card bg-dark text-white">
          <div className="card-header">Order Book</div>
          <div className="card-body order-book">
            <table className="table table-dark table-sm small">
              {this.props.showOrderBook ? (
                showOrderBook(this.props)
              ) : (
                <Spinner type="table" />
              )}
            </table>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const orderBookLoaded = orderBookLoadedSelector(state)
  const orderFilling = orderFillingSelector(state)
  return {
    orderBook: orderBookSelector(state),
    showOrderBook: orderBookLoaded && !orderFilling,
    account: accountSelector(state),
    bar: barSelector(state)
  };
}

export default connect(mapStateToProps)(OrderBook);
