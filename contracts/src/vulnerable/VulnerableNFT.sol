// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE: Infinite mint, mutable metadata, no access control
contract VulnerableNFT {
    string public name = "VulnerableNFT";
    string public symbol = "VNFT";

    uint256 public totalSupply;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => address) public approved;

    // VULNERABLE: Anyone can mint unlimited tokens
    function mint(address to, string memory tokenURI_) external returns (uint256) {
        uint256 tokenId = totalSupply + 1;
        _mint(to, tokenId);
        _tokenURIs[tokenId] = tokenURI_;
        return tokenId;
    }

    // VULNERABLE: Metadata can be changed after mint
    function setTokenURI(uint256 tokenId, string memory newURI) external {
        require(ownerOf[tokenId] != address(0), "Token doesn't exist");
        _tokenURIs[tokenId] = newURI;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "Token doesn't exist");
        return _tokenURIs[tokenId];
    }

    // VULNERABLE: No check if caller is owner
    function approve(address to, uint256 tokenId) external {
        approved[tokenId] = to;
        emit Approval(ownerOf[tokenId], to, tokenId);
    }

    function transferFrom(address from, address to, uint256 tokenId) external {
        require(ownerOf[tokenId] == from, "Not owner");
        require(msg.sender == from || msg.sender == approved[tokenId], "Not authorized");
        _transfer(from, to, tokenId);
    }

    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero address");
        require(ownerOf[tokenId] == address(0), "Token already minted");
        ownerOf[tokenId] = to;
        balanceOf[to]++;
        totalSupply++;
        emit Transfer(address(0), to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal {
        ownerOf[tokenId] = to;
        balanceOf[from]--;
        balanceOf[to]++;
        delete approved[tokenId];
        emit Transfer(from, to, tokenId);
    }

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
}
