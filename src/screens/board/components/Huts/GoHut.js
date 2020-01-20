import React from 'react';
import './styles/GoHut.css';

function GoHut({ children }) {
    return (
        <div className="GoHut">
            <span>Go</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default GoHut;
