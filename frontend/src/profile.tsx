/*import { client } from 'ontology-dapi';*/
import * as React from 'react';
import { RouterProps } from 'react-router';

export const Profile: React.SFC<RouterProps> = (props) => {

  function onBack() {
    props.history.goBack();
  }

  return (
    <div>
      <h2>Your Profile</h2>
      <hr />
      <button onClick={onBack}>Back</button>
    </div>
  );
};
