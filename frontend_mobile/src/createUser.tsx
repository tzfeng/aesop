/* tslint:disable */
export {};
import { client } from 'cyanobridge';
import * as React from 'react';
import { RouterProps } from 'react-router';
import './button.css';
import { CONTRACT_HASH } from './utils';

/* tslint:disable */
export const CreateUser: React.SFC<RouterProps> = (props) => {

  async function onCreate(values: any) {
    try {
      var accObject: any = await client.api.asset.getAccount();
      var account = accObject['result'];
    }
    catch (e) {
      throw e;
    }

    const scriptHash = CONTRACT_HASH;
    const operation = 'create_user'
    const args: any[] = [
          {
              type: "String",
              value: account
          }
      ];
    const gasPrice = 500;
    const gasLimit = 20000;
    const payer = CONTRACT_HASH;
    const config = {
        "login": true,
        "message": "create user test",
        "url": ""  
    }
    const params = {
              scriptHash,
              operation,
              args,
              gasPrice,
              gasLimit,
              payer,
              config
            };
    try {
       var res: any = await client.api.smartContract.invoke(params);
       console.log(res);
       } catch(err) {
        console.log(err)
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
