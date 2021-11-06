import './App.css';
import {NFT} from './3,3/NFT';
import {Welcome} from './welcome/Welcome';
import {ChakraProvider} from "@chakra-ui/react";
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

function App() {

  return (
    <ChakraProvider>
      <div className="App">
        <header className="App-header">
          <Router>
            <Switch>
              <Route exact path='/3,3/:tokenId' component={NFT} />
              <Route component={Welcome}/>
            </Switch>
          </Router>

        </header>
      </div>
    </ChakraProvider>
  );
}

export default App;
