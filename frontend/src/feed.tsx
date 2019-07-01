import { client } from 'ontology-dapi';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { /*Field,*/ Form } from 'react-final-form';
import { RouterProps } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';
import './button.css';
import { viewBet } from './viewBet';
import { Vote } from './vote';

const App: React.SFC<{}> = () => (
  <BrowserRouter>
    <>
      <Route path="/vote" exact={true} component={Vote} />
      <Route path="/viewBet" exact={true} component={viewBet} />
    </>
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);

/* thing */
export const Feed: React.SFC<RouterProps> = (props) => {
  function onVote() {
    props.history.push('/vote');
  }

  async function onSend(values: any) {
    const to: string = values.recipient;
    const amount: number = Number(values.amount);
    const asset: 'ONT' | 'ONG' = values.asset;

    try {
      const result = await client.api.asset.send({ to, asset, amount });
      alert('onSend finished, txHash:' + result);
    } catch (e) {
      alert('onSend canceled');
      // tslint:disable-next-line:no-console
      console.log('onSend error:', e);
    }
  }

  function onBack() {
    props.history.goBack();
  }

  function clickBet() {
    props.history.push('/viewBet');
  }

  return (
    <div>
      <h2>List of Active Bets</h2>
      <button onClick={clickBet} className="def-button">lookit this bet</button>
      <br></br>
      <br></br>
      <button onClick={clickBet} className="def-button">look ~ another ~ bet</button>
      <Form
        initialValues={{
          amount: '10',
          asset: 'ONT',
          recipient: 'AXCyYV4DNmmsqZn9qJEqHqpacVxcr7X7ns'
        }}
        onSubmit={onSend}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h4> ^ View attributes of this bet</h4>
            <button onClick={onVote} className="def-button">Vote on this bet</button>
          </form>
        )}
      />
      <br></br>
      <button onClick={onBack} className="back-button">Back</button>
    </div>
  );
};
