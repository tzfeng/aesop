/* tslint:disable */
export {};
import * as Ontology from 'ontology-dapi';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom';
import { RouteComponentProps } from 'react-router-dom';
import { Bet } from './bet';
import { CreateUser } from './createUser';
import { Feed } from './feed';
import { Profile } from './profile';
import { ViewBet } from './viewBet';
import { VoteBet } from './voteBet';

interface TParams {
  id: string;
}

function onViewBet({ match }: RouteComponentProps<TParams>) {
  return <ViewBet betId = {match.params.id} />;
}

function onVote({ match }: RouteComponentProps<TParams>) {
  return <VoteBet betId = {match.params.id} />;
}

const App: React.SFC<{}> = () => (
  <BrowserRouter>
    <>
      <Route path="/vote" exact={true} component={VoteBet} />
      <Route path="/" exact={true} component={Feed} />
      <Route path="/createUser" exact={true} component={CreateUser} />
      <Route path="/bet" exact={true} component={Bet} />
      <Route path="/bet/:id" component={onViewBet} />
      <Route path="/vote/:id" component={onVote} />
      <Route path="/profile" exact={true} component={Profile} />
    </>
  </BrowserRouter>
);

Ontology.client.registerClient({});
ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);
