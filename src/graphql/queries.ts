import gql from "graphql-tag";

export const GET_BPT_HOLDERS = gql`
  query poolShares {
    poolShares(
      where: { balance_gt: 0, poolId: "0xb21e53d8bd2c81629dd916eead08d338e7fcc201" }
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
