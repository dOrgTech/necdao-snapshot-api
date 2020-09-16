// SPDX-License-Identifier: MIT

pragma solidity >=0.6.0 <=0.6.2;

import "./lib/SafeERC20.sol";
import "./lib/SafeMath.sol";

/**
 * @dev A token holder contract that will allow a beneficiary to extract the
 * tokens after a given release time.
 *
 * Useful for simple vesting schedules like "advisors get all of their tokens
 * after 1 year".
 */
contract TokenTimelock {
    using SafeERC20 for IERC20;

    using SafeMath for uint256;

    // ERC20 basic token contract being held
    IERC20 public token;

    /// @notice Timestamp when token release is enabled
    uint256 public releaseTime;

    address private owner;

    // snapshot beneficiaries of tokens after they are released
    mapping(address => uint256) public claimers;

    event RewardReleased(address beneficiary, uint256 amount);

    constructor(
        IERC20 _token,
        uint256 _timeLock
    ) public {
        releaseTime = block.timestamp + _timeLock;
        token = _token;
        owner = msg.sender;
    }

    function addBeneficiaries(
        address[] calldata _beneficiaries,
        uint256[] calldata _amounts
    ) external onlyOwner {
        require(
            _beneficiaries.length == _amounts.length,
            "Beneficiaries and amount must be of the same length"
        );
        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            claimers[_beneficiaries[i]] = _amounts[i];
        }
    }

    /**
     * @return the amount of tokens of a beneficiary
     */
    function beneficiary(address _claimer) public view returns (uint256) {
        return claimers[_claimer];
    }

    function release() external virtual {
        _release(msg.sender);
    }

    function release(address claimer) external virtual {
        _release(claimer);
    }

    function _release(address claimer) internal {
        uint256 claimAmount = claimers[claimer];
        require(
            claimAmount > 0,
            "TokenTimelock: Claimer not registered on snapshot"
        );
        require(
            block.timestamp >= releaseTime,
            "TokenTimelock: current time is before release time"
        );
        uint256 amount = token.balanceOf(address(this));
        require(
            amount >= claimAmount,
            "TokenTimelock: not enough tokens to release"
        );
        claimers[claimer] = 0;
        token.safeTransfer(claimer, claimAmount);

        emit RewardReleased(claimer, claimAmount);
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "OnlyOwner: Function only callable by owner"
        );
        _;
    }
}
