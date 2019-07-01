import * as React from 'react';
import { RouterProps } from 'react-router';
// import Button from './button';
import './button.css';
import './index.css';

/*import {ThemeContext} from './theme-context';
import Button from './themed-button';*/

export const Home: React.SFC<RouterProps> = (props) => {
  function onBet() {
    props.history.push('/bet');
  }

  function onVote() {
    props.history.push('/vote');
  }

  function onFeed() {
    props.history.push('/feed');
  }

  function onProfile() {
    props.history.push('/profile');
  }

  return (
    <div>
      <button onClick={onBet} className="def-button">Initialise a Bet</button>
      <p></p>
      <button onClick={onVote} className="def-button">Vote on existing bets</button>
      <p></p>
      <button onClick={onFeed} className="def-button">View Feed</button>
      <p></p>
      <button onClick={onProfile} className="def-button">View Profile</button>
      <p></p>
    </div>
  );
};
