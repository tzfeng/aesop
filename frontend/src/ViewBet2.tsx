/* tslint:disable */
import * as React from 'react';
import { Component } from 'react';
import './button.css';
import { VoteBet } from './voteBet';

interface BetProps {
  betId: string;
}

interface BetState {
  showModal: boolean;
}

export class ViewBet2 extends Component<BetProps, BetState> {
  // given a bet id, returns
  // [stock_ticker, target_price, sign * margin, for_rep, against_rep, for_avg_rep, against_avg_rep,
  //              for_staked, against_staked, prob]
  state: BetState = {
    showModal: false
  };

  constructor(props: BetProps, state: BetState) {
    super(props);
  }

  componentWillMount() {
    this.betInfo(this.props.betId);
  }

  async betInfo(id: string) {
  }


  render() {
    console.log("viewbet2 " + this.props.betId);
    return (
    <div>
      <h2>{ 'This is to view bet ' + this.props.betId }</h2>
      <VoteBet betId = {this.props.betId} />
    </div>
    );
  }
}
