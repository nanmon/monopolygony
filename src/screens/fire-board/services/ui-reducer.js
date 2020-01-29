import React from 'react';

export function useUIReducer() {
    return React.useReducer(reducer, null, init);
}

function init() {
    return {
        selected: null,
    };
}

function reducer(state, action) {
    if (action.playerId) {
        return {
            selected: {
                playerId: action.playerId,
            },
        };
    }
    if (action.tileId) {
        return {
            selected: {
                tileId: action.tileId,
            },
        };
    }
    return {
        selected: null,
    };
}
