// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// SECURE: Multiple simulated sources, median price, deviation check
contract SecureOracle {
    address public owner;
    uint256 public price;
    uint256 public lastUpdate;
    uint256 public constant MAX_DEVIATION = 5; // 5%
    uint256 public constant STALE_PERIOD = 1 hours;

    mapping(address => uint256) public sourcePrices;
    address[] public sources;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addSource(address source) external onlyOwner {
        sources.push(source);
    }

    function submitPrice(uint256 _price) external {
        sourcePrices[msg.sender] = _price;
        _updateMedian();
    }

    // SECURE: Uses median from multiple sources
    function _updateMedian() internal {
        require(sources.length >= 3, "Need at least 3 sources");
        uint256[] memory values = new uint256[](sources.length);
        for (uint256 i = 0; i < sources.length; i++) {
            values[i] = sourcePrices[sources[i]];
        }
        _sort(values);
        uint256 median = values[values.length / 2];

        // SECURE: Deviation check
        if (price > 0) {
            uint256 diff = median > price ? median - price : price - median;
            uint256 deviation = (diff * 100) / price;
            require(deviation <= MAX_DEVIATION, "Price deviation too high");
        }

        price = median;
        lastUpdate = block.timestamp;
    }

    // SECURE: Stale price check
    function getPrice() external view returns (uint256) {
        require(block.timestamp - lastUpdate <= STALE_PERIOD, "Price is stale");
        return price;
    }

    function _sort(uint256[] memory arr) internal pure {
        for (uint256 i = 0; i < arr.length; i++) {
            for (uint256 j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) {
                    (arr[i], arr[j]) = (arr[j], arr[i]);
                }
            }
        }
    }
}
