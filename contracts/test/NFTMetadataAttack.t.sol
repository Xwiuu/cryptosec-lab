// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/vulnerable/VulnerableNFT.sol";
import "../src/secure/SecureNFT.sol";

contract NFTMetadataAttackTest is Test {
    VulnerableNFT public vulnNFT;
    SecureNFT public secureNFT;
    address public owner = address(this);

    function setUp() external {
        vulnNFT = new VulnerableNFT();
        secureNFT = new SecureNFT();
    }

    // VULNERABLE: Metadata can be changed after mint
    function testMetadataChangeOnVulnerable() external {
        uint256 tokenId = vulnNFT.mint(owner, "ipfs://original");
        assertEq(vulnNFT.tokenURI(tokenId), "ipfs://original");

        // Anyone can change metadata after mint
        vulnNFT.setTokenURI(tokenId, "ipfs://malicious");
        assertEq(vulnNFT.tokenURI(tokenId), "ipfs://malicious");
    }

    // VULNERABLE: Unlimited mint
    function testUnlimitedMint() external {
        uint256 count = 100;
        for (uint256 i = 0; i < count; i++) {
            vulnNFT.mint(owner, "");
        }
        assertEq(vulnNFT.totalSupply(), count);
    }

    // SECURE: Only owner can mint, supply cap
    function testSecureNFTRespectsSupplyCap() external {
        for (uint256 i = 0; i < 100; i++) {
            secureNFT.mint(address(uint160(i + 1)), "");
        }
        assertEq(secureNFT.totalSupply(), 100);

        // Cannot mint to zero address
        vm.expectRevert();
        secureNFT.mint(address(0), "");
    }

    // SECURE: Metadata freeze
    function testSecureNFTFreeze() external {
        uint256 tokenId = secureNFT.mint(owner, "ipfs://original");
        secureNFT.freezeMetadata();

        vm.expectRevert();
        secureNFT.setTokenURI(tokenId, "ipfs://malicious");
    }
}
