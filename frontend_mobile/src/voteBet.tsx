/* tslint:disable */
import { client } from 'cyanobridge';
import arrayMutators from 'final-form-arrays';
import * as React from 'react';
import { Component } from 'react';
import { Field, Form } from 'react-final-form';
import * as ReactModal from 'react-modal';
import './button.css';
import { CONST, CONTRACT_HASH } from './utils';

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
    console.log('onVote');
    try {
      var accObject: any = await client.api.asset.getAccount();
      var account = accObject['result'];
    }
    catch (e) {
      throw e;
    }

      const scriptHash = CONTRACT_HASH;
      const operation = 'vote';

      const args: any[] = [
         {
              type: "Integer",
              value: this.props.betId
          }, {
              type: "String",
              value: account
          }, {
              type: "Integer",
              value: Number(values.amount_staked) * CONST
          }, {
              type: "Boolean",
              value: Boolean(values.for_against)
          }
      ];

      const gasPrice = 500;
      const gasLimit = 40000;
      const payer = account; // ???
      const config = {
      ​    "login": true,
      ​    "message": "invoke smart contract test"
      };

      var params: any = {
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
         console.log(res["result"]);

                // sync with backend 
                var txn: any = res["result"]; // the transaction hash.

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

         } catch(err) {
      ​    console.log(err)
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
