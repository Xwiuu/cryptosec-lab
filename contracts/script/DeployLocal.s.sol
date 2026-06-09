// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/vulnerable/VulnerableBank.sol";
import "../src/vulnerable/VulnerableToken.sol";
import "../src/vulnerable/VulnerableDEX.sol";
import "../src/vulnerable/VulnerableNFT.sol";
import "../src/vulnerable/VulnerableDAO.sol";
import "../src/vulnerable/VulnerableOracle.sol";
import "../src/vulnerable/VulnerableLending.sol";
import "../src/vulnerable/VulnerableRandomness.sol";
import "../src/vulnerable/VulnerableApprovalVault.sol";
import "../src/vulnerable/VulnerableUpgradeable.sol";
import "../src/secure/SecureBank.sol";
import "../src/secure/SecureToken.sol";
import "../src/secure/SecureDEX.sol";
import "../src/secure/SecureNFT.sol";
import "../src/secure/SecureDAO.sol";
import "../src/secure/SecureOracle.sol";
import "../src/secure/SecureLending.sol";
import "../src/secure/SecureRandomness.sol";
import "../src/secure/SecureApprovalVault.sol";
import "../src/secure/SecureUpgradeable.sol";

contract DeployLocal is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        new VulnerableBank();
        new SecureBank();
        new VulnerableToken();
        new SecureToken();

        VulnerableOracle vulnOracle = new VulnerableOracle();
        SecureOracle secureOracle = new SecureOracle();

        new VulnerableLending(address(vulnOracle));
        new SecureLending(address(secureOracle));

        new VulnerableDEX(address(0), address(0));
        new SecureDEX(address(0), address(0));

        new VulnerableNFT();
        new SecureNFT();
        new VulnerableDAO();
        new SecureDAO();
        new VulnerableRandomness();
        new SecureRandomness();
        new VulnerableApprovalVault();
        new SecureApprovalVault();
        new VulnerableUpgradeable();
        new SecureUpgradeable();

        vm.stopBroadcast();
    }
}
