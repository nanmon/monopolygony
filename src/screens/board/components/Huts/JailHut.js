import React from 'react';
import './styles/JailHut.css';

function JailHut({ children }) {
    return (
        <div className="JailHut">
            <span>Jail</span>
            <div className="Tokens">{children}</div>
        </div>
    );
}

export default JailHut;
