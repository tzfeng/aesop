import * as React from 'react';
import { RouterProps } from 'react-router';
import './viewBet.css';

class BetBox extends React.Component {
  render() {
    return (
      <div className="bet-box">
        displays total token on each side, etc.<p>
        more words</p>
      </div>
    );
  }
}

export const viewBet: React.SFC<RouterProps> = (props) => {
  function onBack() {
    props.history.goBack();
  }

  return (
      <div>
      <BetBox>pls</BetBox>
      <button onClick={onBack} className="back-button">Back</button>
      </div>
  );
};
