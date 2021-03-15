import { should } from "chai";
import { iteratee } from "lodash";
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from "./helpers";

const Bar = artifacts.require("./Bar");
const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Bar", ([deployer, feeAccount, user1]) => {
  let token;
  let bar;
  const feePercent = 10;

  beforeEach(async () => {
    // deploy token
    token = await Token.new()

    // deploy exchange
    bar = await Bar.new(feeAccount, feePercent);

    // transfer tokens to user 1
    token.transfer(user1, tokens(100), {from: deployer})
  });

  describe('deployment', () => {
    it('tracks the fee account', async () =>{
      const result = await bar.feeAccount()
      result.should.equal(feeAccount)
    })
    it('tracks the fee percent', async () =>{
      const result = await bar.feePercent()
      result.toString().should.equal(feePercent.toString())
    })
  })

  describe('fallback', () => {
    it('reverts when Ether is sent', async () => {
      await bar.sendTransaction({ value: 1, from: user1}).should.be.rejectedWith(EVM_REVERT)
    })
  })

  describe('despoiting ether', () => {
    let result
    let amount

    beforeEach(async () => {
      amount = ether(1)
      result = await bar.depositEther({ from: user1, value: amount})
    })

    it('tracks the Ether deposit', async () => {
      const balance = await bar.tokens(ETHER_ADDRESS, user1)
      balance.toString().should.equal(amount.toString())
    })

    it('emits a Depoist event', async () => {
      const log = result.logs[0]
      log.event.should.eq('Deposit')
      const event = log.args
      event.token.should.equal(ETHER_ADDRESS, 'token address is correct')
      event.user.should.equal(user1, 'user address is correct')
      event.amount.toString().should.equal(amount.toString(), 'amount is correct')
      event.balance.toString().should.equal(amount.toString(), 'balance is correct')
    })
  })

  describe('withdrawing ether', () => {
    let result
    let amount

    beforeEach(async () => {
      await bar.depositEther({ from: user1, value: ether(1)})
      
    })

    describe('success', async () => {
      beforeEach(async () => {
        // Withdraw Ether
        result = await bar.withdrawEther({ from: user1, value: amount})
      })
    })

    it('tracks the Ether deposit', async () => {
      const balance = await bar.tokens(ETHER_ADDRESS, user1)
      balance.toString().should.equal('0')
    })
  })

  describe('depositing tokens', () => {
    let result;
    let amount;


    describe('success', () => {

      beforeEach(async () => {
        amount = tokens(10)
        await token.approve(bar.address, amount, {from: user1})
        result = await bar.depositToken(token.address, amount, {from: user1})

      })

      it('tracks the token deposit', async () =>{
        // Check bar token balance
        let balance;
        // Checks bars token balance
        balance = await token.balanceOf(bar.address)
        balance.toString().should.equal(amount.toString())
        // Check tokens on bar board
        balance = await bar.tokens(token.address, user1)
        balance.toString().should.equal(amount.toString())
      })
      it('emits a Depoist event', async () => {
        const log = result.logs[0]
        log.event.should.eq('Deposit')
        const event = log.args
        event.token.should.equal(token.address, 'token address is correct')
        event.user.should.equal(user1, 'user address is correct')
        event.amount.toString().should.equal(amount.toString(), 'amount is correct')
        event.balance.toString().should.equal(amount.toString(), 'balance is correct')
      })
    })

    describe('failure', () => {
      it('fails when no tokens are approved', async () => {
        it('rejects ether deposits', async () => {
          await bar.depositToken(ETHER_ADDRESS, tokens(10), { from: user1}).should.be.rejectedWith(EVM_REVERT)
        })
        // Don't approve any tokens before despoiting
        await bar.depositToken(token.address, tokens(10), {from: user1}).should.be.rejectedWith(EVM_REVERT)
      })
    })
  })
});
