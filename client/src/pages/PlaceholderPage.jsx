import React from 'react';
import { FaClock } from 'react-icons/fa';

/**
 * Generic placeholder for modules not yet implemented.
 */
const PlaceholderPage = ({ title = 'Coming Soon', icon = <FaClock /> }) => (
  <div className="placeholder-page">
    <div className="placeholder-icon" aria-hidden="true">{icon}</div>
    <h2>{title}</h2>
    <p>This module will be available in a future update.</p>
  </div>
);

export default PlaceholderPage;
