import Web3 from "web3";
import { contracts_directory } from "../truffle-config";
import { tokens, EVM_REVERT } from "./helpers";

const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Token", ([deployer, receiver]) => {
  const name = "Money Shot";
  const symbol = "M$HOT";
  const decimals = "18";
  const totalSupply = tokens(1000000).toString();
  let token;

  beforeEach(async () => {
    // Fetch token before each test
    token = await Token.new();
  });

  describe("deployment", () => {
    // --- name ---
    it("tracks the name", async () => {
      // Read token here...
      const result = await token.name();
      // Check the token name is MoneyShot
      result.should.equal(name);
    });
    // --- symbol ---
    it("tracks the symbol", async () => {
      // Read symbol here
      const result = await token.symbol();
      result.should.equal(symbol);
    });
    // --- decimal ---
    it("tracks the decimals", async () => {
      const result = await token.decimals();
      result.toString().should.equal(decimals);
    });
    // --- totalsupply ---
    it("tracks the total supply", async () => {
      const result = await token.totalSupply();
      result.toString().should.equal(totalSupply.toString());
    });
    // --- Send Total Supply ---
    it("assigns the total supply to the deployer", async () => {
      const result = await token.balanceOf(deployer);
      result.toString().should.equal(totalSupply.toString());
    });
  });

  describe("sending tokens", () => {
    let result;
    let amount = tokens(100);

    describe("success", async () => {
      beforeEach(async () => {
        // --- transfer ---
        result = await token.transfer(receiver, amount, { from: deployer });
      });

      it("transfers token balances", async () => {
        let balanceOf;
        // --- Balance before transfer ---
        balanceOf = await token.balanceOf(deployer);
        // console.log("deployer balance before transfer", balanceOf.toString());
        balanceOf = await token.balanceOf(receiver);
        // console.log("receiver balance before transfer", balanceOf.toString());

        // --- Balance after transfer ---
        balanceOf = await token.balanceOf(deployer);
        balanceOf.toString().should.equal(tokens(999900).toString());
        balanceOf = await token.balanceOf(receiver);
        balanceOf.toString().should.equal(tokens(100).toString());
      });

      it("emits a transfer efent", async () => {
        const log = result.logs[0];
        log.event.should.eq("Transfer");
        const event = log.args;
        event.from.toString().should.equal(deployer, "from is correct");
        event.to.should.equal(receiver, "to is correct");
        event.value
          .toString()
          .should.equal(amount.toString(), "value is correct");
      });
    });

    describe("failure", async () => {
      it("rejects insufficient balance", async () => {
        let invalidAmount;
        invalidAmount = tokens(100000000); // 100 (million - greater than total supply
        await token
          .transfer(receiver, invalidAmount, { from: deployer })
          .should.be.rejectedWith(EVM_REVERT);

        // Atempt transfer tokens, when you have none
        invalidAmount = tokens(10); // 100 (million - greater than total supply
        await token
          .transfer(receiver, invalidAmount, { from: receiver })
          .should.be.rejectedWith(EVM_REVERT);
      });

      it("rejects invalid recipients", async () => {
        await token
          .transfer(0x0, amount, { from: deployer })
          .should.be.rejected;
      });
    });
  });
});
