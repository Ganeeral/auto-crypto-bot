import React from "react";

export function BalanceCard({ balance }) {
  return (
    <div>
      <h2>Баланс: {balance ? balance.totalBalance : "—"}</h2>
    </div>
  );
}
