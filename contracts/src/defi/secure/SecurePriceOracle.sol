// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../../interfaces/IPriceOracle.sol";

contract SecurePriceOracle is IPriceOracle {
    address public owner;
    address public trustedUpdater;

    uint256 public cumulativePrice;
    uint256 public lastPrice;
    uint256 public lastUpdateTimestamp;
    uint256 public lastSpotPrice;

    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant MAX_DEVIATION = 500;
    uint256 public constant STALE_PRICE_AGE = 1 hours;

    struct PriceSnapshot {
        uint256 price;
        uint256 timestamp;
    }
    PriceSnapshot[10] public priceHistory;
    uint256 public historyIndex;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyUpdater() {
        require(msg.sender == trustedUpdater, "Not trusted updater");
        _;
    }

    event PriceUpdated(uint256 oldPrice, uint256 newPrice, uint256 timestamp);
    event StalePriceDetected(uint256 lastUpdate, uint256 currentTime);
    event DeviationExceeded(uint256 previousPrice, uint256 newPrice, uint256 deviation);
    event UpdaterChanged(address indexed oldUpdater, address indexed newUpdater);

    constructor(uint256 _initialPrice) {
        require(_initialPrice > 0, "Initial price must be > 0");
        owner = msg.sender;
        trustedUpdater = msg.sender;
        lastPrice = _initialPrice;
        lastSpotPrice = _initialPrice;
        lastUpdateTimestamp = block.timestamp;
        cumulativePrice = _initialPrice;
    }

    function setTrustedUpdater(address _updater) external onlyOwner {
        require(_updater != address(0), "Zero address");
        emit UpdaterChanged(trustedUpdater, _updater);
        trustedUpdater = _updater;
    }

    function updatePrice(uint256 newPrice) external onlyUpdater {
        require(newPrice > 0, "Price must be > 0");

        if (block.timestamp - lastUpdateTimestamp > STALE_PRICE_AGE) {
            emit StalePriceDetected(lastUpdateTimestamp, block.timestamp);
        }

        if (lastPrice > 0) {
            uint256 diff = newPrice > lastPrice ? newPrice - lastPrice : lastPrice - newPrice;
            uint256 deviation = (diff * 10_000) / lastPrice;
            require(deviation <= MAX_DEVIATION, "Price deviation exceeds max");
            if (deviation > MAX_DEVIATION / 2) {
                emit DeviationExceeded(lastPrice, newPrice, deviation);
            }
        }

        emit PriceUpdated(lastPrice, newPrice, block.timestamp);

        uint256 elapsed = block.timestamp - lastUpdateTimestamp;
        if (elapsed > 0) {
            cumulativePrice += lastPrice * elapsed;
        }

        lastSpotPrice = newPrice;
        lastPrice = newPrice;
        lastUpdateTimestamp = block.timestamp;

        priceHistory[historyIndex] = PriceSnapshot(newPrice, block.timestamp);
        historyIndex = (historyIndex + 1) % 10;
    }

    function getPrice() external view override returns (uint256) {
        require(block.timestamp - lastUpdateTimestamp <= STALE_PRICE_AGE, "Stale price");
        return lastPrice;
    }

    function getTWAPPrice(uint256 lookback) external view returns (uint256) {
        require(lookback > 0, "Lookback must be > 0");
        uint256 startTime = block.timestamp - lookback;
        if (lastUpdateTimestamp <= startTime) return lastPrice;
        uint256 totalPrice = 0;
        uint256 totalTime = 0;
        uint256 prevTime = lastUpdateTimestamp;
        for (uint256 i = 0; i < 10; i++) {
            uint256 idx = (historyIndex + 10 - 1 - i) % 10;
            PriceSnapshot memory snap = priceHistory[idx];
            if (snap.timestamp == 0) break;
            if (snap.timestamp <= startTime) {
                totalPrice += snap.price * (prevTime - startTime);
                totalTime += prevTime - startTime;
                break;
            }
            totalPrice += snap.price * (prevTime - snap.timestamp);
            totalTime += prevTime - snap.timestamp;
            prevTime = snap.timestamp;
            if (i == 9 || snap.timestamp <= startTime) break;
        }
        if (totalTime == 0) return lastPrice;
        return totalPrice / totalTime;
    }

    function getSpotPrice() external view returns (uint256) {
        return lastSpotPrice;
    }

    function isPriceStale() external view returns (bool) {
        return block.timestamp - lastUpdateTimestamp > STALE_PRICE_AGE;
    }
}
