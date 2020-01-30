declare namespace Monopolygony {
    type ID = string;

    interface Game {
        board: ID;
        started: boolean;
        turn: ID;
        phase: 'roll' | 'advance' | 'tileEffect' | 'end' | 'payFine';
        doublesCount: number;
        lastDices: [number, number];
        order: ID[];
        initialMoney: number;
    }

    interface Player {
        color: string;
        money: number;
        position: ID;
        frozenTurns: number;
        sentToJail: boolean;
        turn: number;
    }

    interface MiscTile {
        type: string;
        position: number;
    }

    interface PropertyTile extends MiscTile {
        name: string;
        price: number;
        rent?: number;
        rentIncreases: number[];
        buildingCost?: number;
        group: string;
        groupColor: string;
        buildings: number;
        owner?: ID;
        mortgaged: boolean;
    }

    type Tile = MiscTile | PropertyTile;

    interface Trade {
        by: ID;
        with?: ID;
        bMoney: number;
        wMoney: number;
        bProperties: ID[];
        wProperties: ID[];
    }

    interface AddPlayerAction {
        type: 'add-player';
        color: string;
    }

    interface RemovePlayerAction {
        type: 'remove-player';
        playerId: ID;
    }

    interface JoinGameAction {
        type: 'join-game';
        userId: ID;
        color: string;
    }

    interface NextAction {
        type: 'next';
        dice1?: number;
        dice2?: number;
        buy?: boolean;
    }

    interface BuyHouseAction {
        type: 'buy-house';
        tileId: ID;
    }

    interface SellHouseAction {
        type: 'sell-house';
        tileId: ID;
    }

    interface MortgageAction {
        type: 'mortgage';
        tileId: ID;
    }

    interface TradeNewAction {
        type: 'trade-new';
        playerId: ID;
        tileId?: ID;
    }

    interface TradeSetAction {
        type: 'trade-set';
        tradeId: ID;
        playerId: ID;
    }

    interface TradeAddAction {
        type: 'trade-add';
        tradeId: ID;
        tileId: ID;
    }

    interface TradeRemoveAction {
        type: 'trade-remove';
        tradeId: ID;
        tileId: ID;
    }

    interface TradeMoneyAction {
        type: 'trade-money';
        tradeId: ID;
        bMoney?: number;
        wMoney?: number;
    }

    interface TradeCancelAction {
        type: 'trade-cancel';
        tradeId: ID;
    }

    interface TradeDoneAction {
        type: 'trade-done';
        tradeId: ID;
    }

    interface BankruptAction {
        type: 'bankrupt';
        playerId: ID;
    }

    type Action =
        | AddPlayerAction
        | RemovePlayerAction
        | JoinGameAction
        | NextAction
        | BuyHouseAction
        | SellHouseAction
        | MortgageAction
        | TradeNewAction
        | TradeAddAction
        | TradeRemoveAction
        | TradeMoneyAction
        | TradeCancelAction
        | TradeDoneAction
        | BankruptAction;

    // util

    interface BoardBundle {
        game: FirebaseFirestore.DocumentSnapshot<Game>;
        players: FirebaseFirestore.QuerySnapshot<Player>;
        tiles: FirebaseFirestore.QuerySnapshot<Tile>;
        trades: FirebaseFirestore.QuerySnapshot<Trade>;
    }
}
