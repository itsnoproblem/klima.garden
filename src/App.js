import './App.css';
import {NFT} from './3,3/NFT';
import {Welcome} from './welcome/Welcome';
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {NFTGallery} from "./3,3/NFTGallery";
import FaqPage from "./faq/FaqPage";

function App() {

  return (
    <ChakraProvider>
      <div className="App">
        <header className="App-header">
          <Router>
            <Switch>
              <Route exact path='/3,3/:tokenId' component={NFT} />
              <Route exact path='/3,3/gallery/:variant' component={NFTGallery} />
              <Route exact path='/faq' component={FaqPage} />
              <Route component={Welcome}/>
            </Switch>
          </Router>

        </header>
      </div>
    </ChakraProvider>
  );
}

export default App;
