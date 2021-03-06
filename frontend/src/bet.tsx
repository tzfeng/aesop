/* tslint:disable */
export {};
import arrayMutators from 'final-form-arrays';
import { client } from 'ontology-dapi';
import * as React from 'react';
import { Field, Form } from 'react-final-form';
import { RouterProps } from 'react-router';
import './button.css';
import { convertValue, CONST, CONTRACT_HASH } from './utils';

export const Bet: React.SFC<RouterProps> = (props) => {
  
  async function onCallBackend(values: any) {

    const scriptHash: string = CONTRACT_HASH;
    const operation: string = 'create_bet';
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;

    const account = await client.api.asset.getAccount();

    const url = 'http://localhost:3000/scrapes';

    // get price from backend
    var json_arr: any = {};
    json_arr["ticker"] = values.ticker;
    var json_string = JSON.stringify(json_arr);
    console.log(json_string);

    try {
    var resp = await fetch(url, {
                method: 'PUT',
                headers: new Headers({'content-type': 'application/json'}),
                body:  json_string }); 
    var init_price = await resp.json();
    console.log("init_price " + JSON.stringify(init_price));
    }
    catch (e) {
      console.log(e);
    }

    console.log("init_price " + JSON.stringify(init_price));

    const parameters: any[] = [
          { type: 'String', value: account },
          { type: 'Integer', value: Number(values.amount_staked)*CONST },
          { type: 'String', value: values.ticker },
          { type: 'Integer', value: Number(values.sign) },
          { type: 'Integer', value: Number(values.margin) },
          { type: 'String', value: values.date },
          { type: 'Integer', value: Number(init_price)*CONST },
          ];
    const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    
    console.log(JSON.stringify(args));
    try {
      var result = await client.api.smartContract.invoke({
        scriptHash,
        operation,
        args,
        gasPrice,
        gasLimit,
        requireIdentity
      });

      // tslint:disable-next-line:no-console
      console.log('onScCall finished, result:' + JSON.stringify(result));

        var txn = result['transaction'];

        var json_arr: any = {};
        json_arr["txn"] = txn;
        var json_string = JSON.stringify(json_arr);
        console.log(json_string);

        // calls backend
        try {
        var resp = await fetch('http://localhost:3000/bets', {
                    method: 'POST',
                    headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
                    body:  json_string }); 
        var data = await resp.json();
        console.log(JSON.stringify(data));
        }
        catch (e) {
          console.log(e);
        }

    } catch (e) {
      alert('onScCall cancelled');
      // tslint:disable-next-line:no-console
      console.log('onScCall error:', e);
    } 

  }

  function onBack() {
    props.history.goBack();
  }

  return (
    <div>
      <h2>Create a Bet</h2>
        <Form
        initialValues={{
          amount_staked: 1,
          ticker: "FB",
          margin: 1,
          sign: 1,
          date: "01-01-2019"
        }}
        mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={onCallBackend}
        render={({
          form: {
            mutators: { push, pop }
          },
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>
          <h4>Amount staked</h4>
          <Field name="amount_staked" component="input" />
          <h4>Ticker</h4>
          <Field name="ticker" component="input" />
          <h4>Margin</h4>
          <Field name="margin" component="input" />
          <h4>Sign</h4>
          <Field name="sign" component="input" />
          <h4>Date</h4>
          <Field name="date" component="input" />
          <br />
          <button className="def-button" type="submit">Submit</button>
          </form>
        )}
      />
      <button onClick={onBack} className="back-button">&lt;</button>
    </div>
  );
};
