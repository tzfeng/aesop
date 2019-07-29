/* tslint:disable */
// import { client, ParameterType } from 'ontology-dapi';
import * as React from 'react';
import { Component } from 'react';
import * as ReactModal from 'react-modal';
import './button.css';
import { ViewBet2 } from './ViewBet2';

interface BetProps {
  betId: string;
}

interface BetState {
  display: any;
  showModal: boolean;
}

export class ViewBet extends Component<BetProps, BetState> {
  // given a bet id, returns
  // [stock_ticker, target_price, sign * margin, for_rep, against_rep, for_avg_rep, against_avg_rep,
  //              for_staked, against_staked, prob]
  state: BetState = {
    display: <div>unrendered</div>,
    showModal: false
  };

  constructor(props: BetProps, state: BetState) {
    super(props);

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal() {
    // this.betInfo(this.props.betId);
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    return (
    <div>
      <div className="bet-box">
      <h3>4 AES staked</h3>
      <h2>TWTR ^ 3%</h2>
      bet {this.props.betId}<br />
      <h4>By 8/14 market close.</h4>
      <button className="def-button" onClick={this.handleOpenModal}>view more</button>
      </div>
      <ReactModal
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example"
           className="Modal"
      >
        <div className="modal-content-div">
        <ViewBet2 betId={this.props.betId}/>
        <button className="back-button" onClick={this.handleCloseModal}>vote</button>
        </div>
      </ReactModal>
    </div>
    );
  }
}
