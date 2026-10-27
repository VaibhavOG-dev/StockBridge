
"use strict";

/* ==========================================
   STOCKBRIDGE — INVENTORY MATCHING PROTOTYPE
   Free local demo using HTML, CSS and JS
========================================== */

const STORAGE_KEY = "stockbridge-demo-v1";

const initialInventory = [
  {
    id: "S101",
    shop: "GreenLeaf Stationery",
    product: "A4 Paper",
    category: "Stationery",
    specs: "A4, 80 GSM, white",
    kind: "surplus",
    quantity: 12,
    unit: "reams",
    minQty: 2,
    price: 185,
    expiry: "",
    urgency: "Normal"
  },
  {
    id: "S102",
    shop: "Metro Office Supplies",
    product: "A4 Paper",
    category: "Stationery",
    specs: "A4, 80 GSM, white",
    kind: "need",
    quantity: 5,
    unit: "reams",
    minQty: 1,
    price: 240,
    expiry: "",
    urgency: "High"
  },
  {
    id: "S103",
    shop: "PackRight Workshop",
    product: "Cardboard Boxes",
    category: "Packaging",
    specs: "30x20x15 cm, 5-ply",
    kind: "surplus",
    quantity: 80,
    unit: "boxes",
    minQty: 10,
    price: 12,
    expiry: "",
    urgency: "Normal"
  },
  {
    id: "S104",
    shop: "QuickShip Store",
    product: "Cardboard Boxes",
    category: "Packaging",
    specs: "30x20x15 cm, 5-ply",
    kind: "need",
    quantity: 45,
    unit: "boxes",
    minQty: 5,
    price: 19,
    expiry: "",
    urgency: "High"
  },
  {
    id: "S105",
    shop: "PrintPoint Studio",
    product: "Printer Ink",
    category: "Electronics",
    specs: "Model PX-210, black",
    kind: "surplus",
    quantity: 6,
    unit: "cartridges",
    minQty: 2,
    price: 420,
    expiry: "2027-08-31",
    urgency: "Normal"
  },
  {
    id: "S106",
    shop: "Pixel Office Hub",
    product: "Printer Ink",
    category: "Electronics",
    specs: "Model PX-210, black",
    kind: "need",
    quantity: 4,
    unit: "cartridges",
    minQty: 1,
    price: 550,
    expiry: "",
    urgency: "Medium"
  },
  {
    id: "S107",
    shop: "CraftCorner",
    product: "Cotton Fabric",
    category: "Craft Materials",
    specs: "Cotton, blue, 2 metres wide",
    kind: "surplus",
    quantity: 25,
    unit: "metres",
    minQty: 5,
    price: 75,
    expiry: "",
    urgency: "Low"
  },
  {
    id: "S108",
    shop: "StitchWorks",
    product: "Cotton Fabric",
    category: "Craft Materials",
    specs: "Cotton, blue, 2 metres wide",
    kind: "need",
    quantity: 10,
    unit: "metres",
    minQty: 3,
    price: 110,
    expiry: "",
    urgency: "Medium"
  },
  {
    id: "S109",
    shop: "Daily Needs Mart",
    product: "Cooking Oil",
    category: "Groceries",
    specs: "Sunflower oil, sealed 1 L bottles",
    kind: "surplus",
    quantity: 20,
    unit: "bottles",
    minQty: 5,
    price: 95,
    expiry: "2027-06-30",
    urgency: "Normal"
  },
  {
    id: "S110",
    shop: "Family Grocery",
    product: "Cooking Oil",
    category: "Groceries",
    specs: "Sunflower oil, sealed 1 L bottles",
    kind: "need",
    quantity: 12,
    unit: "bottles",
    minQty: 4,
    price: 125,
    expiry: "",
    urgency: "High"
  },
  {
    id: "S111",
    shop: "TechFix Supplies",
    product: "USB Cable",
    category: "Electronics",
    specs: "USB-C, 1 metre",
    kind: "surplus",
    quantity: 15,
    unit: "pieces",
    minQty: 3,
    price: 65,
    expiry: "",
    urgency: "Normal"
  },
  {
    id: "S112",
    shop: "Gadget Point",
    product: "USB Cable",
    category: "Electronics",
    specs: "USB-C, 2 metres",
    kind: "need",
    quantity: 10,
    unit: "pieces",
    minQty: 2,
    price: 90,
    expiry: "",
    urgency: "High"
  }
];

const today = () => new Date().toISOString().slice(0, 10);

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);

      if (
        parsed &&
        Array.isArray(parsed.inventory) &&
        Array.isArray(parsed.transfers)
      ) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Could not load saved demo data.", error);
  }

  return {
    inventory: initialInventory.map(item => ({ ...item })),
    transfers: [],
    nextId: 113
  };
}

