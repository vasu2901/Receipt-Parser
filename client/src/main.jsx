import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function App() {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);

  async function uploadFile(e) {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("receipt", file);

    setLoading(true);

    const res = await fetch("http://localhost:3001/parse-receipt", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setReceipt(data);
    setLoading(false);
  }

  async function saveReceipt() {
    await fetch("http://localhost:3001/save-receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(receipt)
    });

    alert("Saved!");
  }

  function updateItem(index, key, value) {
    const updated = { ...receipt };
    updated.items[index][key] = value;
    setReceipt(updated);
  }

  return (
    <div style={{ padding: 24, fontFamily: "Arial" }}>
      <h1>Receipt Parser</h1>

      <input type="file" accept="image/*" onChange={uploadFile} />

      {loading && <p>Parsing receipt...</p>}

      {receipt && (
        <div style={{ marginTop: 24 }}>
          <label>Merchant</label>
          <input
            value={receipt.merchant}
            onChange={(e) =>
              setReceipt({ ...receipt, merchant: e.target.value })
            }
          />

          <br /><br />

          <label>Date</label>
          <input
            value={receipt.date}
            onChange={(e) =>
              setReceipt({ ...receipt, date: e.target.value })
            }
          />

          <h3>Items</h3>

          {receipt.items.map((item, idx) => (
            <div key={idx}>
              <input
                value={item.name}
                onChange={(e) =>
                  updateItem(idx, "name", e.target.value)
                }
              />

              <input
                type="number"
                value={item.amount}
                onChange={(e) =>
                  updateItem(idx, "amount", Number(e.target.value))
                }
              />
            </div>
          ))}

          <h3>Total</h3>

          <input
            type="number"
            value={receipt.total}
            onChange={(e) =>
              setReceipt({
                ...receipt,
                total: Number(e.target.value)
              })
            }
          />

          <br /><br />

          <button onClick={saveReceipt}>Save Receipt</button>
        </div>
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);