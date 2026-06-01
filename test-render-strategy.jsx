import React from 'react';
import { renderToString } from 'react-dom/server';
import StrategyOKRs from './src/components/ceo/pages/StrategyOKRs.jsx';

try {
  console.log('Rendering StrategyOKRs...');
  renderToString(React.createElement(StrategyOKRs));
  console.log('Successfully rendered StrategyOKRs');
} catch (e) {
  console.error('ERROR OCCURRED:');
  console.error(e);
}
