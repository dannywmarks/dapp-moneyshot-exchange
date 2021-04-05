import {
  web3Loaded,
  web3AccountLoaded,
  tokenLoaded,
  barLoaded,
} from "./actions";
import Web3 from "web3";
import Token from "../abis/Token.json";
import Bar from "../abis/Bar.json";

// handles all blockchain interactions

export const loadWeb3 = (dispatch) => {
  const web3 = new Web3(window.etherum || "http://localhost:7545");
  dispatch(web3Loaded(web3));
  return web3;
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
    const bar = new web3.eth.Contract(Bar.abi, Bar.networks[networkId].address)
    dispatch(barLoaded(bar))
    return bar
  } catch (error) {
    console.log('Contract not deployed to the current network. Please select another network with Metamask.')
    return null
  }
}
