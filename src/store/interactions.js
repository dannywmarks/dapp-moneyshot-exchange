import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  barLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled
} from "./actions";
import Web3 from "web3";
import Token from "../abis/Token.json";
import Bar from "../abis/Bar.json";

// handles all blockchain interactions

export const loadWeb3 = async (dispatch) => {
  if (typeof window.ethereum !== "undefined") {
    const web3 = new Web3(window.ethereum);
    dispatch(web3Loaded(web3));
    return web3;
  } else {
    window.alert("Please install MetaMask");
    window.location.assign("https://metamask.io/");
  }
};

export const loadAccount = async (web3, dispatch) => {
  const accounts = await web3.eth.getAccounts();
  const account = await accounts[0];
  if (typeof account !== "undefined") {
    dispatch(web3AccountLoaded(account));
    return account;
  } else {
    window.alert("Please login with MetaMask");
    return null;
  }
};

export const loadToken = async (web3, networkId, dispatch) => {
  try {
    const token = new web3.eth.Contract(
      Token.abi,
      Token.networks[networkId].address
    );
    dispatch(tokenLoaded(token));
    return token;
  } catch (error) {
    console.log(
      "Contract not deployed to the current network. Please select another network with Metamask."
    );
    return null;
  }
};

export const loadBar = async (web3, networkId, dispatch) => {
  try {
    const bar = new web3.eth.Contract(Bar.abi, Bar.networks[networkId].address);
    dispatch(barLoaded(bar));
    return bar;
  } catch (error) {
    console.log(
      "Contract not deployed to the current network. Please select another network with Metamask."
    );
    return null;
  }
};

export const loadAllOrders = async (bar, dispatch) => {
  // Fetch cancelled orders with the "Cancel" event stream
  const cancelStream = await bar.getPastEvents("Cancel", {
    fromBlock: 0,
    toBlock: "latest",
  });
  // Format cancelled orders
  const cancelledOrders = cancelStream.map((event) => event.returnValues);
  console.log("cancel stream, called orders", cancelledOrders);
  // Add cancelled Orders to the redux store
  dispatch(cancelledOrdersLoaded(cancelledOrders));

  // Fetch filled orcders with the "Trade" event stream
  const tradeStream = await bar.getPastEvents("Trade", {
    fromBlock: 0,
    toBlock: "latest",
  });
  // Format filled orders
  const filledOrders = tradeStream.map((event) => event.returnValues);
  console.log("order stream, filled orders", filledOrders);
  // Add filled Orders to the redux store
  dispatch(filledOrdersLoaded(filledOrders));

  // Fetch all orders with the "Order" event stream
  const orderStream = await bar.getPastEvents("Order", {
    fromBlock: 0,
    toBlock: "latest",
  });
  // Format filled orders
  const allOrders = orderStream.map((event) => event.returnValues);
  console.log("orders stream, all orders", allOrders);
  // Add filled Orders to the redux store
  dispatch(allOrdersLoaded(allOrders));
};

export const cancelOrder = (dispatch, bar, order, account) => {
  bar.methods.cancelOrder(order.id).send({ from: account }).on('transactionHash', (hash) => {
    dispatch(orderCancelling())
  })
  .on('error', (error) => {
    console.log(error)
    window.alert('There was an error!')
  });
};

export const subscribeToEvents = async (bar, dispatch) => {
  bar.events.Cancel({}, (error, event) => { 
    dispatch(orderCancelled(event.returnValues))
  })
}