const state = loadState();

if (!Number.isInteger(state.nextId)) {
  state.nextId = 113;
}

let activePage = "dashboard";
let searchTerm = "";
let categoryFilter = "All";
let kindFilter = "All";
let matchFilter = "All";
let noticeMessage = "";

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Demo data could not be saved.", error);
    showNotice("Browser storage is unavailable. Changes may not persist.");
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(value);
}

function number(value) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function getById(id) {
  return state.inventory.find(item => item.id === id);
}

function getTransferById(id) {
  return state.transfers.find(item => item.id === id);
}

function showNotice(message) {
  noticeMessage = message;
  render();

  window.setTimeout(() => {
    if (noticeMessage === message) {
      noticeMessage = "";
      render();
    }
  }, 3500);
}

/* ==========================================
   SMART MATCHING ENGINE
========================================== */

function compatible(surplus, need) {
  if (!surplus || !need) return false;

  if (surplus.kind !== "surplus" || need.kind !== "need") {
    return false;
  }

  if (surplus.shop === need.shop) return false;

  if (normalize(surplus.product) !== normalize(need.product)) {
    return false;
  }

  if (normalize(surplus.category) !== normalize(need.category)) {
    return false;
  }

  if (normalize(surplus.specs) !== normalize(need.specs)) {
    return false;
  }

  if (surplus.unit !== need.unit) return false;

  if (
    !Number.isFinite(surplus.quantity) ||
    !Number.isFinite(need.quantity) ||
    surplus.quantity <= 0 ||
    need.quantity <= 0
  ) {
    return false;
  }

  if (
    !Number.isFinite(surplus.price) ||
    !Number.isFinite(need.price) ||
    surplus.price < 0 ||
    need.price < 0
  ) {
    return false;
  }

  if (
    surplus.expiry &&
    surplus.expiry <= today()
  ) {
    return false;
  }

  return true;
}

