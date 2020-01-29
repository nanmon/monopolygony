import React from 'react';
import './styles/TaxHut.css';

function TaxHut({ tile, side, children }) {
    const classes = ['TaxHut', side];
    return (
        <div className={classes.join(' ')}>
            <span>Taxes</span>
            <span>{tile.id === 'tax1' ? '$200' : '$100'}</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default TaxHut;
