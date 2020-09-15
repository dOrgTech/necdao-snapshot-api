// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <=0.6.2;

import "../TokenTimelock.sol";

contract MockedTokenTimelock is TokenTimelock {
    constructor(
        IERC20 _token,
        uint256 _lockTime
    ) public TokenTimelock(_token, 1) {}

    /**
     * @notice Overriding release method to remove time validation
     */
    function release() external override {
        releaseTime = block.timestamp - 1;
        _release(msg.sender);
    }
}
