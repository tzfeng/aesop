import { client } from 'ontology-dapi';
import * as React from 'react';
import { Field, Form } from 'react-final-form';
import { RouterProps } from 'react-router';

export const Vote: React.SFC<RouterProps> = (props) => {
  async function onSend(values: any) {
    const to: string = values.stock;
    const amount: number = Number(values.amount);
    const asset: 'for' | 'against' = values.yes_no;

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
      <h2>Voting on an existing bet</h2>
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
            <Field name="stock" component="input" />

            <h4>How much do you want to bet?</h4>
            <Field name="amount" component="input" type="number" />

            <h4>For or against?</h4>
            <Field name="yes_no" component="select">
              <option value="for">For</option>
              <option value="against">Against</option>
            </Field>

            <br />
            <br />
            <button type="submit">Make bet!</button>
          </form>
        )}
      />
      <hr />
      <button onClick={onBack}>Back</button>
    </div>
  );
};
