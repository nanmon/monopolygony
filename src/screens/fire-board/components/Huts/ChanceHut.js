import React from 'react';
import './styles/ChanceHut.css';

function ChanceHut({ side, children }) {
    const classes = ['ChanceHut', side];
    return (
        <div className={classes.join(' ')}>
            <span>Chance</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default ChanceHut;
