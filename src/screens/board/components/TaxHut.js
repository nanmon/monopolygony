import React from 'react';
import './styles/TaxHut.css';

function TaxHut({ tile, side }) {
    const classes = ['TaxHut', side];
    return (
        <div className={classes.join(' ')}>
            <span>Taxes</span>
            <span>{tile.id === 'tax1' ? '$200' : '$100'}</span>
        </div>
    );
}

export default TaxHut;
