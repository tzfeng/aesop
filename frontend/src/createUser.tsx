/* tslint:disable */
export {};
import { client } from 'ontology-dapi';
import * as React from 'react';
import { RouterProps } from 'react-router';
import './button.css';
import { convertValue, CONTRACT_HASH } from './utils';

/* tslint:disable */
export const CreateUser: React.SFC<RouterProps> = (props) => {

  async function onCreate(values: any) {
    const scriptHash: string = CONTRACT_HASH;
    const operation: string = 'create_user';
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;

    const account = await client.api.asset.getAccount();

    const parameters: any[] = [
      {type: 'String', value: account }];

    const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    alert(JSON.stringify(args));
    try {
      const result = await client.api.smartContract.invoke({
        scriptHash,
        operation,
        args,
        gasPrice,
        gasLimit,
        requireIdentity
      });
      alert(JSON.stringify(result));
      // tslint:disable-next-line:no-console
      console.log('onScCall finished, result:' + JSON.stringify(result));
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
      <h2>Create account</h2>
      <button onClick={onCreate} className="def-button">Create account!</button>
      <br />
      <button onClick={onBack} className="back-button">&lt;</button>
    </div>
  );
};
