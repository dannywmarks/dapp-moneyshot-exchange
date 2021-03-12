pragma solidity ^0.5.0;
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


contract Token {

    using SafeMath for uint;

    // VARIABLES
    string public name = "Money Shot";
    string public symbol = "M$HOT";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track balances
    mapping(address => uint256) public balanceOf;

    // Events
    event Transfer(address indexed from, address to, uint256 value);


    constructor() public {
      totalSupply = 1000000 * (10 ** decimals);
      //msg global variable. sender function
      balanceOf[msg.sender] = totalSupply;
    }

    

    // Send/Transfer Tokens (deduct balance from one account and add to another account)
    // --------------- eip-20 transfer function --------------------

    function transfer(address _to, uint256 _value) public returns (bool success) {
      require(_to != address(0));
      require(balanceOf[msg.sender] >= _value);
      // Decrease balance of sender 
      balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
      // Increase balance of receiver
      balanceOf[_to] = balanceOf[_to].add(_value);
      emit Transfer(msg.sender, _to, _value);
      return true;
    }
}