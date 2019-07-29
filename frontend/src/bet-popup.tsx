/* tslint:disable */
export {};
import * as React from 'react';
import * as ReactModal from 'react-modal';
import './button.css';
import './modal.css';

export class BetPopup extends React.Component<any, any> {
  constructor(props: {betId: number}) {
    super(props);
    this.state = {
      showModal: false
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal() {
    this.setState({ showModal: true });
  }

  handleCloseModal() {
    this.setState({ showModal: false });
  }

  render() {
    return (
      <div>
        <button className="createBet-button" onClick={this.handleOpenModal}>+ New Insight</button>
        <ReactModal
           isOpen={this.state.showModal}
           contentLabel="Minimal Modal Example"
           className="Modal"
        >
          <div className="modal-content-div">
          <h4>{this.props.betId}</h4>
          information to create bet
          <br />
          <button className="back-button" onClick={this.handleCloseModal}>x</button>
          </div>
        </ReactModal>
      </div>
    );
  }
}
