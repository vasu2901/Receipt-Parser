import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./global.css";

function App() {
    const [receipt, setReceipt] = useState(null);
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const [savedReceipts, setSavedReceipts] = useState([]);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        fetchReceipts();
    }, []);

    async function fetchReceipts() {
        const res = await fetch("http://localhost:3001/receipts");
        const data = await res.json();

        setSavedReceipts(data);
    }

    async function uploadFile(e) {
        setSelectedReceipt(null);

        const file = e.target.files[0];

        if (!file) return;

        setImagePreview(URL.createObjectURL(file));

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

        await fetchReceipts();

        setShowToast(true);

        setTimeout(() => {
            setShowToast(false);
        }, 5000);

        setReceipt(null);
        setImagePreview(null);
    }

    function calculateTotal(items) {
        return items.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
        );
    }

    function updateItem(index, key, value) {
        const updated = { ...receipt };

        updated.items[index][key] = value;

        updated.total = calculateTotal(updated.items);

        setReceipt(updated);
    }

    function addItem() {
        const updated = {
            ...receipt,
            items: [
                ...receipt.items,
                {
                    name: "",
                    amount: 0
                }
            ]
        };

        setReceipt(updated);
    }

    function removeItem(index) {
        const updatedItems = receipt.items.filter(
            (_, idx) => idx !== index
        );

        const updatedReceipt = {
            ...receipt,
            items: updatedItems,
            total: calculateTotal(updatedItems)
        };

        setReceipt(updatedReceipt);
    }

    function renderReadOnlyReceipt(data) {
        return (
            <div className="readonly-card">
                <h2>{data.merchant}</h2>

                <p>
                    <strong>Date:</strong> {data.date}
                </p>

                <h3>Items</h3>

                {data.items.map((item, idx) => (
                    <div key={idx} className="item-row">
                        <span>{item.name}</span>
                        <span>${Number(item.amount).toFixed(2)}</span>
                    </div>
                ))}

                <hr />

                <h3>Total: ${Number(data.total).toFixed(2)}</h3>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="sidebar">
                <h2>Saved Receipts</h2>

                {savedReceipts.length === 0 && (
                    <p>No saved receipts yet.</p>
                )}

                {savedReceipts.map((r, idx) => (
                    <div
                        key={idx}
                        className="receipt-list-item"
                        onClick={() => {
                            if (receipt) return;

                            setSelectedReceipt(r);
                        }}
                    >
                        <strong>{r.merchant}</strong>

                        <p>
                            ${Number(r.total).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>

            <div className="main">
                <div className="hero-section">
                    <div>
                        <h1>Receipt Parser</h1>

                        <p>
                            Upload a receipt image and review
                            extracted data before saving.
                        </p>
                    </div>

                    <label className="upload-button">
                        Choose Receipt
                        <input
                            type="file"
                            accept="image/*"
                            onChange={uploadFile}
                            hidden
                        />
                    </label>
                </div>

                {loading && (
                    <div className="loading-card">
                        Parsing receipt...
                    </div>
                )}

                {receipt && (
                    <div className="card">
                        <div className="image-container">
                            {imagePreview && (
                                <img
                                    src={imagePreview}
                                    alt="Receipt"
                                    className="image"
                                />
                            )}
                        </div>

                        <div className="form-container">
                            <label>Merchant</label>

                            <input
                                className="input"
                                value={receipt.merchant}
                                onChange={(e) =>
                                    setReceipt({
                                        ...receipt,
                                        merchant:
                                            e.target.value
                                    })
                                }
                            />

                            <label>Date</label>

                            <input
                                className="input"
                                value={receipt.date}
                                onChange={(e) =>
                                    setReceipt({
                                        ...receipt,
                                        date: e.target.value
                                    })
                                }
                            />

                            <h3>Items</h3>

                            {receipt.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="item-row"
                                >
                                    <input
                                        className="item-input"
                                        value={item.name}
                                        placeholder="Item name"
                                        onChange={(e) =>
                                            updateItem(
                                                idx,
                                                "name",
                                                e.target.value
                                            )
                                        }
                                    />

                                    <input
                                        className="price-input"
                                        type="number"
                                        step="0.01"
                                        value={item.amount}
                                        onChange={(e) =>
                                            updateItem(
                                                idx,
                                                "amount",
                                                Number(
                                                    e.target
                                                        .value
                                                )
                                            )
                                        }
                                    />

                                    <button
                                        className="delete-button"
                                        onClick={() =>
                                            removeItem(idx)
                                        }
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}

                            <button
                                className="secondary-button"
                                onClick={addItem}
                            >
                                + Add Item
                            </button>

                            <h3>
                                Total: $
                                {Number(
                                    receipt.total
                                ).toFixed(2)}
                            </h3>

                            <button
                                className="button"
                                onClick={saveReceipt}
                            >
                                Save Receipt
                            </button>
                        </div>
                    </div>
                )}

                {!receipt && selectedReceipt && (
                    <div style={{ marginTop: 24 }}>
                        <h2>Saved Receipt</h2>

                        {renderReadOnlyReceipt(
                            selectedReceipt
                        )}
                    </div>
                )}

                {showToast && (
                    <div className="toast">
                        Receipt saved successfully
                    </div>
                )}

            </div>
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <App />
);