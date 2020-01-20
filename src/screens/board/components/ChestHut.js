import React from 'react';
import './styles/ChestHut.css';

function ChestHut({ side }) {
    const classes = ['ChestHut', side];
    return (
        <div className={classes.join(' ')}>
            <span>Chest</span>
        </div>
    );
}

export default ChestHut;
