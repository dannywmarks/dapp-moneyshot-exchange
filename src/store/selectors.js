import { createSelector } from "reselect";
import { get, groupBy, reject, maxBy, minBy } from "lodash";
import { ETHER_ADDRESS, tokens, ether, GREEN, RED } from "../helpers";
import moment from "moment";

const account = (state) => get(state, "web3.account");
export const accountSelector = createSelector(account, (a) => a);

const tokenLoaded = (state) => get(state, "token.loaded", false);
export const tokenLoadedSelector = createSelector(tokenLoaded, (tl) => tl);

const barLoaded = (state) => get(state, "bar.loaded", false);
export const barLoadedSelector = createSelector(barLoaded, (bl) => bl);

const bar = (state) => get(state, "bar.contract");
export const barSelector = createSelector(bar, (b) => b);

// check if both smart contracts are loaded
export const contractsLoadedSelector = createSelector(
  tokenLoaded,
  barLoaded,
  (tl, bl) => tl && bl
);

// All orders
// All Orders
const allOrdersLoaded = (state) => get(state, "bar.allOrders.loaded", false);
const allOrders = (state) => get(state, "bar.allOrders.data", []);

// Cancelled Orders
// Cancelled orders
const cancelledOrdersLoaded = (state) =>
  get(state, "bar.cancelledOrders.loaded", false);
export const cancelledOrdersLoadedSelector = createSelector(
  cancelledOrdersLoaded,
  (loaded) => loaded
);

const cancelledOrders = (state) => get(state, "bar.cancelledOrders.data", []);
export const cancelledOrdersSelector = createSelector(
  cancelledOrders,
  (o) => o
);

// Filled Orders
const filledOrdersLoaded = (state) =>
  get(state, "bar.filledOrders.loaded", false);
export const filledOrdersLoadedSelector = createSelector(
  filledOrdersLoaded,
  (loaded) => loaded
);

const filledOrders = (state) => get(state, "bar.filledOrders.data", []);
export const filledOrdersSelector = createSelector(filledOrders, (orders) => {
  // Decorate orders
  // Sort order by data ascending for display for price comparison
  orders = orders.sort((a, b) => a.timestamp - b.timestamp);

  orders = decorateFilledOrders(orders);
  // sort orders by data descending for display
  orders = orders.sort((a, b) => b.timestamp - a.timestamp);
  return orders;
});

const decorateFilledOrders = (orders) => {
  // Track previous order to compare history
  let previousOrder = orders[0];
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateFilledOrder(order, previousOrder);
    previousOrder = order; // Update the previous order once it's decorated
    return order;
  });
};

const decorateOrder = (order) => {
  // fill in
  let etherAmount;
  let tokenAmount;

  // if tokenGive
  if (order.tokenGive === ETHER_ADDRESS) {
    etherAmount = order.amountGive;
    tokenAmount = order.amountGet;
  } else {
    etherAmount = order.amountGet;
    tokenAmount = order.amountGive;
  }

  // Calculate token price to 5 decimal places
  const precision = 10000;
  let tokenPrice = etherAmount / tokenAmount;
  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return {
    ...order,
    etherAmount: ether(etherAmount),
    tokenAmount: tokens(tokenAmount),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ss a M/D/Y"),
  };
};

const decorateFilledOrder = (order, previousOrder) => {
  return {
    ...order,
    tokenPriceClass: tokenPriceClass(order.tokenPrice, order.id, previousOrder),
  };
};

const tokenPriceClass = (tokenPrice, orderId, previousOrder) => {
  // REDEMPTION
  //Show green price if order price higher than previous order
  //Show red price if order price lower than previous order

  if (previousOrder.id === orderId) {
    return GREEN;
  }

  if (previousOrder.tokenPrice <= tokenPrice) {
    return GREEN; //success
  } else {
    return RED; // danger
  }
};

const openOrders = (state) => {
  const all = allOrders(state);
  const cancelled = cancelledOrders(state);
  const filled = filledOrders(state);

  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id === order.id);
    const orderCancelled = cancelled.some((o) => o.id === order.id);
    return orderFilled || orderCancelled;
  });

  return openOrders;
};

const orderBookLoaded = (state) =>
  cancelledOrdersLoaded(state) &&
  filledOrdersLoaded(state) &&
  allOrdersLoaded(state);

