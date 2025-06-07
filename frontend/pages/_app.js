import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { ChakraProvider, CSSReset } from '@chakra-ui/react'
import theme from '../styles/theme'
import '../styles/globals.css'
const network = WalletAdapterNetwork.Devnet
const endpoint = clusterApiUrl(network)
const wallets = [new PhantomWalletAdapter()]

function MyApp({ Component, pageProps }) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ChakraProvider theme={theme}>
            <CSSReset />
            <Component {...pageProps} />
          </ChakraProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default MyApp