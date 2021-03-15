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
    // key Address of deployers, mapping of all the addresses the Bar can spend
    mapping(address => mapping(address => uint256)) public allowance;
    // Events
    event Transfer(address indexed from, address  indexed to, uint256 value);
    event Approve(address indexed owner, address indexed spender, uint256 value);


    constructor() public {
      totalSupply = 1000000 * (10 ** decimals);
      //msg global variable. sender function
      balanceOf[msg.sender] = totalSupply;
    }

    

    // Send/Transfer Tokens (deduct balance from one account and add to another account)
    // --- eip-20 transfer function ---


    function transfer(address _to, uint256 _value) public returns (bool success) {
      require(balanceOf[msg.sender] >= _value);
      _transfer(msg.sender, _to, _value);
      return true;
    }

     function _transfer(address _from, address _to, uint256 _value) internal {
      require(_to != address(0));
       // Decrease balance of sender 
      balanceOf[_from] = balanceOf[_from].sub(_value);
      // Increase balance of receiver
      balanceOf[_to] = balanceOf[_to].add(_value);
      emit Transfer(_from, _to, _value);
    }


    // --- Approve tokens --- 
    function approve(address _spender, uint256 _value) public returns (bool success) {
      require(_spender != address(0));
      allowance[msg.sender][_spender] = _value;
      emit Approve(msg.sender, _spender, _value);
      return true;
    }

   

    // --- TransferFrom ---
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      require(_value <= balanceOf[_from]);
      require(_value <= allowance[_from][msg.sender]);
      allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
      _transfer(_from, _to, _value);
      return true;
    }
}