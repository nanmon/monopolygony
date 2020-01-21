import React from 'react';
import { properties } from '../../services/board.json';

function CompanyInfo({ state }) {
    const property = properties.find(p => p.id === state.selected.tile.id);
    const rent = property.multpliedrent;
    return (
        <div className="CompanyInfo">
            <p>Utility</p>
            <p>Rent: Dice x {rent[0]}</p>
            <p>Dice x {rent[1]} if owning the two utilities</p>
        </div>
    );
}

export default CompanyInfo;
