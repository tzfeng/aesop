/* tslint:disable */
import * as React from 'react';
import * as ReactModal from 'react-modal';
import './feed-box.css';
import './button.css';
import { ViewBet2 } from './ViewBet2';

interface IBoxProps {
  against_rep: any | number;
  against_staked: any | number;
  change: any | number;
  createdAt: any | string;
  for_rep: any | number;
  for_staked: any | number;
  prob: any | number;
  sector: any | string;
  target_price: any | number;
  ticker: any | string;
  id: any | number;
}

interface IBoxState {
	vote: any;
	showModal: any;
}

export class FeedBox extends React.Component<IBoxProps, IBoxState> {

  state: IBoxState = {
    vote: <div>x</div>,
    showModal: false
  };

  constructor(props: IBoxProps, state: IBoxState) {
    super(props);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  /*componentDidMount() {
  	let items = []

      items.push(<li key={"against_avg_rep"}>{"Against rep: " + bet['against_avg_rep']}</li>);
      items.push(<li key={"against_staked"}>{"Against staked: " + bet['against_staked']}</li>);
      items.push(<li key={"change"}>{"Change: " + bet['change']}</li>);
      items.push(<li key={"createdAt"}>{"Date created: " + bet['createdAt']}</li>);
      //items.push(<li key={"date"}>{"Date: " + bet['date']}</li>);
      items.push(<li key={"for_avg_rep"}>{"For average rep: " + bet['for_avg_rep']}</li>);
      items.push(<li key={"prob"}>{"Probability: " + bet['prob']}</li>);
      items.push(<li key={"sector"}>{"Sector: " + bet['sector']}</li>);
      items.push(<li key={"target_price"}>{"Target price: " + bet['target_price']}</li>);
      items.push(<li key={"ticker"}>{"Ticker: " + bet['ticker']}</li>);
      // items.push(<li key={"updatedAt"}>{bet['updatedAt']}</li>);

    all.push(<ul>{items}</ul>);
  }*/

  onVote() {
  	this.setState({vote: <ViewBet2 betId={this.props.id}/>});
  }

  handleOpenModal() {
    // this.betInfo(this.props.betId);
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  public render() {
  	return(
  		<div className="feed-box">
  		<h3>{this.props.for_staked} AES staked</h3>
		<h2>{this.props.ticker} ^ {this.props.change}%</h2>
		<h4>Created on {this.props.createdAt}</h4>
		<div>For rep: {this.props.for_rep}. Against rep: {this.props.against_rep}</div>
		<div>For staked: {this.props.for_staked}. Against staked: {this.props.against_staked}</div>
		<div>Sector: {this.props.sector}</div>
		<button className="back-button" onClick={this.handleOpenModal}>view more</button>
		<ReactModal
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example"
           className="Modal"
         >
        <div className="modal-content-div">
        <ViewBet2 betId={this.props.id}/>
        <button className="back-button" onClick={this.handleCloseModal}>back</button>
        </div>
        </ReactModal>
  		</div>
  	);
  }
}