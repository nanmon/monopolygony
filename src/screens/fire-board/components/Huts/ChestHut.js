import React from 'react';
import './styles/ChestHut.css';

function ChestHut({ side, children }) {
    const classes = ['ChestHut', side];
    return (
        <div className={classes.join(' ')}>
            <span>Chest</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default ChestHut;
