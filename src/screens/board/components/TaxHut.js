import React from 'react';

function TaxHut({ tile, side }) {
    const classes = ['TaxHut', side];
    return (
        <div className={classes.join(' ')}>
            <p>
                Pay
                <br /> Taxes
            </p>
            <p>{tile.id === 'tax1' ? '$200' : '$300'}</p>
        </div>
    );
}

export default TaxHut;