function calculateMatches() {
  const matches = [];

  const surpluses = state.inventory.filter(
    item => item.kind === "surplus"
  );

  const needs = state.inventory.filter(
    item => item.kind === "need"
  );

  for (const surplus of surpluses) {
    for (const need of needs) {
      if (!compatible(surplus, need)) continue;

      const alreadyRequested = state.transfers
        .filter(t =>
          t.surplusId === surplus.id &&
          t.needId === need.id &&
          t.status !== "Rejected"
        )
        .reduce((sum, t) => sum + t.quantity, 0);

      const available = Math.max(
        0,
        surplus.quantity - alreadyRequested
      );

      const required = Math.max(
        0,
        need.quantity - alreadyRequested
      );

      const quantity = Math.min(available, required);

      if (
        quantity <= 0 ||
        quantity < surplus.minQty ||
        quantity < need.minQty
      ) {
        continue;
      }

      const savings = Math.max(
        0,
        (need.price - surplus.price) * quantity
      );

      
let score = 50;

if (surplus.price < need.price) score += 20;
if (need.urgency === "High") score += 15;
if (need.urgency === "Medium") score += 8;

if (surplus.quantity >= need.quantity) {
  score += 5;
}

if (surplus.expiry) {
  const daysUntilExpiry = Math.ceil(
    (new Date(surplus.expiry) - new Date(today())) /
    (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiry >= 30) score += 10;
  else if (daysUntilExpiry >= 14) score += 7;
  else if (daysUntilExpiry >= 7) score += 4;
  else if (daysUntilExpiry > 0) score += 1;
}

matches.push({
  surplusId: surplus.id,
  needId: need.id,
  product: surplus.product,
  category: surplus.category,
  specs: surplus.specs,
  unit: surplus.unit,
  quantity,
  surplusShop: surplus.shop,
  needShop: need.shop,
  transferPrice: surplus.price,
  replacementPrice: need.price,
  savings,
  score: Math.min(99, score),

        urgency: need.urgency,
        expiry: surplus.expiry
      });
    }
  }

  return matches.sort((a, b) =>
    b.score - a.score || b.savings - a.savings
  );
}


function getAvailableSurplus(item) {
  const reserved = state.transfers
    .filter(t =>
      t.surplusId === item.id &&
      t.status === "Pending"
    )
    .reduce((sum, t) => sum + t.quantity, 0);

  return Math.max(0, item.quantity - reserved);
}



function getAvailableNeed(item) {
  const requested = state.transfers
    .filter(t =>
      t.needId === item.id &&
      t.status === "Pending"
    )
    .reduce((sum, t) => sum + t.quantity, 0);

  return Math.max(0, item.quantity - requested);
}


/* ==========================================
   SHARED HTML HELPERS
========================================== */

function statusBadge(item) {
  if (item.kind === "surplus") {
    return '<span class="status-pill status-surplus">● Surplus</span>';
  }

  return '<span class="status-pill status-needed">● Needed</span>';
}

function urgencyBadge(urgency) {
  const className =
    urgency === "High"
      ? "status-warning"
      : urgency === "Medium"
        ? "status-needed"
        : "status-neutral";

  return `<span class="status-pill ${className}">${escapeHTML(urgency)} priority</span>`;
}

function statCard(label, value, caption, symbol, colorClass) {
  return `
    <article class="stat-card">
      <div class="stat-top">
        <span class="stat-label">${escapeHTML(label)}</span>
        <span class="stat-icon ${colorClass}">${symbol}</span>
      </div>
      <div class="stat-value">${value}</div>
      <div class="stat-caption">${escapeHTML(caption)}</div>
    </article>
  `;
}

function sectionHeading(title, subtitle, button = "") {
  return `
    <div class="section-heading">
      <div>
        <h2>${escapeHTML(title)}</h2>
        <p>${escapeHTML(subtitle)}</p>
      </div>
      ${button}
    </div>
  `;
}

function inventoryRows(items) {
  if (!items.length) {
    return `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <strong>No inventory found</strong>
            Add stock or change your filters.
          </div>
        </td>
      </tr>
    `;
  }

  return items.map(item => {
    const available = item.kind === "surplus"
      ? getAvailableSurplus(item)
      : getAvailableNeed(item);

    return `
      <tr>
        <td>
          <div class="product-name">${escapeHTML(item.product)}</div>
          <div class="muted">${escapeHTML(item.specs)}</div>
        </td>
        <td>${escapeHTML(item.shop)}</td>
        <td>${statusBadge(item)}</td>
        <td>${number(item.quantity)} ${escapeHTML(item.unit)}</td>
        <td>${number(available)} ${escapeHTML(item.unit)}</td>
        <td>${money(item.price)} / unit</td>
        <td>
          <button class="button button-secondary"
            data-action="delete-item"
            data-id="${escapeHTML(item.id)}">
            Remove
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

function inventoryTable(items) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>PRODUCT / SPECIFICATIONS</th>
            <th>BUSINESS</th>
            <th>TYPE</th>
            <th>QUANTITY</th>
            <th>UNCOMMITTED</th>
            <th>UNIT PRICE</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>${inventoryRows(items)}</tbody>
      </table>
    </div>
  `;
}


function matchCard(match) {
  const savingsLabel = match.savings > 0
    ? money(match.savings)
    : money(0);

  const reasons = [];

  if (match.transferPrice < match.replacementPrice) {
    reasons.push(
      `Lower listed price by ${money(match.replacementPrice - match.transferPrice)} per unit`
    );
  } else {
    reasons.push("Compatible product and specifications");
  }

  if (match.urgency === "High") {
    reasons.push("The buyer has high demand urgency");
  } else if (match.urgency === "Medium") {
    reasons.push("The buyer has medium demand urgency");
  } else {
    reasons.push("The buyer's demand can be matched");
  }

  if (match.quantity > 0) {
    reasons.push(
      `${number(match.quantity)} ${match.unit} can be matched`
    );
  }

  return `
    <article class="match-card">
      <div class="match-top">
        <div>
          <div class="match-product">${escapeHTML(match.product)}</div>
          <div class="muted" style="margin-top:6px">
            ${escapeHTML(match.category)} · ${escapeHTML(match.specs)}
          </div>
        </div>
        <span class="status-pill status-surplus">
          ${match.score}% fit
        </span>
      </div>

      <div class="match-route">
        <div class="shop-box">
          <small>SURPLUS FROM</small>
          <strong>${escapeHTML(match.surplusShop)}</strong>
        </div>
        <span class="route-arrow">→</span>
        <div class="shop-box">
          <small>NEEDED BY</small>
          <strong>${escapeHTML(match.needShop)}</strong>
        </div>
      </div>

      <div class="match-metrics">
        <div class="metric">
          <small>Transfer quantity</small>
          <strong>${number(match.quantity)} ${escapeHTML(match.unit)}</strong>
        </div>
        <div class="metric">
          <small>Transfer price</small>
          <strong>${money(match.transferPrice)}</strong>
        </div>
        <div class="metric">
          <small>Est. savings</small>
          <strong style="color:var(--green-dark)">${savingsLabel}</strong>
        </div>
      </div>

      <div style="margin-top:16px;padding:14px;background:var(--surface-alt, #f5f8f5);border-radius:12px">
        <strong style="font-size:13px">Why this match?</strong>
        <ul style="margin:9px 0 0;padding-left:19px;font-size:12px;line-height:1.8;color:var(--muted)">
          ${reasons.map(reason => `
            <li>${escapeHTML(reason)}</li>
          `).join("")}
        </ul>
      </div>

      <div style="margin-top:13px;font-size:10px;color:var(--muted)">
        New-stock reference: ${money(match.replacementPrice)} per unit
        ${match.expiry
          ? ` · Expires ${escapeHTML(match.expiry)}`
          : ""}
      </div>

      <div class="match-actions">
        <button class="button button-primary"
          data-action="request-transfer"
          data-surplus="${escapeHTML(match.surplusId)}"
          data-need="${escapeHTML(match.needId)}"
          data-quantity="${match.quantity}">
          Request transfer →
        </button>
        <button class="button button-secondary"
          data-action="view-inventory">
          View inventory
        </button>
      </div>
    </article>
  `;
}

function matchGrid(matches) {
  if (!matches.length) {
    return `
      <div class="panel empty-state">
        <div class="empty-icon">⇄</div>
        <strong>No compatible matches found</strong>
        Matches require the same product, category, specifications and unit.
        Check your inventory or add compatible sample items.
      </div>
    `;
  }

  return `
    <div class="match-grid">
      ${matches.map(matchCard).join("")}
    </div>
  `;
}

function transferRows() {
  if (!state.transfers.length) {
    return `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <strong>No transfer requests yet</strong>
            Open Smart Matches and request a transfer to see it here.
          </div>
        </td>
      </tr>
    `;
  }

  return state.transfers.map(transfer => `
    <tr>
      <td>
        <div class="product-name">${escapeHTML(transfer.product)}</div>
        <div class="muted">${escapeHTML(transfer.id)}</div>
      </td>
      <td>${escapeHTML(transfer.surplusShop)}</td>
      <td>${escapeHTML(transfer.needShop)}</td>
      <td>${number(transfer.quantity)} ${escapeHTML(transfer.unit)}</td>
      <td>${money(transfer.price * transfer.quantity)}</td>
      <td>
        <span class="status-pill ${
          transfer.status === "Accepted"
            ? "status-surplus"
            : transfer.status === "Rejected"
              ? "status-warning"
              : "status-needed"
        }">${escapeHTML(transfer.status)}</span>
      </td>
      <td>
        ${transfer.status === "Pending" ? `
          <button class="button button-primary"
            data-action="accept-transfer"
            data-id="${escapeHTML(transfer.id)}">
            Accept
          </button>
          <button class="button button-danger"
            data-action="reject-transfer"
            data-id="${escapeHTML(transfer.id)}">
            Reject
          </button>
        ` : `
          <span class="muted">No action</span>
        `}
      </td>
    </tr>
  `).join("");
}

/* ==========================================
   OVERVIEW PAGE
========================================== */

function renderDashboard() {
  const surplusItems = state.inventory.filter(
    item => item.kind === "surplus"
  );

  const needItems = state.inventory.filter(
    item => item.kind === "need"
  );

  const matches = calculateMatches();

  const committedTransfers = state.transfers.filter(
    t => t.status === "Accepted"
  );

  const completedSavings = committedTransfers.reduce(
    (sum, t) => sum + t.estimatedSavings,
    0
  );

  const totalSavingsPotential = matches.reduce(
    (sum, m) => sum + m.savings,
    0
  );

  return `
    <div class="welcome-banner">
      <h2>Make every unit of stock count.</h2>
      <p>
        StockBridge connects available inventory with unmet demand.
        Discover compatible stock, compare prices and explore transfer
        opportunities across a sample network of businesses.
      </p>
      <div class="banner-actions">
        <button class="button button-primary" data-action="navigate-matches">
          Find smart matches →
        </button>
        <button class="button button-secondary" data-action="navigate-inventory">
          Explore inventory
        </button>
      </div>
    </div>

    ${noticeMessage ? `
      <div class="notice" role="status">
        <span>ⓘ</span>
        <span>${escapeHTML(noticeMessage)}</span>
      </div>
    ` : ""}

    ${sectionHeading(
      "Network overview",
      "A snapshot of the current sample inventory."
    )}

    <div class="stats-grid">
      ${statCard(
        "Inventory records",
        number(state.inventory.length),
        "Surplus and demand entries",
        "▤",
        "icon-blue"
      )}

      ${statCard(
        "Surplus listings",
        number(surplusItems.length),
        "Records offering stock",
        "↗",
        "icon-green"
      )}

      ${statCard(
        "Compatible matches",
        number(matches.length),
        "Matches based on current rules",
        "⇄",
        "icon-purple"
      )}

      ${statCard(
        "Potential savings",
        money(totalSavingsPotential),
        "Estimate across current matches",
        "₹",
        "icon-orange"
      )}
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div>
          <h3>Top matching opportunities</h3>
          <p>Compatible surplus stock and unmet demand.</p>
        </div>
        <button class="text-button" data-action="navigate-matches">
          View all →
        </button>
      </div>

      ${matches.length
        ? matchGrid(matches.slice(0, 2))
        : `<div class="empty-state"><strong>No matches available</strong>Review the current inventory.</div>`
      }
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div>
          <h3>Recent inventory</h3>
          <p>Sample businesses participating in the network.</p>
        </div>
        <button class="text-button" data-action="navigate-inventory">
          View inventory →
        </button>
      </div>

      ${inventoryTable(state.inventory.slice(0, 5))}
    </div>

    <div class="notice">
      <span>ⓘ</span>
      <span>
        ${number(needItems.length)} demand listings are included.
        Estimated savings are comparisons against the listed new-stock
        reference price, not guaranteed profit. Delivery, tax, quality and
        other costs are not included.
      </span>
    </div>
  `;
}

/* ==========================================
   INVENTORY PAGE
========================================== */

function renderInventory() {
  const categories = [
    "All",
    ...new Set(state.inventory.map(item => item.category))
  ];

  const filtered = state.inventory.filter(item => {
    const text = normalize([
      item.product,
      item.shop,
      item.category,
      item.specs
    ].join(" "));

    const matchesSearch = text.includes(normalize(searchTerm));
    const matchesCategory =
      categoryFilter === "All" ||
      item.category === categoryFilter;

    const matchesKind =
      kindFilter === "All" ||
      item.kind === kindFilter;

    return matchesSearch && matchesCategory && matchesKind;
  });

  return `
    ${sectionHeading(
      "Inventory management",
      "Add surplus stock or record what a business needs.",
      `<button class="button button-primary" data-action="show-add-form">+ Add listing</button>`
    )}

    ${noticeMessage ? `
      <div class="notice" role="status">${escapeHTML(noticeMessage)}</div>
    ` : ""}

    <div class="panel">
      <div class="form-grid">
        <div class="form-field">
          <label for="inventorySearch">Search inventory</label>
          <input id="inventorySearch" type="search"
            placeholder="Search product, shop or specifications..."
            value="${escapeHTML(searchTerm)}">
        </div>

        <div class="form-field">
          <label for="categoryFilter">Category</label>
          <select id="categoryFilter">
            ${categories.map(category => `
              <option value="${escapeHTML(category)}"
                ${category === categoryFilter ? "selected" : ""}>
                ${escapeHTML(category)}
              </option>
            `).join("")}
          </select>
        </div>

        <div class="form-field">
          <label for="kindFilter">Listing type</label>
          <select id="kindFilter">
            <option value="All" ${kindFilter === "All" ? "selected" : ""}>All listings</option>
            <option value="surplus" ${kindFilter === "surplus" ? "selected" : ""}>Surplus stock</option>
            <option value="need" ${kindFilter === "need" ? "selected" : ""}>Stock needed</option>
          </select>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div>
          <h3>Inventory records</h3>
          <p>Showing ${filtered.length} of ${state.inventory.length} listings.</p>
        </div>
      </div>

      ${inventoryTable(filtered)}
    </div>

    <div id="addFormAnchor"></div>

    <div class="panel" id="addInventoryPanel" hidden>
      <div class="panel-heading">
        <div>
          <h3>Add inventory listing</h3>
          <p>Enter consistent product specifications for accurate matching.</p>
        </div>
      </div>

      <form id="inventoryForm">
        <div class="form-grid">
          <div class="form-field">
            <label for="shop">Business name *</label>
            <input id="shop" name="shop" required maxlength="70"
              placeholder="e.g. Central Supplies">
          </div>

          <div class="form-field">
            <label for="product">Product name *</label>
            <input id="product" name="product" required maxlength="70"
              placeholder="e.g. A4 Paper">
          </div>

          <div class="form-field">
            <label for="category">Category *</label>
            <input id="category" name="category" required maxlength="50"
              placeholder="e.g. Stationery">
          </div>

          <div class="form-field">
            <label for="specs">Exact specifications *</label>
            <input id="specs" name="specs" required maxlength="120"
              placeholder="e.g. A4, 80 GSM, white">
          </div>

          <div class="form-field">
            <label for="kind">Listing type *</label>
            <select id="kind" name="kind" required>
              <option value="surplus">Offering surplus</option>
              <option value="need">Looking for stock</option>
            </select>
          </div>

          <div class="form-field">
            <label for="quantity">Quantity *</label>
            <input id="quantity" name="quantity" type="number"
              min="1" max="1000000" step="1" required>
          </div>

          <div class="form-field">
            <label for="unit">Unit *</label>
            <input id="unit" name="unit" required maxlength="25"
              placeholder="e.g. boxes, pieces, kg">
          </div>

          <div class="form-field">
            <label for="minQty">Minimum transfer quantity *</label>
            <input id="minQty" name="minQty" type="number"
              min="1" max="1000000" step="1" value="1" required>
          </div>

          <div class="form-field">
            <label for="price">Price per unit (₹) *</label>
            <input id="price" name="price" type="number"
              min="0" max="100000000" step="0.01" required>
          </div>

          <div class="form-field">
            <label for="expiry">Expiry date (if applicable)</label>
            <input id="expiry" name="expiry" type="date">
          </div>

          <div class="form-field">
            <label for="urgency">Demand urgency</label>
            <select id="urgency" name="urgency">
              <option>Normal</option>
              <option>Medium</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>
        </div>

        <p class="form-help" style="margin-top:15px">
          For a match, product name, category, specifications and unit
          must agree. Keep descriptions consistent.
        </p>

        <div class="form-actions">
          <button type="button" class="button button-secondary"
            data-action="cancel-add">Cancel</button>
          <button type="submit" class="button button-primary">
            Save listing
          </button>
        </div>
      </form>
    </div>
  `;
}

/* ==========================================
   SMART MATCHES PAGE
========================================== */

function renderMatches() {
  const allMatches = calculateMatches();

  const filtered = matchFilter === "All"
    ? allMatches
    : allMatches.filter(m => m.urgency === matchFilter);

  const totalPotential = filtered.reduce(
    (sum, m) => sum + m.savings,
    0
  );

  return `
    ${sectionHeading(
      "Smart matching engine",
      "Find compatible surplus stock using product specifications, quantity and urgency."
    )}

    ${noticeMessage ? `
      <div class="notice" role="status">${escapeHTML(noticeMessage)}</div>
    ` : ""}

    <div class="stats-grid">
      ${statCard(
        "Compatible pairs",
        number(allMatches.length),
        "Before the selected filter",
        "⇄",
        "icon-blue"
      )}

      ${statCard(
        "Estimated savings",
        money(totalPotential),
        "For the matches shown below",
        "₹",
        "icon-green"
      )}
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div>
          <h3>Matching opportunities</h3>
          <p>Only exact product and specification matches are included.</p>
        </div>
        <div class="form-field">
          <label for="matchFilter">Demand urgency</label>
          <select id="matchFilter">
            ${["All", "High", "Medium", "Normal", "Low"].map(value => `
              <option value="${value}"
                ${matchFilter === value ? "selected" : ""}>
                ${value}
              </option>
            `).join("")}
          </select>
        </div>
      </div>

      ${matchGrid(filtered)}
    </div>

    <div class="notice">
      <span>ⓘ</span>
      <span>
        The fit score is a simple rule-based demo score, not a probability
        that a transfer will succeed. Matches do not verify product quality,
        distance or actual supplier reliability.
      </span>
    </div>
  `;
}

/* ==========================================
   TRANSFER REQUESTS PAGE
========================================== */

function renderTransfers() {
  const pending = state.transfers.filter(
    t => t.status === "Pending"
  ).length;

  const accepted = state.transfers.filter(
    t => t.status === "Accepted"
  ).length;

  const rejected = state.transfers.filter(
    t => t.status === "Rejected"
  ).length;

  return `
    ${sectionHeading(
      "Transfer requests",
      "Review proposed stock transfers between sample businesses."
    )}

    ${noticeMessage ? `
      <div class="notice" role="status">${escapeHTML(noticeMessage)}</div>
    ` : ""}

    <div class="stats-grid">
      ${statCard(
        "Pending",
        number(pending),
        "Awaiting a decision",
        "◷",
        "icon-orange"
      )}

      ${statCard(
        "Accepted",
        number(accepted),
        "Accepted in this demo",
        "✓",
        "icon-green"
      )}

      ${statCard(
        "Rejected",
        number(rejected),
        "Declined requests",
        "×",
        "icon-blue"
      )}
    </div>

    <div class="panel">
      <div class="panel-heading">
        <div>
          <h3>All requests</h3>
          <p>Requesting a transfer does not move physical goods.</p>
        </div>
      </div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>PRODUCT / REQUEST</th>
              <th>FROM</th>
              <th>TO</th>
              <th>QUANTITY</th>
              <th>EST. TOTAL</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>${transferRows()}</tbody>
        </table>
      </div>
    </div>
  `;
}

/* ==========================================
   PAGE ROUTING
========================================== */

const pageDetails = {
  dashboard: {
    title: "Overview",
    subtitle: "Turn unused inventory into new opportunities."
  },
  inventory: {
    title: "My Inventory",
    subtitle: "Manage surplus stock and business demand."
  },
  matches: {
    title: "Smart Matches",
    subtitle: "Discover compatible stock transfer opportunities."
  },
  transfers: {
    title: "Transfer Requests",
    subtitle: "Manage proposed transfers between businesses."
  }
};

function render() {
  const content = document.getElementById("pageContent");

  if (!content) return;

  const details = pageDetails[activePage];

  document.getElementById("pageTitle").textContent = details.title;
  document.getElementById("pageSubtitle").textContent = details.subtitle;

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.page === activePage
    );
  });

  if (activePage === "dashboard") {
    content.innerHTML = renderDashboard();
  } else if (activePage === "inventory") {
    content.innerHTML = renderInventory();
  } else if (activePage === "matches") {
    content.innerHTML = renderMatches();
  } else if (activePage === "transfers") {
    content.innerHTML = renderTransfers();
  }
}

