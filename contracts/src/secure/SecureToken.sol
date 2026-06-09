// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Access control, supply cap, timelock on sensitive operations
contract SecureToken {
    string public name = "SecureToken";
    string public symbol = "SEC";
    uint8 public decimals = 18;

    uint256 public totalSupply;
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10 ** 18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;
    uint256 public mintDeadline;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        mintDeadline = block.timestamp + 365 days;
    }

    // SECURE: Only owner can mint, subject to cap and deadline
    function mint(address to, uint256 amount) external onlyOwner {
        require(block.timestamp < mintDeadline, "Mint period ended");
        require(totalSupply + amount <= MAX_SUPPLY, "Supply cap exceeded");
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    // SECURE: Allowance management with events
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Allowance exceeded");
        allowance[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(to != address(0), "Transfer to zero");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
}
