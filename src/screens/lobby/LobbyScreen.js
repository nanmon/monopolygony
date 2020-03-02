import React from 'react';
import firebase from 'firebase';

function LobbyScreen() {
    return (
        <div className="LobbyScreen section">
            <div className="box">
                <div className="tabs is-boxed">
                    <ul>
                        <li className="is-active">
                            <a>New Game</a>
                        </li>
                        <li>
                            <a>Join Game</a>
                        </li>
                    </ul>
                </div>
                <div className="field has-addons">
                    <div className="control">
                        <input
                            type="text"
                            className="input"
                            placeholder="Player Name"
                        />
                    </div>
                    <div className="control">
                        <div className="button">Set Name</div>
                    </div>
                </div>
                <p>Room code: p2nd1</p>
                <div className="media">
                    <div className="media-content">
                        <b>Players: </b>
                    </div>
                </div>
                <div className="media">
                    <div className="media-content">Nancio (you)</div>
                </div>
                <div className="media">
                    <div className="media-content">Benancio</div>
                </div>
                <div className="media">
                    <div className="media-content"></div>
                    <div className="media-right">
                        <button className="button">Start</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LobbyScreen;
