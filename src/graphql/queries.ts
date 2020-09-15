import gql from "graphql-tag";

export const GET_BPT_HOLDERS = gql`
  query poolShares {
    poolShares(
      where: {
        balance_gt: 0
        poolId: "0xb21e53d8bd2c81629dd916eead08d338e7fcc201"
      }
    ) {
      id
      userAddress {
        id
      }
      poolId {
        id
      }
      balance
    }
  }
`;

export const GET_POOL_DATA = gql`
  query pools {
    pools(
      where: {
        active: true
        tokensCount_gt: 1
        finalized: true
        tokensList_contains: [
          "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
          "0xCc80C051057B774cD75067Dc48f8987C4Eb97A5e"
        ]
        tokensCount: 2
        liquidity_gt: 0
        tokensList_not: []
      }
      first: 20
      skip: 0
      orderBy: "liquidity"
      orderDirection: "desc"
    ) {
      id
      liquidity
    }
  }
`;
