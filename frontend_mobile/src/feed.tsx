/* tslint:disable */
export {};
import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { RouterProps } from 'react-router';
import './button.css';
import './index.css';
import { BetPopup } from './bet-popup';
import { FeedBox } from './feed-box';
import './feed-box.css';

interface FeedState {
  content: any;
}

/* thing */
export class Feed extends React.Component<RouterProps, FeedState> {

  state: FeedState = {
    content: <div>unrendered</div>
  };

  onBack() {
    this.props.history.goBack();
  }

  async componentWillMount() {

    let resp = await fetch('http://localhost:3000/bets', {
                method: 'GET',
                headers: new Headers()});
    let data = await resp.json();

    let all = []

   for (let bet of data) {

      let x = <li key={bet['_id']}><FeedBox against_rep={bet['against_avg_rep']}
      against_staked={bet['against_staked']}
      change={bet['change']}
      createdAt={bet['createdAt']}
      for_rep={bet['for_avg_rep']}
      for_staked={bet['for_staked']}
      prob={bet['prob']}
      sector={bet['sector']}
      target_price={bet['target_price']}
      ticker={bet['ticker']}
      id={bet['_id']} /></li>;

      all.push(x);    
    }
    
    this.setState({
            content : all       
    })
    
  }

  clickToBet(value: number) {
    const url = '/bet/' + value.toString();
    this.props.history.push(url);
  }

  render() {
  return (
    <div className="feed-container">
      <h5>Active Bets</h5>
      <div><ul>{this.state.content}</ul></div>   
      <BetPopup betId="1"/>
      <br />
      <button onClick={this.onBack}>&lt;</button>
      <br />
      <br />
      <br />
    </div>
  );
  }
};
// <button onClick={() => clickVote(1)} className="bet-button">bet 1</button>
