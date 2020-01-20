import React from 'react';
import './styles/ChanceHut.css';

function ChanceHut({ side }) {
    const classes = ['ChanceHut', side];
    return (
        <div className={classes.join(' ')}>
            <span>Chance</span>
        </div>
    );
}

export default ChanceHut;
