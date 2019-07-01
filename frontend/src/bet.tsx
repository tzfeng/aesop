import { client } from 'ontology-dapi';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Field, Form } from 'react-final-form';
import { RouterProps } from 'react-router';
import { BrowserRouter, Route } from 'react-router-dom';
import './button.css';
import { Vote } from './vote';

const App: React.SFC<{}> = () => (
  <BrowserRouter>
    <>
      <Route path="/vote" exact={true} component={Vote} />
    </>
  </BrowserRouter>
);

ReactDOM.render(<App />, document.getElementById('root') as HTMLElement);

export const Bet: React.SFC<RouterProps> = (props) => {
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

  return (
    <div>
      <h2>Initialising a bet</h2>
      <Form
        initialValues={{
          amount: '10',
          asset: 'ONT',
          recipient: 'AXCyYV4DNmmsqZn9qJEqHqpacVxcr7X7ns'
        }}
        onSubmit={onSend}
        render={({ handleSubmit }) => (
          <form onSubmit={handleSubmit}>
            <h4>What stock would you like to bet on?</h4>
            <Field name="bet_stock" component="input" />

            <h4>How much do you want to bet?</h4>
            <Field name="bet_amount" component="input" type="number" />

            <h4>Betting value changes by..</h4>
            <Field name="asset" component="select">
              <option value="-ve">-ve</option>
              <option value="+ve">+ve</option>
            </Field>

            <br />
            <br />
            <button type="submit">Make bet!</button>
          </form>
        )}
      />
      <hr />
      <button onClick={onBack} className="back-button">Back</button>
      <button onClick={onVote} className="def-button">Vote on existing bets</button>
      <hr />
    </div>
  );
};
