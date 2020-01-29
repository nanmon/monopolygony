import React from 'react';
import './styles/GoToJailHut.css';

function GoToJailHut({ children }) {
    return (
        <div className="GoToJailHut">
            <span>
                Go To
                <br />
                Jail
            </span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default GoToJailHut;