export const orderBookLoadedSelector = createSelector(
  orderBookLoaded,
  (loaded) => loaded
);

// Create Order Book
export const orderBookSelector = createSelector(openOrders, (orders) => {
  //Decorate Orders
  orders = decorateOrderBookOrders(orders);
  // Group orders by "orderType"
  orders = groupBy(orders, "orderType");
  // Fetch buy orders
  const buyOrders = get(orders, "buy", []);
  // Sort orders by token price
  orders = {
    ...orders,
    buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
  };
  const sellOrders = get(orders, "sell", []);
  // Sort orders by token price
  orders = {
    ...orders,
    sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
  };
  return orders;
});

const decorateOrderBookOrders = (orders) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateOrderBookOrder(order);
    return order;
  });
};

const decorateOrderBookOrder = (order) => {
  const orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillClass: orderType === "buy" ? "sell" : "buy",
  };
};

export const myFilledOrdersLoadedSelector = createSelector(
  filledOrdersLoaded,
  (loaded) => loaded
);

export const myFilledOrdersSelector = createSelector(
  account,
  filledOrders,
  (account, orders) => {
    //Find our orders
    orders = orders.filter((o) => o.user === account || o.userFill === account);
    // Sort by date ascending
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);
    // Decorate orders = add display attributes
    orders = decorateMyFilledOrders(orders, account);
    return orders;
  }
);

const decorateMyFilledOrders = (orders, account) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateMyFilledOrder(order, account);
    return order;
  });
};

const decorateMyFilledOrder = (order, account) => {
  const myOrder = order.user === account;

  let orderType;
  if (myOrder) {
    orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";
  } else {
    orderType = order.tokenGive === ETHER_ADDRESS ? "sell" : "buy";
  }

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderSign: orderType === "buy" ? "+" : "-",
  };
};

export const myOpenOrdersLoadedSelector = createSelector(
  orderBookLoaded,
  (loaded) => loaded
);

export const myOpenOrdersSelector = createSelector(
  account,
  openOrders,
  (account, orders) => {
    // Filter orders created by current account
    orders = orders.filter((o) => o.user === account);
    // Decorate orders - add display attributes
    orders = decorateMyOpenOrders(orders);
    // Sort orders by date descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);
    return orders;
  }
);

const decorateMyOpenOrders = (orders, account) => {
  return orders.map((order) => {
    order = decorateOrder(order);
    order = decorateMyOpenOrder(order, account);
    return order;
  });
};

const decorateMyOpenOrder = (order, account) => {
  let orderType = order.tokenGive === ETHER_ADDRESS ? "buy" : "sell";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
  };
};

export const priceChartLoadedSelector = createSelector(
  filledOrdersLoaded,
  (loaded) => loaded
);

export const priceChartSelector = createSelector(filledOrders, (orders) => {
  orders = orders.sort((a, b) => a.timestamp - b.timestamp);
  // decorate orders - add display attributes
  orders = orders.map((o) => decorateOrder(o));
  // Get last 2 orders for final price and price change
  let secondLastOrder, lastOrder;
  [secondLastOrder, lastOrder] = orders.slice(orders.length - 2, orders.length);
  // Get last order price
  const lastPrice = get(lastOrder, "tokenPrice", 0);
  // get second last order price
  const secondLastPrice = get(secondLastOrder, "tokenPrice", 0);

  return {
    lastPrice,
    lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
    series: [
      {
        data: buildGraphData(orders),
      },
    ],
  };
});

const buildGraphData = (orders) => {
  // Group the orders by hour for the graph
  orders = groupBy(orders, (o) =>
    moment.unix(o.timestamp).startOf("hour").format()
  );
  // Get each hour where data exists
  const hours = Object.keys(orders);
  // Build the graph series
  const graphData = hours.map((hour) => {
    // Fetch all the orders from current hour
    const group = orders[hour];
    // Calculate price values - open, high, low, close
    const open = group[0];
    const close = group[group.length - 1]; // last order
    const high = maxBy(group, "tokenPrice"); // high price
    const low = minBy(group, "tokenPrice"); // low price
    return {
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice],
    };
  });
  return graphData;
};

const orderCancelling = (state) =>
  get(state, "exchange.orderCancelling", false);

export const orderCancellingSelector = createSelector(
  orderCancelling,
  (status) => status
);
