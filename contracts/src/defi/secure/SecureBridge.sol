// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IERC20Minimal.sol";

contract SecureBridge {
    IERC20Minimal public immutable wrappedToken;
    uint256 public immutable chainId;

    address public owner;
    uint256 public nonce;
    bool public paused;

    uint256 public constant REQUIRED_VALIDATORS = 2;
    uint256 public constant TIMELOCK_DELAY = 2 days;
    uint256 public constant RATE_LIMIT_PERIOD = 1 hours;
    uint256 public constant RATE_LIMIT_AMOUNT = 100_000 ether;

    bytes32 public constant MESSAGE_TYPEHASH =
        keccak256("Message(address from,address to,uint256 amount,uint256 nonce,uint256 chainId)");
    bytes32 public constant EIP712_DOMAIN_TYPEHASH = keccak256(
        "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
    );
    bytes32 public immutable DOMAIN_SEPARATOR;

    mapping(address => bool) public validators;
    uint256 public validatorCount;
    mapping(bytes32 => bool) public processedMessages;

    uint256 public rateLimitStart;
    uint256 public rateLimitAccumulated;

    address public pendingOwner;
    address public pendingValidator;
    bool public validatorAddPending;
    uint256 public validatorTimelockStart;

    event TokensLocked(address indexed from, address indexed to, uint256 amount, uint256 nonce);
    event WrappedTokensMinted(
        address indexed token, address indexed to, uint256 amount, uint256 nonce
    );
    event TokensBurned(address indexed token, address indexed from, uint256 amount);
    event TokensReleased(address indexed token, address indexed to, uint256 amount, uint256 nonce);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event Paused(address indexed account);
    event Unpaused(address indexed account);
    event OwnershipTransferStarted(address indexed from, address indexed to);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Not validator");
        _;
    }

    constructor(address _wrappedToken) {
        require(_wrappedToken != address(0), "Zero address");
        wrappedToken = IERC20Minimal(_wrappedToken);
        owner = msg.sender;
        validators[msg.sender] = true;
        validatorCount = 1;
        chainId = block.chainid;
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                EIP712_DOMAIN_TYPEHASH,
                keccak256("SecureBridge"),
                keccak256("1"),
                chainId,
                address(this)
            )
        );
        rateLimitStart = block.timestamp;
    }

    function lock(address token, uint256 amount, address to) external whenNotPaused {
        require(token != address(0), "Zero token");
        require(to != address(0), "Zero to");
        require(amount > 0, "Amount must be > 0");
        _checkRateLimit(amount);
        IERC20Minimal(token).transferFrom(msg.sender, address(this), amount);
        nonce++;
        emit TokensLocked(msg.sender, to, amount, nonce);
    }

    function mintWrapped(
        address token,
        uint256 amount,
        address to,
        uint256 _nonce,
        bytes[] memory signatures
    ) external whenNotPaused {
        require(token != address(0), "Zero token");
        require(to != address(0), "Zero to");
        require(amount > 0, "Amount must be > 0");
        bytes32 messageHash =
            keccak256(abi.encode(MESSAGE_TYPEHASH, msg.sender, to, amount, _nonce, chainId));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, messageHash));
        require(!processedMessages[digest], "Message already processed");
        _verifySignatures(digest, signatures);
        processedMessages[digest] = true;
        wrappedToken.transfer(to, amount);
        emit WrappedTokensMinted(token, to, amount, _nonce);
    }

    function burn(address token, uint256 amount) external whenNotPaused {
        require(token != address(0), "Zero token");
        require(amount > 0, "Amount must be > 0");
        wrappedToken.transferFrom(msg.sender, address(this), amount);
        emit TokensBurned(token, msg.sender, amount);
    }

    function release(
        address token,
        uint256 amount,
        address to,
        uint256 _nonce,
        bytes[] memory signatures
    ) external whenNotPaused {
        require(token != address(0), "Zero token");
        require(to != address(0), "Zero to");
        require(amount > 0, "Amount must be > 0");
        bytes32 messageHash =
            keccak256(abi.encode(MESSAGE_TYPEHASH, msg.sender, to, amount, _nonce, chainId));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, messageHash));
        require(!processedMessages[digest], "Message already processed");
        _verifySignatures(digest, signatures);
        processedMessages[digest] = true;
        IERC20Minimal(token).transfer(to, amount);
        emit TokensReleased(token, to, amount, _nonce);
    }

    function _verifySignatures(bytes32 digest, bytes[] memory signatures) internal view {
        require(signatures.length >= REQUIRED_VALIDATORS, "Not enough signatures");
        address[] memory signers = new address[](signatures.length);
        for (uint256 i = 0; i < signatures.length; i++) {
            signers[i] = _recoverSigner(digest, signatures[i]);
            require(validators[signers[i]], "Invalid signer");
            for (uint256 j = 0; j < i; j++) {
                require(signers[j] != signers[i], "Duplicate signer");
            }
        }
    }

    function _recoverSigner(bytes32 digest, bytes memory signature)
        internal
        pure
        returns (address)
    {
        require(signature.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }
        if (v < 27) v += 27;
        require(v == 27 || v == 28, "Invalid signature v");
        return ecrecover(digest, v, r, s);
    }

    function _checkRateLimit(uint256 amount) internal {
        if (block.timestamp >= rateLimitStart + RATE_LIMIT_PERIOD) {
            rateLimitStart = block.timestamp;
            rateLimitAccumulated = 0;
        }
        rateLimitAccumulated += amount;
        require(rateLimitAccumulated <= RATE_LIMIT_AMOUNT, "Rate limit exceeded");
    }

    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Zero address");
        require(!validators[validator], "Already validator");
        validators[validator] = true;
        validatorCount++;
        emit ValidatorAdded(validator);
    }

    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Not validator");
        require(validatorCount > REQUIRED_VALIDATORS, "Cannot remove below threshold");
        validators[validator] = false;
        validatorCount--;
        emit ValidatorRemoved(validator);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    function acceptOwnership() external {
        require(msg.sender == pendingOwner, "Not pending owner");
        owner = pendingOwner;
        pendingOwner = address(0);
    }
}
