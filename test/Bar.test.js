import { should } from "chai";
import { iteratee } from "lodash";
import { ButtonToolbar } from "react-bootstrap";
import { tokens, ether, EVM_REVERT, ETHER_ADDRESS } from "./helpers";

const Bar = artifacts.require("./Bar");
const Token = artifacts.require("./Token");

require("chai").use(require("chai-as-promised")).should();

contract("Bar", ([deployer, feeAccount, user1, user2]) => {
  let token;
  let bar;
  const feePercent = 10;

  beforeEach(async () => {
    // deploy token
    token = await Token.new();

    // deploy exchange
    bar = await Bar.new(feeAccount, feePercent);

    // transfer tokens to user 1
    token.transfer(user1, tokens(100), { from: deployer });
  });

  describe("deployment", () => {
    it("tracks the fee account", async () => {
      const result = await bar.feeAccount();
      result.should.equal(feeAccount);
    });
    it("tracks the fee percent", async () => {
      const result = await bar.feePercent();
      result.toString().should.equal(feePercent.toString());
    });
  });

  describe("fallback", () => {
    it("reverts when Ether is sent", async () => {
      await bar
        .sendTransaction({ value: 1, from: user1 })
        .should.be.rejectedWith(EVM_REVERT);
    });
  });

  describe("despoiting ether", () => {
    let result;
    let amount;

    beforeEach(async () => {
      amount = ether(1);
      result = await bar.depositEther({ from: user1, value: amount });
    });

    it("tracks the Ether deposit", async () => {
      const balance = await bar.tokens(ETHER_ADDRESS, user1);
      balance.toString().should.equal(amount.toString());
    });

    it("emits a Depoist event", async () => {
      const log = result.logs[0];
      log.event.should.eq("Deposit");
      const event = log.args;
      event.token.should.equal(ETHER_ADDRESS, "token address is correct");
      event.user.should.equal(user1, "user address is correct");
      event.amount
        .toString()
        .should.equal(amount.toString(), "amount is correct");
      event.balance
        .toString()
        .should.equal(amount.toString(), "balance is correct");
    });
  });

  describe("withdrawing ether", () => {
    let result;
    let amount;

    beforeEach(async () => {
      // Deposit Ether first
      amount = ether(1);
      result = await bar.depositEther({ from: user1, value: amount });
    });

    describe("success", () => {
      beforeEach(async () => {
        // Withdraw Ether
        result = await bar.withdrawEther(amount, { from: user1 });
      });

      it("withdraws Ether funds", async () => {
        const balance = await bar.tokens(ETHER_ADDRESS, user1);
        balance.toString().should.equal("0");
      });

      it('emits a "Withdraw" event', () => {
        const log = result.logs[0];
        log.event.should.eq("Withdraw");
        const event = log.args;
        event.token.should.equal(ETHER_ADDRESS);
        event.user.should.equal(user1);
        event.amount.toString().should.equal(amount.toString());
        event.balance.toString().should.equal("0");
      });
    });

    describe("failure", () => {
      it("it rejects withdraws for insufficient balances", async () => {
        await bar
          .withdrawEther(ether(100), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("depositing tokens", () => {
    let result;
    let amount;

    describe("success", () => {
      beforeEach(async () => {
        amount = tokens(10);
        await token.approve(bar.address, amount, { from: user1 });
        result = await bar.depositToken(token.address, amount, { from: user1 });
      });

      it("tracks the token deposit", async () => {
        // Check bar token balance
        let balance;
        // Checks bars token balance
        balance = await token.balanceOf(bar.address);
        balance.toString().should.equal(amount.toString());
        // Check tokens on bar board
        balance = await bar.tokens(token.address, user1);
        balance.toString().should.equal(amount.toString());
      });
      it("emits a Depoist event", async () => {
        const log = result.logs[0];
        log.event.should.eq("Deposit");
        const event = log.args;
        event.token.should.equal(token.address, "token address is correct");
        event.user.should.equal(user1, "user address is correct");
        event.amount
          .toString()
          .should.equal(amount.toString(), "amount is correct");
        event.balance
          .toString()
          .should.equal(amount.toString(), "balance is correct");
      });
    });

    describe("failure", () => {
      it("fails when no tokens are approved", async () => {
        it("rejects ether deposits", async () => {
          await bar
            .depositToken(ETHER_ADDRESS, tokens(10), { from: user1 })
            .should.be.rejectedWith(EVM_REVERT);
        });
        // Don't approve any tokens before despoiting
        await bar
          .depositToken(token.address, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("withdrawing tokens", () => {
    let result;
    let amount;

    describe("success", () => {
      beforeEach(async () => {
        // Deposit tokens first
        amount = tokens(10);
        await token.approve(bar.address, amount, { from: user1 });
        await bar.depositToken(token.address, amount, { from: user1 });

        // Withdraw tokens
        result = await bar.withdrawToken(token.address, amount, {
          from: user1,
        });
      });
      it("withdraws token funds", async () => {
        const balance = await bar.tokens(token.address, user1);
        balance.toString().should.equal("0");
      });
      it('emits a "Withdraw" event', () => {
        const log = result.logs[0];
        log.event.should.eq("Withdraw");
        const event = log.args;
        event.token.should.equal(token.address);
        event.user.should.equal(user1);
        event.amount.toString().should.equal(amount.toString());
        event.balance.toString().should.equal("0");
      });
    });
    describe("failure", () => {
      it("rejects Ether withdraws", async () => {
        await bar
          .withdrawToken(ETHER_ADDRESS, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
      it("fails for insufficient balance", async () => {
        // Attempt to withdraw tokens without depositing any first
        await bar
          .withdrawToken(token.address, tokens(10), { from: user1 })
          .should.be.rejectedWith(EVM_REVERT);
      });
    });
  });

  describe("checking balances", async () => {
    beforeEach(async () => {
      bar.depositEther({ from: user1, value: ether(1) });
    });

    it("returns user balance", async () => {
      const result = await bar.balanceOf(ETHER_ADDRESS, user1);
      result.toString().should.equal(ether(1).toString());
    });
  });

  describe("making orders", async () => {
    let result;

    beforeEach(async () => {
      result = await bar.makeOrder(
        token.address,
        tokens(1),
        ETHER_ADDRESS,
        ether(1),
        { from: user1 }
      );
    });

    it("tracks the newly created order", async () => {
      const orderCount = await bar.orderCount();
      orderCount.toString().should.equal("1");
      const order = await bar.orders("1");
      order.id.toString().should.equal("1", "id is correct");
      order.user.should.equal(user1, "user is correct");
      order.tokenGet.should.equal(token.address, "tokenGet is correct");
      order.amountGet
        .toString()
        .should.equal(tokens(1).toString(), "amountGet is correct");
      order.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct");
      order.amountGive
        .toString()
        .should.equal(ether(1).toString(), "amountGive is correct");
      order.timestamp
        .toString()
        .length.should.be.at.least(1, "timestamp is present");
    });

    it('emits an "Order" vent', () => {
      const log = result.logs[0];
      log.event.should.eq("Order");
      const event = log.args;
      event.id.toString().should.equal("1", "id is correct");
      event.user.should.equal(user1, "user is correct");
      event.tokenGet.should.equal(token.address, "tokenGet is correct");
      event.amountGet
        .toString()
        .should.equal(tokens(1).toString(), "amountGet is correct");
      event.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct");
      event.amountGive
        .toString()
        .should.equal(ether(1).toString(), "amountGive is correct");
      event.timestamp
        .toString()
        .length.should.be.at.least(1, "timestamp is present");
    });
  });

  describe("order actions", async () => {
    beforeEach(async () => {
      // user1 deposits ether
      await bar.depositEther({ from: user1, value: ether(1) });
      // give tokens to user2
      await token.transfer(user2, tokens(100), { from: deployer });
      // user2 deposits tokens only
      await token.approve(bar.address, tokens(2), { from: user2 });
      await bar.depositToken(token.address, tokens(2), { from: user2 });
      // user1 makes an order to buy tokens with Ether
      await bar.makeOrder(token.address, tokens(1), ETHER_ADDRESS, ether(1), {
        from: user1,
      });
    });

    describe("filling orders", async () => {
      let result;

      describe("success", async () => {
        beforeEach(async () => {
          // user2 fills order
          result = await bar.fillOrder("1", { from: user2 });
        });

        it("executes the trade and charges fees", async () => {
          let balance;
          balance = await bar.balanceOf(token.address, user1);
          balance
            .toString()
            .should.equal(tokens(1).toString(), "user1 received tokens");
          balance = await bar.balanceOf(ETHER_ADDRESS, user2);
          balance
            .toString()
            .should.equal(ether(1).toString(), "user2 received Ether");
          balance = await bar.balanceOf(ETHER_ADDRESS, user1);
          balance.toString().should.equal("0", "user2 Ether deducted");
          balance = await bar.balanceOf(token.address, user2);
          balance
            .toString()
            .should.equal(
              tokens(0.9).toString(),
              "user2 tokens deducted with fee applied"
            );
          const feeAccount = await bar.feeAccount();
          balance = await bar.balanceOf(token.address, feeAccount);
          balance
            .toString()
            .should.equal(tokens(0.1).toString(), "feeAccount received fee");
        });

        it("updates filled orders", async () => {
          const orderFilled = await bar.orderFilled(1);
          orderFilled.should.equal(true);
        });

        it('emits an "Trade" event', async () => {
          const log = result.logs[0];
          log.event.should.eq("Trade");
          const event = log.args;
          event.id.toString().should.equal("1", "id is correct");
          event.user.should.equal(user1, "user is correct");
          event.tokenGet.should.equal(token.address, "tokenGet is correct");
          event.amountGet
            .toString()
            .should.equal(tokens(1).toString(), "amountGet is correct");
          event.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct");
          event.amountGive
            .toString()
            .should.equal(ether(1).toString(), "amountGive is correct");
          event.userfill.should.equal(user2, "userfill is correct");
          event.timestamp
            .toString()
            .length.should.be.at.least(1, "timestamp is present");
        });
      });

      describe("failure", async () => {
        it("rejects invalid order ids", async () => {
          const invalidOrderId = 99999;
          await bar
            .fillOrder(invalidOrderId, { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it("rejects already-filled orders", async () => {
          // Fill the order
          await bar.fillOrder("1", { from: user2 }).should.be.fulfilled;
          // Try to fill it again
          await bar
            .fillOrder("1", { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });

        it("rejects cancelled orders", async () => {
          // Cancl the order
          await bar.cancelOrder("1", { from: user1 }).should.be.fulfilled;
          // Try to fill the order
          await bar
            .fillOrder("1", { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });
      });
    });

    describe("cancelling orders", async () => {
      let result;

      describe("success", async () => {
        beforeEach(async () => {
          result = await bar.cancelOrder("1", { from: user1 });
        });

        it("updates cancelled orders", async () => {
          const orderCancelled = await bar.orderCancelled(1);
          orderCancelled.should.equal(true);
        });

        it('emits an "Cancel" vent', () => {
          const log = result.logs[0];
          log.event.should.eq("Cancel");
          const event = log.args;
          event.id.toString().should.equal("1", "id is correct");
          event.user.should.equal(user1, "user is correct");
          event.tokenGet.should.equal(token.address, "tokenGet is correct");
          event.amountGet
            .toString()
            .should.equal(tokens(1).toString(), "amountGet is correct");
          event.tokenGive.should.equal(ETHER_ADDRESS, "tokenGive is correct");
          event.amountGive
            .toString()
            .should.equal(ether(1).toString(), "amountGive is correct");
          event.timestamp
            .toString()
            .length.should.be.at.least(1, "timestamp is present");
        });
      });

      describe("failure", async () => {
        it("rejects invalid order ids", async () => {
          const invalidOrderId = 9999;
          await bar
            .cancelOrder(invalidOrderId, { from: user2 })
            .should.be.rejectedWith(EVM_REVERT);
        });
      });
    });
  });
});