function navigate(page) {
  if (!pageDetails[page]) return;

  activePage = page;
  searchTerm = "";
  categoryFilter = "All";
  kindFilter = "All";
  matchFilter = "All";
  noticeMessage = "";

  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ==========================================
   ACTION HANDLERS
========================================== */

document.addEventListener("click", event => {
  const nav = event.target.closest(".nav-item");

  if (nav) {
    navigate(nav.dataset.page);
    return;
  }

  const button = event.target.closest("[data-action]");

  if (!button) return;

  const action = button.dataset.action;

  if (action === "navigate-matches") {
    navigate("matches");
    return;
  }

  if (action === "navigate-inventory" || action === "view-inventory") {
    navigate("inventory");
    return;
  }

  if (action === "show-add-form") {
    const panel = document.getElementById("addInventoryPanel");

    if (panel) {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("shop").focus();
    }

    return;
  }

  if (action === "cancel-add") {
    const panel = document.getElementById("addInventoryPanel");

    if (panel) panel.hidden = true;

    return;
  }

  if (action === "delete-item") {
    const item = getById(button.dataset.id);

    if (!item) return;

    const hasPending = state.transfers.some(t =>
      (t.surplusId === item.id || t.needId === item.id) &&
      t.status === "Pending"
    );

    if (hasPending) {
      showNotice("Resolve pending transfer requests before removing this listing.");
      return;
    }

    const acceptedTransfer = state.transfers.some(t =>
      (t.surplusId === item.id || t.needId === item.id) &&
      t.status === "Accepted"
    );

    if (acceptedTransfer) {
      showNotice("This listing has an accepted transfer. Keep it for the demo history.");
      return;
    }

    if (!window.confirm(`Remove "${item.product}" from the demo inventory?`)) {
      return;
    }

    state.inventory = state.inventory.filter(
      record => record.id !== item.id
    );

    saveState();
    showNotice("Inventory listing removed.");
    return;
  }

  if (action === "request-transfer") {
    const surplus = getById(button.dataset.surplus);
    const need = getById(button.dataset.need);

    if (!compatible(surplus, need)) {
      showNotice("This pair is no longer compatible.");
      return;
    }

    const match = calculateMatches().find(m =>
      m.surplusId === surplus.id &&
      m.needId === need.id
    );

    if (!match) {
      showNotice("No available quantity remains for this match.");
      return;
    }

    const quantity = Math.min(
      match.quantity,
      Number(button.dataset.quantity)
    );

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity < surplus.minQty ||
      quantity < need.minQty
    ) {
      showNotice("The transfer quantity no longer meets the minimum requirements.");
      return;
    }

    const transfer = {
      id: `TR-${state.nextId++}`,
      surplusId: surplus.id,
      needId: need.id,
      product: surplus.product,
      surplusShop: surplus.shop,
      needShop: need.shop,
      quantity,
      unit: surplus.unit,
      price: surplus.price,
      estimatedSavings: Math.max(
        0,
        (need.price - surplus.price) * quantity
      ),
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    state.transfers.push(transfer);
    saveState();

    navigate("transfers");
    showNotice(`Transfer request ${transfer.id} created.`);
    return;
  }

  if (action === "accept-transfer") {
    const transfer = getTransferById(button.dataset.id);

    if (!transfer || transfer.status !== "Pending") {
      showNotice("This request is no longer pending.");
      return;
    }

    const surplus = getById(transfer.surplusId);
    const need = getById(transfer.needId);

    if (!surplus || !need) {
      showNotice("The inventory listing for this request is missing.");
      return;
    }

    const availableSurplus = getAvailableSurplus(surplus);
    const availableNeed = getAvailableNeed(need);

    if (
      transfer.quantity > availableSurplus ||
      transfer.quantity > availableNeed
    ) {
      showNotice("Insufficient available quantity to accept this request.");
      return;
    }

    if (!window.confirm(
      `Accept ${transfer.quantity} ${transfer.unit} of ${transfer.product}?\n\nThis is a demo action and does not arrange a real delivery.`
    )) {
      return;
    }

    transfer.status = "Accepted";

    // Simulate completed stock movement in the demo.
    surplus.quantity -= transfer.quantity;
    need.quantity -= transfer.quantity;

    transfer.completedAt = new Date().toISOString();

    saveState();
    showNotice("Demo transfer accepted. Sample inventory quantities updated.");
    return;
  }

  if (action === "reject-transfer") {
    const transfer = getTransferById(button.dataset.id);

    if (!transfer || transfer.status !== "Pending") {
      showNotice("This request is no longer pending.");
      return;
    }

    transfer.status = "Rejected";
    saveState();
    showNotice("Transfer request rejected. Its reserved quantity is available again.");
  }
});

/* ==========================================
   LIVE FILTERS
========================================== */

document.addEventListener("input", event => {
  if (event.target.id === "inventorySearch") {
    const cursorPosition = event.target.selectionStart;
    searchTerm = event.target.value;

    render();

    const searchInput = document.getElementById("inventorySearch");

    if (searchInput) {
      searchInput.focus();
      searchInput.setSelectionRange(cursorPosition, cursorPosition);
    }
  }
});

document.addEventListener("change", event => {
  if (event.target.id === "categoryFilter") {
    categoryFilter = event.target.value;
    render();
  }

  if (event.target.id === "kindFilter") {
    kindFilter = event.target.value;
    render();
  }

  if (event.target.id === "matchFilter") {
    matchFilter = event.target.value;
    render();
  }
});

/* ==========================================
   ADD INVENTORY FORM
========================================== */

document.addEventListener("submit", event => {
  if (event.target.id !== "inventoryForm") return;

  event.preventDefault();

  const form = event.target;
  const data = new FormData(form);

  const shop = String(data.get("shop") || "").trim();
  const product = String(data.get("product") || "").trim();
  const category = String(data.get("category") || "").trim();
  const specs = String(data.get("specs") || "").trim();
  const kind = String(data.get("kind") || "");
  const unit = String(data.get("unit") || "").trim();
  const quantity = Number(data.get("quantity"));
  const minQty = Number(data.get("minQty"));
  const price = Number(data.get("price"));
  const expiry = String(data.get("expiry") || "");
  const urgency = String(data.get("urgency") || "Normal");

  if (
    !shop || !product || !category || !specs || !unit ||
    !["surplus", "need"].includes(kind) ||
    !["Low", "Normal", "Medium", "High"].includes(urgency) ||
    !Number.isSafeInteger(quantity) ||
    !Number.isSafeInteger(minQty) ||
    quantity < 1 ||
    minQty < 1 ||
    minQty > quantity ||
    !Number.isFinite(price) ||
    price < 0 ||
    price > 100000000 ||
    (expiry && !/^\d{4}-\d{2}-\d{2}$/.test(expiry))
  ) {
    showNotice("Check the form: enter valid details and ensure minimum quantity does not exceed total quantity.");
    return;
  }

  if (expiry && expiry < today()) {
    showNotice("This stock has an expired date. Update the date before listing it.");
    return;
  }

  const newItem = {
    id: `S${state.nextId++}`,
    shop,
    product,
    category,
    specs,
    kind,
    quantity,
    unit,
    minQty,
    price,
    expiry,
    urgency
  };

  state.inventory.push(newItem);

  saveState();
  searchTerm = "";
  categoryFilter = "All";
  kindFilter = "All";

  render();
  showNotice("Listing added. StockBridge has recalculated compatible matches.");
});

/* ==========================================
   START THE APP
========================================== */

render();
