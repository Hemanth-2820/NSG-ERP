import React from 'react';
import { renderToString } from 'react-dom/server';
import Ceo from './src/components/ceo/Ceo.jsx';

try {
  console.log('Rendering Ceo (Messaging)...');
  renderToString(React.createElement(Ceo, { activeTab: 'messaging' }));
  console.log('Successfully rendered Ceo (Messaging)');
  
  console.log('Rendering Ceo (StrategyOKRs)...');
  renderToString(React.createElement(Ceo, { activeTab: 'strategyOKRs' }));
  console.log('Successfully rendered Ceo (StrategyOKRs)');
  
  console.log('Rendering Ceo (People)...');
  renderToString(React.createElement(Ceo, { activeTab: 'people' }));
  console.log('Successfully rendered Ceo (People)');
} catch (e) {
  console.error('ERROR OCCURRED:');
  console.error(e);
}
