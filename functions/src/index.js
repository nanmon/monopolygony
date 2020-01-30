const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

module.exports.onNewGame = functions.firestore
    .document('Games/{id}')
    .onCreate(async (snap, _ctx) => {
        const data = snap.data();
        const boardId = data.board;
        const tilesRef = admin
            .firestore()
            .collection(`Boards/${boardId}/Tiles`);
        const gameTilesRef = snap.ref.collection('Tiles');
        const tilesQuery = await tilesRef.get();
        const batch = admin.firestore().batch();
        tilesQuery.docs.forEach(tileDoc => {
            batch.set(gameTilesRef.doc(tileDoc.id), {
                ...tileDoc.data(),
                buildings: 0,
                owner: null,
                mortgaged: false,
            });
        });
        const playersRef = snap.ref.collection('Players');
        const playerRef = playersRef.doc(data.master);
        batch.set(playerRef, {
            color: 'red',
            frozenTurns: -1,
            money: 1500,
            position: 'go',
            turn: 0,
        });
        batch.update(snap.ref, {
            started: false,
            turn: playerRef.id,
            phase: 'roll',
            doublesCount: 0,
            lastDices: [0, 0],
            order: [playerRef.id],
            initialMoney: 1500,
        });
        await batch.commit();
    });
