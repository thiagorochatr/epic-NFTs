import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { ethers } from "ethers";
import myEpicNft from "./utils/MyEpicNFT.json";
import wait from "./assets/wait.jpg";


const TWITTER_HANDLE = "thiagorochatr1";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/collection/pubgnft-o8dsrkrkx1?search[sortAscending]=false&search[sortBy]=CREATED_DATE";
const TOTAL_MINT_COUNT = 50;


const CONTRACT_ADDRESS = "0xC36F3c1Fe8A099e75E9a86441145170C6d5923e5";

const App = () => {
  
  
  // Variável de estado que usamos pra armazenar nossa carteira pública.
  const [currentAccount, setCurrentAccount] = useState("");
  const [idNFT, setIdNFT] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const checkIfWalletIsConnected = async () => {


    //Precisamos ter acesso a window.ethereum
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Certifique-se que você tem metamask instalado!")
      return;
    } else {
      console.log("Temos o objeto ethereum!", ethereum)
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Conectado na rede " + chainId);
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("Você não está conectado na rede de teste Rinkeby! Altere a rede para continuar.");
        return;
      }
    }

    // Checa se estamos autorizados a carteira do usuário
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // Usuário pode ter múltiplas carteiras autorizadas, nós
    // podemos pegar a primeira que está lá
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // Isso é para quando o usuário vem no site e já tem
      //  a carteira conectada e autorizada
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Baixe o Metamask!");
        return;
      }

      // Método chique para pedir acesso a conta.
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      //Boom! Isso deve escrever o endereço público
      //uma vez que autorizar o Metamask.
      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Para quando o usuário vem para o site
      // e conecta a carteira pela primeira vez
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup do listener.
  const setupEventListener = async () => {
    // é bem parecido com a função
    try {
      const { ethereum } = window;

      if (ethereum) {
        // mesma coisa de novo
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS, 
          myEpicNft.abi, 
          signer
        );

        // Aqui está o tempero mágico.
        // Isso essencialmente captura nosso evento quando o contrato lança
        // Se você está familiar com webhooks, é bem parecido!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          console.log(
            `
            Olá pessoal! Já mintamos seu NFT. Pode ser que esteja branco agora. 
            Demora no máximo 10 minutos para aparecer no OpenSea. Aqui está o link: 
            <https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}>
            `
          );
          setIdNFT(tokenId.toNumber());
        })

        console.log("Setup event listener!")
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Vai abrir a carteira agora para pagar o gás...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("Mintado... espere, por favor.");
        await nftTxn.wait();
        console.log(
          `Mintado, veja a transação: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setLoading(false);
      } else {
        console.log("Objeto ethereum não existe!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Métodos para Renderizar
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Conectar Carteira
    </button>
  );
  
  useEffect(() => {
    checkIfWalletIsConnected();
  });
  /*
   * Adicionei um render condicional! Nós não queremos mostrar o Connect to Wallet se já estivermos conectados
   */

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Minha Coleção NFT</p>
          <p className="sub-text">
            Únicas. Lindas. Descubra a sua NFT hoje.
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : loading ? (
            <img alt="Espera!" src={wait} />
          ) : (
            <>
              <p className="sub-text"> {idNFT + 1} / {TOTAL_MINT_COUNT} NFTs mintados</p>
              <div className="div-flex">
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button some-margin-right-bottom">
                  😎 Mintar NFT
                </button>

                <a href={OPENSEA_LINK} target="_blank" rel="noreferrer">
                  <button className="cta-button connect-wallet-button">
                    🌊 Exibir coleção no OpenSea
                  </button>
                </a>
              </div>
            </>
          )}
        </div>

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >
            {`feito com ❤️ por @${TWITTER_HANDLE}`}
          </a>
        </div>
      </div>
    </div>
  );
};
export default App;