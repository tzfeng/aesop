/* tslint:disable */
import arrayMutators from 'final-form-arrays';
import { client } from 'ontology-dapi';
import * as React from 'react';
import { Component } from 'react';
import { Field, Form } from 'react-final-form';
import * as ReactModal from 'react-modal';
import './button.css';
import { convertValue, CONST, CONTRACT_HASH } from './utils';

interface BetProps {
  betId: string;
}

interface VoteState {
  lol: any;
  showModal: boolean;
}

// tslint:disable:max-line-length
// args: betId, userAddress, how much stake, for_against
export class VoteBet extends Component<BetProps, VoteState> {

  state: VoteState = {
    lol: <div>hasnt worked</div>,
    showModal: false
  };

  props: BetProps = {
    betId: this.props.betId
  };

  constructor(props: BetProps, state: VoteState) {
    super(props);

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onVote = this.onVote.bind(this);
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }


  async onVote(values: any) {
    try {
      var account: string = await client.api.asset.getAccount();
    }
    catch (e) {
      throw e;
    }

    const scriptHash: string = CONTRACT_HASH;
    const operation: string = 'vote';
    const gasPrice: number = 500;
    const gasLimit: number = 100000000;
    const requireIdentity: boolean = false;

    const parameters: any[] = [
          { type: 'Integer', value: this.props.betId },
          { type: 'String', value: account },
          { type: 'Integer', value: Number(values.amount_staked) * CONST },
          { type: 'Boolean', value: Boolean(values.for_against) }];

    const args = parameters.map((raw) => ({ type: raw.type, value: convertValue(raw.value, raw.type) }));

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

        var txn = result['transaction'];

        var json_arr: any = {};
        json_arr["txn"] = txn;
        var json_string = JSON.stringify(json_arr);
        console.log(json_string);

        // calls backend
        try {
        var resp = await fetch('http://localhost:3000/vote', {
                    method: 'PUT',
                    headers: new Headers({'content-type': 'application/json'}),
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

  render() {
    console.log("votebet " + this.props.betId);
    return (
    <div>
      <button className="def-button" onClick={this.handleOpenModal}>vote!</button>
      <ReactModal
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example"
           className="Modal"
           ariaHideApp={false}
      >
        <div className="modal-content-div">
      <h2>{ 'This is to vote on bet ' + this.props.betId }</h2>
      <Form
        initialValues={{
          amount_staked: 10,
          for_against:true
        }}
        mutators={Object.assign({}, arrayMutators) as any}
        onSubmit={this.onVote}
        render={({
          form: {
            mutators: { push, pop }
          },
          handleSubmit
        }) => (
          <form onSubmit={handleSubmit}>
          <h4>Amount staked</h4>
          <Field name="amount_staked" component="input" />
          <h4>For or against?</h4>
          <Field name="for_against" component="input" />
          <br />
            <button className="def-button" type="submit">Submit</button>
            <br />
          </form>
        )}
      />
      <button className="back-button" onClick={this.handleCloseModal}>x</button>
        </div>
      </ReactModal>
    </div>
    );
  }
}
