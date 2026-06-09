// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Supply cap, metadata freeze, access control
contract SecureNFT {
    string public name = "SecureNFT";
    string public symbol = "SNFT";

    uint256 public constant MAX_SUPPLY = 10_000;
    uint256 public totalSupply;
    bool public metadataFrozen;

    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public getApproved;

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // SECURE: Only owner can mint, subject to supply cap
    function mint(address to, string calldata tokenURI_) external onlyOwner returns (uint256) {
        require(totalSupply < MAX_SUPPLY, "Max supply reached");
        uint256 tokenId = totalSupply + 1;
        _mint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        return tokenId;
    }

    // SECURE: Metadata can be frozen to prevent future changes
    function freezeMetadata() external onlyOwner {
        metadataFrozen = true;
    }

    function setTokenURI(uint256 tokenId, string calldata newURI) external onlyOwner {
        require(!metadataFrozen, "Metadata is frozen");
        require(ownerOf[tokenId] != address(0), "Token doesn't exist");
        _tokenURIs[tokenId] = newURI;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token doesn't exist");
        return _tokenURIs[tokenId];
    }

    function approve(address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == msg.sender, "Not owner");
        getApproved[tokenId] = to;
        emit Approval(msg.sender, to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == from, "Not owner");
        require(msg.sender == from || msg.sender == getApproved[tokenId], "Not authorized");
        _transfer(from, to, tokenId);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero");
        require(ownerOf[tokenId] == address(0), "Already minted");
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        totalSupply++;
        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        ownerOf[tokenId] = to;
        balanceOf[from]--;
        balanceOf[to]++;
        delete getApproved[tokenId];
        emit Transfer(from, to, tokenId);
    }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
}
