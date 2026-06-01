import React from 'react';
import { renderToString } from 'react-dom/server';
import Messaging from './src/components/ceo/pages/Messaging.jsx';

try {
  console.log('Rendering Messaging...');
  renderToString(React.createElement(Messaging));
  console.log('Successfully rendered Messaging');
} catch (e) {
  console.error('ERROR OCCURRED:');
  console.error(e);
}
