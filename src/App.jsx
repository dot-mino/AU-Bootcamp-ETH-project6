import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Spinner,
  Stack,
  CircularProgress,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';
import { ethers } from 'ethers'


function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading ] = useState(false);



  async function getTokenBalance() {
    await setLoading(true);
    const config = {
      apiKey: import.meta.env.VITE_MAINNET_API,
      network: Network.ETH_MAINNET
  };

    const alchemy = new Alchemy(config);
    if(ethers.utils.isAddress(userAddress)){
      const data = await alchemy.core.getTokenBalances(userAddress);
    console.log(data)

    setResults(data);

    const tokenData = await Promise.all(
      data.tokenBalances.map((balance) => {
        return alchemy.core.getTokenMetadata(balance.contractAddress);
      })
    );
 
    setTokenDataObjects(tokenData);
  

    setHasQueried(true);
    setLoading(false)
    }else{
      alert('Invalid address');
      window.location.reload(); 
    }
    
  }

  async function connectMetaMask() {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const accounts = await ethereum.request({ method: 'eth_accounts' });
        const userAddress = accounts[0];
  
        setUserAddress(userAddress);
        setConnected(true);
      } else {
        console.log('MetaMask non è installato');
      }
    } catch (error) {
      console.error('Errore durante la connessione a MetaMask:', error);
    }
  }
  return (
    <div>
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Heading mb={0} fontSize={36}>
            ERC-20 Token Indexer
          </Heading>
          <Text>
            Plug in an address and this website will return all of its ERC-20
            token balances!
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        <Heading mt={42}>
          Get all the ERC-20 token balances of this address:
        </Heading>
        <Input
          onChange={(e) => setUserAddress(e.target.value)}
          color="black"
          w="600px"
          textAlign="center"
          p={4}
          bgColor="white"
          fontSize={24}
        />
        <Button fontSize={20} onClick={getTokenBalance} mt={36} bgColor="blue">
          Check ERC-20 Token Balances
        </Button>
        {connected ? (
          <Button fontSize={20} mt={36} bgColor="green">
          Already connected, click on Check Balance
        </Button>
        ) : (
          <Button fontSize={20} onClick={connectMetaMask} mt={36} bgColor="blue">
          Connect with MetaMask
          </Button>
        )}
       

        <Heading my={36}>ERC-20 token balances:</Heading>
        {loading && (
          <Center mt={4}>
                <Stack direction='row' height='5rem'>
                <CircularProgress isIndeterminate color="blue" size="24px" />
                </Stack>
          </Center>
        )}  

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
           {results.tokenBalances.map((e, i) => {
          return (
            <Flex
              key={i} 
              flexDir={"column"}
              border="1px"
              borderRadius={4}
              textAlign="center"
              w="100%"
              p="2"
            > 
      <Box>
        <b>Symbol : {tokenDataObjects[i].symbol.substring(0, 6) + "..."}</b>
      </Box>
      <Box>
        <b>Balance:</b>&nbsp;
        {parseFloat(Utils.formatUnits(
          e.tokenBalance,
          tokenDataObjects[i].decimals                     
        )).toFixed(2)}
      </Box>
      <Image
        alignSelf="center"
        w="24"
        h="24"
        src={tokenDataObjects[i]?.logo}
      />
    </Flex>
  );
})}

          </SimpleGrid>
        ) : (
          'Please make a query! This may take a few seconds...'
        )}
      </Flex>
     
    </Box>

    
     
    </div>
  );
}

export default App;
