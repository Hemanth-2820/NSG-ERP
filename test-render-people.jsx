import React from 'react';
import { renderToString } from 'react-dom/server';
import People from './src/components/ceo/pages/People.jsx';

try {
  console.log('Rendering People...');
  renderToString(React.createElement(People));
  console.log('Successfully rendered People');
} catch (e) {
  console.error('ERROR OCCURRED:');
  console.error(e);
}
