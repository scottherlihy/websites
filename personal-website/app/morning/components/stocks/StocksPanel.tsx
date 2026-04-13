import { Suspense } from "react";
import { STOCK_SYMBOLS } from "../../../lib/constants";
import Panel from "../shared/Panel";
import StockCard from "./StockCard";
import StocksToggle from "./StocksToggle";
import styles from "./stocks.module.css";

function StockCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.symbol}>----</span>
        <span className={styles.price}>---.--</span>
      </div>
      <div style={{ height: 50 }} />
    </div>
  );
}

export default function StocksPanel() {
  return (
    <Panel title="Stocks">
      <StocksToggle>
        <div className={styles.stocksGrid}>
          {STOCK_SYMBOLS.map((symbol) => (
            <Suspense key={symbol} fallback={<StockCardSkeleton />}>
              <StockCard symbol={symbol} />
            </Suspense>
          ))}
        </div>
      </StocksToggle>
    </Panel>
  );
}
