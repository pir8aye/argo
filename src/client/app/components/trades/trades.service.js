import { Util } from "../../util";
import { SessionService } from "../session/session.service";
import { AccountsService } from "../account/accounts.service";

export class TradesService {
    constructor(trades) {
        if (!TradesService.trades) {
            TradesService.trades = trades;
        }
    }

    static getTrades() {
        return TradesService.trades;
    }

    static refresh() {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return null;
        }

        return Util.fetch("/api/trades", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId
            })
        }).then(res => res.json()).then(data => {
            TradesService.trades.splice(0, TradesService.trades.length);

            data.forEach(trade => {
                trade.side = trade.currentUnits > 0 ? "buy" : "sell";
                TradesService.trades.push(trade);
            });

            return TradesService.trades;
        });
    }

    static closeTrade(id) {
        const credentials = SessionService.isLogged();

        if (!credentials) {
            return null;
        }

        return Util.fetch("/api/closetrade", {
            method: "post",
            body: JSON.stringify({
                environment: credentials.environment,
                token: credentials.token,
                accountId: credentials.accountId,
                id
            })
        }).then(res => res.json()).then(data => data)
            .catch(err => err.data);
    }

    static updateTrades(tick) {
        const account = AccountsService.getAccount(),
            pips = account.pips;

        TradesService.trades.forEach((trade, index) => {
            let current,
                side;

            if (trade.instrument === tick.instrument) {
                side = trade.currentUnits > 0 ? "buy" : "sell";

                if (side === "buy") {
                    current = tick.bid;
                    TradesService.trades[index].profitPips =
                        ((current - trade.price) / pips[trade.instrument]);
                }
                if (side === "sell") {
                    current = tick.ask;
                    TradesService.trades[index].profitPips =
                        ((trade.price - current) / pips[trade.instrument]);
                }

                TradesService.trades[index].current = current;
            }
        });
    }
}

TradesService.trades = null;
