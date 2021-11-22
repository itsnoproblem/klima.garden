import './App.css';
import {NFT} from './3,3/NFT';
import {Welcome} from './welcome/Welcome';
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {NFTGallery} from "./3,3/NFTGallery";
import {preloadNFTMedia} from "./3,3/nftutils";
import {useEffect} from "react";

function App() {

  useEffect(() => {
    window.addEventListener("load", preloadNFTMedia);
  })


  return (
    <ChakraProvider>
      <div className="App">
        <header className="App-header">
          <Router>
            <Switch>
              <Route exact path='/3,3/:tokenId' component={NFT} />
              <Route exact path='/3,3/gallery/:variant' component={NFTGallery} />
              <Route component={Welcome}/>
            </Switch>
          </Router>

        </header>
      </div>
    </ChakraProvider>
  );
}

export default App;
