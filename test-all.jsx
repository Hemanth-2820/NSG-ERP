import React from 'react';
import { renderToString } from 'react-dom/server';

import Dashboard from './src/components/ceo/pages/Dashboard.jsx';
import Finance from './src/components/ceo/pages/Finance.jsx';
import Projects from './src/components/ceo/pages/Projects.jsx';
import CompanySetup from './src/components/ceo/pages/CompanySetup.jsx';
import Reports from './src/components/ceo/pages/Reports.jsx';
import Settings from './src/components/ceo/pages/Settings.jsx';
import Announcements from './src/components/ceo/pages/Announcements.jsx';
import StrategyOKRs from './src/components/ceo/pages/StrategyOKRs.jsx';
import OKRs from './src/components/ceo/pages/OKRs.jsx';

const pages = {
  Dashboard, Finance, Projects, CompanySetup, Reports, Settings, Announcements, StrategyOKRs, OKRs
};

for (const [name, Component] of Object.entries(pages)) {
  try {
    console.log(`Rendering ${name}...`);
    renderToString(React.createElement(Component));
    console.log(`SUCCESS: ${name}`);
  } catch (e) {
    console.error(`ERROR in ${name}:`, e.message);
  }
}
