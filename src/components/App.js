import React, { Component } from "react";
import "./App.css";
import Token from "../abis/Token.json";
import {
  loadAccount,
  loadWeb3,
  loadToken,
  loadBar,
} from "../store/interactions";
import { connect } from "react-redux";
import Navbar from "./Navbar";
import Content from "./Content";
import { contractsLoadedSelector } from "../store/selectors";

class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch);
  }

  async loadBlockchainData(dispatch) {
    const web3 = await loadWeb3(dispatch);

    const network = await web3.eth.net.getNetworkType();
    const networkId = await web3.eth.net.getId();
    const chainId = await web3.eth.getChainId();
    const accounts = await loadAccount(web3, dispatch);
    const abi = Token.abi;
    const networks = Token.networks;

    console.log("chainId:", chainId);
    console.log("network:", network);
    console.log("networkId:", networkId);
    console.log("accounts:", accounts);
    console.log("networks:", networks);
    console.log("network data:", Token.networks[networkId]);
    console.log("abi:", abi);
    // console.log("address:", Token.networks[networkId].address);

    const token = await loadToken(web3, networkId, dispatch);
    if (!token) {
      window.alert(
        "Token smart contract not detected on the current network. Please select another network"
      );
    }
    const bar = await loadBar(web3, networkId, dispatch);
    if (!bar) {
      window.alert(
        "Bar smart contract not detected on the current network. Please select another network"
      );
    }
    console.log("token:", token);

    // const totalSupply = await token.methods.totalSupply().call()
    // console.log('token total supply', totalSupply)
  }

  render() {
    return (
      <div>
        <Navbar />
        {this.props.contractsLoaded ? (
          <Content />
        ) : (
          <div className="content"></div>
        )}
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    contractsLoaded: contractsLoadedSelector(state),
  };
}

export default connect(mapStateToProps)(App);
