import React, { Component } from "react";
import "./App.css";
import Web3 from "web3";
import Token from '../abis/Token.json'
import {loadAccount, loadWeb3, loadToken, loadBar} from '../store/interactions'
import {connect} from 'react-redux'



class App extends Component {
  componentDidMount() {
    this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {
    
    const web3 = await loadWeb3(dispatch)
    
    const network = await web3.eth.net.getNetworkType()
    const networkId = await web3.eth.net.getId()
    const chainId = await web3.eth.getChainId();
    const accounts = await loadAccount(web3, dispatch)
    const abi = Token.abi
    const networks = Token.networks

    console.log("chainId:", chainId)
    console.log("network:", network)
    console.log("networkId:",networkId)
    console.log("accounts:", accounts)
    console.log("networks:", networks)
    console.log("network data:", Token.networks[networkId])
    console.log("abi:", abi)
    console.log('address:', Token.networks[networkId].address)
    const token = loadToken(web3, networkId, dispatch)
    loadBar(web3,networkId, dispatch)
    console.log("token:", token)
    // const totalSupply = await token.methods.totalSupply().call()
    // console.log('token total supply', totalSupply)
  }

  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
          <a className="navbar-brand" href="/#">
            Money$hot Drink Board
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarNavDropdown"
            aria-controls="navbarNavDropdown"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNavDropdown">
            <ul className="navbar-nav">
              <li className="nav-item">
                <a className="nav-link" href="/#">
                  Link 1
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">
                  Link 2
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/#">
                  Link 3
                </a>
              </li>
            </ul>
          </div>
        </nav>
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
          <div className="vertical">
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
          <div className="vertical">
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
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
 
  }
}

export default connect(mapStateToProps)
  (App);
