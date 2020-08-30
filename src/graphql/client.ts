import ApolloClient, { InMemoryCache } from 'apollo-boost';
import 'cross-fetch/polyfill'
 
export class GraphQLClient {
  private static instance: ApolloClient<InMemoryCache> | undefined

  private constructor() { }

  public static getInstance = () => {
    if(!GraphQLClient.instance) {

      if(!process.env.BALANCER_SUBGRAPH_API) {
        throw new Error('No BALANCER_SUBGRAPH_API set on .env file')
      }

      GraphQLClient.instance = new ApolloClient({
        uri: process.env.BALANCER_SUBGRAPH_API,
        cache: new InMemoryCache()
      });
    }

    return GraphQLClient.instance
  }

} 