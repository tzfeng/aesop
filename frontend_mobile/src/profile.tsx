/* tslint:disable */
export {};
import { client } from 'cyanobridge';
import * as React from 'react';
import { CONTRACT_HASH } from './utils';

import './button.css';

interface ProfState {
  toDisplay: any;
}

export class Profile extends React.Component<{}, ProfState> {

  state: ProfState = {
    toDisplay: <div>unrendered</div>
  };

  constructor(props: {}, state: ProfState) {
    super(props);
  }

  componentWillMount() {
    this.profileInfo();
  }

  async profileInfo() {
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

          /*
          this.setState({toDisplay: <ul>
                <li>{'Total Rep: '} {hexToInt(result.results[0][1])}</li>
                <li>{'Total Bank: '} {hexToInt(result.results[1][1])}</li>
                <li>{'Total Wallet: '} {hexToInt(result.results[2][1])}</li>
                </ul>
          });*/

          console.log('onScCall finished, result:' + JSON.stringify(res));

      // await this.display(result);
      } catch (e) {
          alert('onScCall cancelled');
          console.log('onScCall error:', e);
      }
  }

  render() {
    return (
    <div>
      <h2>Your Profile</h2>
      <br />
      <div>{this.state.toDisplay || 'Unknown'}</div>
    </div>
    );
  }
}
