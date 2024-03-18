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
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useState } from 'react';



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
      network: Network.ETH_SEPOLIA
  };

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(userAddress);
    console.log(data)

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
    setLoading(false)
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
                <Spinner
                   thickness='4px'
                   speed='0.65s'
                   emptyColor='gray.200'
                   color='blue.500'
                   size='xl'
                  />
                </Stack>
          </Center>
        )}  

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.tokenBalances.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.id}
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
                  <Image src={tokenDataObjects[i].logo} />
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
