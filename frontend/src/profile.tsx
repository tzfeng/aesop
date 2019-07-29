/* tslint:disable */
export {};
import { client } from 'ontology-dapi';
import * as React from 'react';
import { hexToInt, convertValue, CONTRACT_HASH } from './utils';

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
    const scriptHash: string = CONTRACT_HASH;
    const operation: string = 'user_tab';
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;
    const parametersRaw: any[] = [{ type: 'String', value: 'AXLbUrouWbSNYq7sMdWPWVKE6bpirpdX4H' }];

    const args = parametersRaw.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));
    try {
      const result = await client.api.smartContract.invoke({
        scriptHash,
        operation,
        args,
        gasPrice,
        gasLimit,
        requireIdentity
      });

      this.setState({toDisplay: <ul>
            <li>{'Total Rep: '} {hexToInt(result.results[0][1])}</li>
            <li>{'Total Bank: '} {hexToInt(result.results[1][1])}</li>
            <li>{'Total Wallet: '} {hexToInt(result.results[2][1])}</li>
            </ul>
      });

      // tslint:disable-next-line:no-console
      console.log('onScCall finished, result:' + JSON.stringify(result));

      // await this.display(result);
    } catch (e) {
      alert('onScCall cancelled');
      // tslint:disable-next-line:no-console
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
