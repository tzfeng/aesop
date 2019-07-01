import * as Ontology from 'ontology-dapi';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
/*import { Asset } from './asset';*/
import { Bet } from './bet';
import { Feed } from './feed';
import { Home } from './home';
import { Profile } from './profile';
/*import { Message } from './message';
import { Network } from './network';
import { Oep4 } from './oep4';
import { Provider } from './provider';
import { SmartContract } from './smartContract';*/
import { viewBet } from './viewBet';
import { Vote } from './vote';

const App: React.SFC<{}> = () => (
  <BrowserRouter>
    <>
      <Route path="/" exact={true} component={Home} />
      <Route path="/bet" exact={true} component={Bet} />
      <Route path="/feed" exact={true} component={Feed} />
      <Route path="/vote" exact={true} component={Vote} />
      <Route path="/profile" exact={true} component={Profile} />
      <Route path="/viewBet" exact={true} component={viewBet} />
    </>
  </BrowserRouter>
);

Ontology.client.registerClient({});
ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
