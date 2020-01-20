import React from 'react';
import { properties } from '../services/board.json';
import './styles/CompanyHut.css';

function CompanyHut({ tile, side }) {
    const classes = ['CompanyHut', side];
    const company = properties.find(p => p.id === tile.id);
    return (
        <div className={classes.join(' ')}>
            <span>{company.name}</span>
            <span>${company.price}</span>
        </div>
    );
}

export default CompanyHut;
