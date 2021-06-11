import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  barLoaded,
  cancelledOrdersLoaded,
  filledOrdersLoaded,
  allOrdersLoaded,
  orderCancelling,
  orderCancelled,
  orderFilling,
  orderFilled,
  etherBalanceLoaded,
  tokenBalanceLoaded,
  barEtherBalanceLoaded,
  barTokenBalanceLoaded,
  balancesLoaded,
  balancesLoading,
  buyOrderMaking,
  sellOrderMaking,
  orderMade
} from "./actions";
import Web3 from "web3";
import Token from "../abis/Token.json";
import Bar from "../abis/Bar.json";
import { ETHER_ADDRESS } from "../helpers";

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

export const subscribeToEvents = async (bar, dispatch) => {
  bar.events.Cancel({}, (error, event) => {
    dispatch(orderCancelled(event.returnValues));
  });
  bar.events.Trade({}, (error, event) => {
    dispatch(orderFilled(event.returnValues));
  });
  bar.events.Deposit({}, (error, event) => {
    dispatch(balancesLoaded())
  })
  bar.events.Withdraw({}, (error, event) => {
    dispatch(balancesLoaded())
  })
  bar.events.Order({}, (error, event) => {
    dispatch(orderMade(event.returnValues))
  })
};

export const cancelOrder = (dispatch, bar, order, account) => {
  bar.methods
    .cancelOrder(order.id)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      dispatch(orderCancelling());
    })
    .on("error", (error) => {
      console.log(error);
      window.alert("There was an error!");
    });
};

export const fillOrder = (dispatch, bar, order, account) => {
  bar.methods
    .fillOrder(order.id)
    .send({ from: account })
    .on("transactionHash", (hash) => {
      dispatch(orderFilling());
    })
    .on("error", (error) => {
      console.log(error);
      window.alert("There was an error!");
    });
};

export const loadBalances = async (dispatch, web3, bar, token, account) => {
 
  if(typeof account !== 'undefined') {
      // Ether balance in wallet
      const etherBalance = await web3.eth.getBalance(account)
      dispatch(etherBalanceLoaded(etherBalance))

      // Token balance in wallet
      const tokenBalance = await token.methods.balanceOf(account).call()
      dispatch(tokenBalanceLoaded(tokenBalance))

      // Ether balance in bar
      const barEtherBalance = await bar.methods.balanceOf(ETHER_ADDRESS, account).call()
      dispatch(barEtherBalanceLoaded(barEtherBalance))

      // Token balance in bar
      const barTokenBalance = await bar.methods.balanceOf(token.options.address, account).call()
      dispatch(barTokenBalanceLoaded(barTokenBalance))

      // Trigger all balances loaded
      dispatch(balancesLoaded())
    } else {
      window.alert('Please login with MetaMask')
    }
}

export const depositEther = (dispatch, bar, web3, amount, account) => {
  bar.methods.depositEther().send({ from: account,  value: web3.utils.toWei(amount, 'ether') })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const withdrawEther = (dispatch, bar, web3, amount, account) => {
  bar.methods.withdrawEther().send({ from: account,  value: web3.utils.toWei(amount, 'ether') })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const depositToken = (dispatch, bar, web3, token, amount, account) => {
  amount = web3.utils.toWei(amount, 'ether')

  token.methods.approve(bar.options.address, amount).send({ from: account })
  .on('transactionHash', (hash) => {
    bar.methods.depositToken(token.options.address, amount).send({ from: account })
    .on('transactionHash', (hash) => {
      dispatch(balancesLoading())
    })
    .on('error',(error) => {
      console.error(error)
      window.alert(`There was an error!`)
    })
  })
}

export const withdrawToken = (dispatch, bar, web3, token, amount, account) => {
  bar.methods.withdrawToken(token.options.address, web3.utils.toWei(amount, 'ether')).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(balancesLoading())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const makeBuyOrder = (dispatch, bar, token, web3, order, account) => {
  const tokenGet = token.options.address
  const amountGet = web3.utils.toWei(order.amount, 'ether')
  const tokenGive = ETHER_ADDRESS
  const amountGive = web3.utils.toWei((order.amount * order.price).toString(), 'ether')

  bar.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(buyOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}

export const makeSellOrder = (dispatch, bar, token, web3, order, account) => {
  const tokenGet = ETHER_ADDRESS
  const amountGet = web3.utils.toWei((order.amount * order.price).toString(), 'ether')
  const tokenGive = token.options.address
  const amountGive = web3.utils.toWei(order.amount, 'ether')

  bar.methods.makeOrder(tokenGet, amountGet, tokenGive, amountGive).send({ from: account })
  .on('transactionHash', (hash) => {
    dispatch(sellOrderMaking())
  })
  .on('error',(error) => {
    console.error(error)
    window.alert(`There was an error!`)
  })
}