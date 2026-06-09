// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

// VULNERABLE: intentionally insecure for educational purposes.
contract VulnerableStablecoin {
    string public name = "Vulnerable Stablecoin";
    string public symbol = "vUSD";
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    IERC20Minimal public collateralToken;
    address public priceOracle;

    mapping(address => uint256) public depositedCollateral;

    constructor(address _collateralToken, address _priceOracle) {
        collateralToken = IERC20Minimal(_collateralToken);
        priceOracle = _priceOracle;
    }

    function depositCollateral(uint256 amount) external {
        collateralToken.transferFrom(msg.sender, address(this), amount);
        depositedCollateral[msg.sender] += amount;
    }

    function mint(uint256 amount) external {
        uint256 price = _getPrice();
        uint256 maxMint = (depositedCollateral[msg.sender] * price * 200) / (1e18 * 100);
        require(amount <= maxMint, "Exceeds max mint amount");
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
    }

    function redeem(uint256 amount) external {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        uint256 collateralReturn = (depositedCollateral[msg.sender] * amount) / totalSupply;
        if (collateralReturn > depositedCollateral[msg.sender]) {
            collateralReturn = depositedCollateral[msg.sender];
        }
        balanceOf[msg.sender] -= amount;
        totalSupply -= amount;
        depositedCollateral[msg.sender] -= collateralReturn;
        collateralToken.transfer(msg.sender, collateralReturn);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        require(balanceOf[from] >= amount, "Insufficient balance");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function _getPrice() internal view returns (uint256) {
        (bool success, bytes memory data) =
            priceOracle.staticcall(abi.encodeWithSignature("getPrice()"));
        require(success, "Oracle call failed");
        return abi.decode(data, (uint256));
    }

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
