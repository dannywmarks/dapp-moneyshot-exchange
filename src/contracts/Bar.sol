pragma solidity ^0.5.0;
import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";


// Deposit & Withdraw Funds
// Manage Orders = Make or Cancel
// Trades - Tokens 4 Drinks
// Handle Trades - Charge Fees


// TODO:
// [X] Set the fee of account
// [] Deposit Ether
// [] Withdraw Ether
// [] Deposit Tokens
// [] Withdraw Tokens
// [] Check Balance
// [] Make Order
// [] Cancel Order
// [] Fill Order
// [] Charge fees

contract Bar {

  using SafeMath for uint;
  // Variables
  address public feeAccount; // the account that receives bar exchange fees
  uint256 public feePercent; // the fee percent exchange takes
  address constant ETHER = address(0); // store Ether in tokens mapping with blank address
  mapping(address => mapping(address => uint256)) public tokens;

  // Events
  event Deposit(address token, address user, uint256 amount, uint256 balance);

// Fee Account
  constructor(address _feeAccount, uint _feePercent) public {
    feeAccount = _feeAccount;
    feePercent = _feePercent;
  }

  // Fallback: reverts if Ether is sent to this smart contract by mistake

  function() external {
    revert();
  }

  function depositEther() payable public {
    tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
    emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
  }

  function withdrawEther(uint, _amount) public {
    tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(msg.value);
  }

  function depositToken(address _token, uint _amount) public {
    // Don't allow Ether Deposits
    require(_token != ETHER);
    require(Token(_token).transferFrom(msg.sender, address(this), _amount));
    tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
    emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
   
  }
}