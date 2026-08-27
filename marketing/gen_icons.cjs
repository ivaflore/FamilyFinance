const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const {
  FiUsers, FiCreditCard, FiPieChart, FiPackage, FiShoppingCart,
  FiBookOpen, FiCalendar, FiLayers, FiZap, FiShield, FiSmartphone, FiLogIn,
} = require('react-icons/fi');

const OUT = path.join(__dirname, 'icons');
fs.mkdirSync(OUT, { recursive: true });

const icons = {
  users: FiUsers,
  card: FiCreditCard,
  pie: FiPieChart,
  package: FiPackage,
  cart: FiShoppingCart,
  book: FiBookOpen,
  calendar: FiCalendar,
  layers: FiLayers,
  zap: FiZap,
  shield: FiShield,
  phone: FiSmartphone,
  login: FiLogIn,
};

async function run() {
  for (const [name, Icon] of Object.entries(icons)) {
    for (const [suffix, color] of [['white', '#FFFFFF'], ['teal', '#1D9E75']]) {
      const svg = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Icon, { size: 256, color, strokeWidth: 1.6 }),
      );
      const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 24 24">${svg.replace(/<svg[^>]*>|<\/svg>/g, '')}</svg>`;
      await sharp(Buffer.from(fullSvg)).png().toFile(path.join(OUT, `${name}-${suffix}.png`));
    }
  }
  console.log('Icons generated:', Object.keys(icons).length * 2);
}

run();
