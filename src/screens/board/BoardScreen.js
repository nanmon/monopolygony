import React from 'react';
import './BoardScreen.css';
import { tiles, properties } from './services/board.json';
import PropertyHut from './components/Huts/PropertyHut';
import GoHut from './components/Huts/GoHut';
import TaxHut from './components/Huts/TaxHut';
import ChestHut from './components/Huts/ChestHut';
import RailroadHut from './components/Huts/RailroadHut';
import ChanceHut from './components/Huts/ChanceHut';
import CompanyHut from './components/Huts/CompanyHut';
import JailHut from './components/Huts/JailHut';
import FreeParkingHut from './components/Huts/FreeParkingHut';
import GoToJailHut from './components/Huts/GoToJailHut';
import PlayerToken from './components/PlayerToken';

function BoardScreen() {
    const [state, dispatch] = React.useReducer(reducer, null, init);

    function renderTile(tile, index) {
        const Hut = MAP[tile.type];
        const side = getSide(index);
        const classes = ['tile', tile.id, side];
        const tokens = state.players.filter(p => p.position === index);
        return (
            <div
                className={classes.join(' ')}
                key={tile.id}
                style={{
                    gridArea: tile.id,
                }}
            >
                <Hut tile={tile} side={side}>
                    {tokens.map(player => (
                        <PlayerToken key={player.color} player={player} />
                    ))}
                </Hut>
            </div>
        );
    }

    return (
        <div className="BoardScreen">
            <div className="Board">
                <div className="center">
                    <button onClick={() => dispatch({ type: 'roll' })}>
                        Roll dices
                    </button>
                    <p>Player {state.turn + 1} turn</p>
                </div>
                {tiles.map(renderTile)}
            </div>
        </div>
    );
}

export default BoardScreen;

const MAP = {
    go: GoHut,
    jail: JailHut,
    freeparking: FreeParkingHut,
    gotojail: GoToJailHut,
    property: PropertyHut,
    railroad: RailroadHut,
    company: CompanyHut,
    chest: ChestHut,
    chance: ChanceHut,
    tax: TaxHut,
};

function init() {
    return {
        players: [
            { position: 0, money: 1500, color: 'red' },
            { position: 0, money: 1500, color: 'blue' },
            { position: 0, money: 1500, color: 'green' },
            { position: 0, money: 1500, color: 'yellow' },
        ],
        properties: [
            // {
            //     index: 2,
            //     ownedBy: -1, // player index,
            //     houses: 0, // 0 - 5
            //     mortgaged: false
            // }
        ],
        turn: 0,
    };
}

function reducer(state, action) {
    let newState = state;
    switch (action.type) {
        case 'roll': {
            newState = advance(newState);
            const owned = landedOn(newState);
            if (owned) newState = payRent(newState);
            else newState = tryBuy(newState);
            newState.turn = (state.turn + 1) % state.players.length;
            break;
        }
        default:
            throw new Error('invalid action type');
    }
    return newState;
}

function advance(state) {
    const newState = { ...state };
    const dice1 = Math.ceil(Math.random() * 6);
    const dice2 = Math.ceil(Math.random() * 6);
    const player = { ...state.players[state.turn] };
    player.position = (player.position + dice1 + dice2) % 40;
    newState.players = [...state.players];
    newState.players[state.turn] = player;
    return newState;
}

function landedOn(state) {
    const { position } = state.players[state.turn];
    return state.properties.find(p => p.index === position);
}

function payRent(state) {
    const landed = landedOn(state);
    const tile = tiles[landed.index];
    const property = properties.find(p => p.id === tile.id);
    if (!property || !property.rent) return state;
    const newState = { ...state };
    newState.players = [...state.players];
    const payingPlayer = { ...state.players[state.turn] };
    const payedPlayer = { ...state.players[landed.ownedBy] };
    payingPlayer.money -= property.rent;
    payedPlayer.money += property.rent;
    newState.players[state.turn] = payingPlayer;
    newState.players[landed.ownedBy] = payedPlayer;
    return newState;
}

function tryBuy(state) {
    const newState = { ...state };
    newState.players = [...state.players];
    newState.properties = [...state.properties];
    const player = { ...state.players[state.turn] };
    const tile = tiles[player.position];
    const property = properties.find(p => p.id === tile.id);
    if (!property || !property.price) return state;
    if (property.price > player.money) return state;
    player.money -= property.price;
    newState.properties.push({
        index: player.position,
        ownedBy: state.turn,
        houses: 0,
        mortgaged: false,
    });
    newState.players[state.turn] = player;
    return newState;
}

function getSide(index) {
    const tilesPerSide = tiles.length / 4;
    const sideIndex = Math.floor(index / tilesPerSide);
    return ['bottom', 'left', 'top', 'right'][sideIndex];
}
