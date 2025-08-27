// routes/receipts.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const router = express.Router();
const db = require("../db");

const THEME = {
  primary: "#27ae60",
  headerBg: "#f7f7fb",
  tableHeaderBg: "#eaf3ff",
  tableBorder: "#d5d9e0",
  totalsBg: "#eef7f1",

  margin: 40,
  line: 0.6,
  logoSize: 42,
  fontSize: {
    h1: 18,
    h2: 14,
    body: 11,
    small: 9,
  },
};

const HEB_FONT_REG = path.join(__dirname, "../fonts/NotoSansHebrew-Regular.ttf");
const HEB_FONT_BOLD = path.join(__dirname, "../fonts/NotoSansHebrew-Bold.ttf");
const HAS_HEB_FONTS = fs.existsSync(HEB_FONT_REG) && fs.existsSync(HEB_FONT_BOLD);

function nis(n) {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(Number(n || 0));
}
function dateIL(d) {
  try { return new Date(d).toLocaleString("he-IL"); } catch { return ""; }
}
function dateILshort(d) {
  try { return new Date(d).toLocaleDateString("he-IL"); } catch { return ""; }
}
function formatVatId(raw) {
  if (!raw) return ""; 
  const v = String(raw).trim();
  const hasHeb = /[\u0590-\u05FF]/.test(v);
  if (hasHeb) return v;
  return `מס' עוסק/ח.פ: ${v}`;
}

async function loadCompanyHeader() {
  const [rows] = await db.query(
    `SELECT \`Key\`, \`Value\`
     FROM settings
     WHERE \`Key\` IN ('company_name','company_vat','company_address','vat_percent','company_phone','company_email')`
  );
  const map = Object.fromEntries(rows.map(r => [r.Key, r.Value]));
  return {
    name: map.company_name || "FitTrack Studio",
    vatId: formatVatId(map.company_vat || ""), 
    address: map.company_address || "",
    phone: map.company_phone || "",
    email: map.company_email || "",
    vatPercent: map.vat_percent ? Number(map.vat_percent) : 0,
  };
}

function beginHebrewPDF(res, filename = "receipt.pdf") {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=${filename}`);

  const doc = new PDFDocument({ size: "A4", margin: THEME.margin });
  doc.pipe(res);

  try {
    if (HAS_HEB_FONTS) {
      doc.registerFont("Heb", HEB_FONT_REG);
      doc.registerFont("HebBold", HEB_FONT_BOLD);
      doc.font("Heb");
    } else {
      console.warn("Hebrew font not found. Please add fonts to /server/fonts");
      doc.registerFont("Heb", "Helvetica");
      doc.registerFont("HebBold", "Helvetica-Bold");
      doc.font("Heb");
    }
  } catch {
    doc.registerFont("Heb", "Helvetica");
    doc.registerFont("HebBold", "Helvetica-Bold");
    doc.font("Heb");
  }
  return doc;
}
function drawTopBanner(doc, title) {
  const { primary, fontSize } = THEME;
  const x = THEME.margin, w = doc.page.width - THEME.margin * 2;
  const bannerH = 28;

  doc.save();
  doc.rect(x, doc.y, w, bannerH).fill(primary);
  doc.fill("#fff")
     .font("HebBold").fontSize(fontSize.h1)
     .text(title, x, doc.y - bannerH + 7, { align: "center", width: w });
  doc.restore();
  doc.moveDown(2.2);
}

function drawCompanyAndClient(doc, header, client) {
  const yStart = doc.y + 6;
  const boxHeight = 98;
  const colGap = 14;
  const totalWidth = doc.page.width - THEME.margin * 2;
  const colWidth = (totalWidth - colGap) / 2;

  doc.save();
  doc.roundedRect(doc.page.width - THEME.margin - colWidth, yStart, colWidth, boxHeight, 8)
     .fill(THEME.headerBg);
  doc.fill("#222").font("HebBold").fontSize(THEME.fontSize.h2)
     .text(header.name, doc.page.width - THEME.margin - colWidth + 12, yStart + 10, { align: "right", width: colWidth - 24 });
  doc.font("Heb").fontSize(THEME.fontSize.body)
     .text(header.address, { align: "right", width: colWidth - 24 });
  if (header.phone) doc.text(header.phone, { align: "right", width: colWidth - 24 });
  if (header.email) doc.text(header.email, { align: "right", width: colWidth - 24 });
  if (header.vatId) doc.text(header.vatId, { align: "right", width: colWidth - 24 });
  doc.restore();

  doc.save();
  doc.roundedRect(THEME.margin, yStart, colWidth, boxHeight, 8)
     .strokeColor(THEME.tableBorder).lineWidth(THEME.line).stroke();
  doc.font("HebBold").fontSize(THEME.fontSize.h2)
     .text("פרטי לקוח:", THEME.margin + 12, yStart + 10);
  doc.font("Heb").fontSize(THEME.fontSize.body)
     .text(client.name || "", { continued: false })
     .text(client.email || "")
     .text(client.phone || "");
  if (client.id) {
    doc.text(`מס' לקוח: ${client.id}`);
  }
  doc.restore();

  doc.moveTo(THEME.margin, yStart + boxHeight + 14);
  doc.y = yStart + boxHeight + 18;
}

function drawItemsTable(doc, columns, rows) {
  const startX = THEME.margin;
  const tableWidth = doc.page.width - THEME.margin * 2;
  const colWidths = columns.map(c => c.w);
  const headerBg = THEME.tableHeaderBg;
  const colGap = 20; 

  doc.save();
  doc.rect(startX, doc.y, tableWidth, 24).fill(headerBg);
  let x = startX;
  const headerY = doc.y + 6;
  doc.fill("#222").font("HebBold").fontSize(THEME.fontSize.body);
  columns.forEach((c, i) => {
    const w = colWidths[i];
    doc.text(c.title, x, headerY, { width: w, align: c.align || "left" });
    x += w + colGap;
  });
  doc.restore();

  doc.moveTo(startX, doc.y + 24).lineTo(startX + tableWidth, doc.y + 24)
     .lineWidth(THEME.line).strokeColor(THEME.tableBorder).stroke();

  doc.y += 28;
  const rowHeight = 24;

  rows.forEach(r => {
    let xx = startX;
    const rowY = doc.y; 
    columns.forEach((c, i) => {
      const w = colWidths[i];
      doc.text(r[c.key] ?? "", xx, rowY, { width: w, align: c.align || "left" });
      xx += w + colGap;
    });
     doc.moveTo(startX, doc.y + rowHeight - 2).lineTo(startX + tableWidth, doc.y + rowHeight - 2)
       .lineWidth(THEME.line).strokeColor(THEME.tableBorder).stroke();

    doc.y += rowHeight; 
  });
}

function drawTotalsBox(doc, { baseAmount, vatPercent, vatAmount, total }) {
  const w = 260, h = 98;
  const x = THEME.margin, y = doc.y + 10;

  doc.save();
  doc.roundedRect(x, y, w, h, 10).fill(THEME.totalsBg);
  doc.fill("#222").font("Heb").fontSize(THEME.fontSize.body);

  const line = (label, value, bold=false) => {
    if (bold) doc.font("HebBold");
    else doc.font("Heb");
    doc.text(label, x + 12, doc.y + 10, { continued: true });
    doc.text(value, x + w - 12, doc.y, { align: "right" });
  };

  line(`מחיר לפני מע"מ:`, nis(baseAmount));
  line(`מע"מ (${vatPercent}%):`, nis(vatAmount));
  line(`סה"כ לתשלום:`, nis(total), true);

  doc.restore();
  doc.moveDown(3);
}

router.get("/order/:orderId.pdf", async (req, res) => {
  const { orderId } = req.params;
  try {
    const header = await loadCompanyHeader();
    const [[order]] = await db.query(
      `SELECT o.*, u.UserID AS UID, u.Name AS UserName, u.Email, u.Phone
       FROM orders o
       JOIN users u ON o.UserID=u.UserID
       WHERE o.OrderID=?`, [orderId]
    );
    if (!order) return res.status(404).send("Order not found");

    const [items] = await db.query(
      `SELECT op.Quantity, p.Name, p.Price
       FROM order_products op 
       JOIN products p ON op.ProductCode=p.ProductCode
       WHERE op.OrderID=?`, [orderId]
    );

    const [[payment]] = await db.query(
      `SELECT * FROM payments
       WHERE PaymentFor='Order' AND ReferenceID=? 
       ORDER BY PaymentDate DESC LIMIT 1`, [orderId]
    );

    const total = payment ? Number(payment.Amount) : Number(order.TotalPrice || 0);
    const vatAmount = +(total * header.vatPercent / (100 + header.vatPercent)).toFixed(2);
    const baseAmount = +(total - vatAmount).toFixed(2);

    const doc = beginHebrewPDF(res, `receipt-order-${orderId}.pdf`);
    drawTopBanner(doc, "חשבונית מס / קבלה — הזמנה");
    drawCompanyAndClient(doc, header, {
      id: order.UID,
      name: order.UserName,
      email: order.Email,
      phone: order.Phone
    });
    doc.font("Heb").fontSize(THEME.fontSize.body);
    doc.text(`מספר הזמנה: ${order.OrderID}`, { align: "right" });
    doc.text(`סטטוס הזמנה: ${order.Status || "-"}`, { align: "right" });
    if (payment) {
      doc.text(`מס׳ תשלום: ${payment.PaymentID}`, { align: "right" });
      doc.text(`תאריך תשלום: ${dateIL(payment.PaymentDate)}`, { align: "right" });
      if (payment.TransactionID) {
        doc.text(`מס׳ עסקה: ${payment.TransactionID}`, { align: "right" });
      }
      doc.text(`סטטוס תשלום: ${payment.Status || "-"}`, { align: "right" });
    }
    doc.moveDown(0.8);
const columns = [
  { key: "name", title: "תיאור", w: 280, align: "right" },
  { key: "qty",  title: "כמות", w: 100,  align: "right" },
  { key: "sum",  title: "סה\"כ (כולל מע\"מ)", w: 140, align: "right" },
];
    const rows = (items && items.length ? items : [{
      Name: "שירות/מוצר לפי הזמנה",
      Quantity: 1,
      Price: total
    }]).map(it => ({
      name: it.Name || "פריט ללא שם",
      qty: String(it.Quantity || 1),
      sum: nis(Number(it.Price) * Number(it.Quantity || 1)),
    }));

    drawItemsTable(doc, columns, rows);

     drawTotalsBox(doc, { baseAmount, vatPercent: header.vatPercent, vatAmount, total });

     doc.fontSize(THEME.fontSize.small).fillColor("#666")
       .text(" FitTrack.", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("Receipt /order error:", err);
    if (!res.headersSent) res.status(500).send("Server error");
  }
});
async function buildSubscriptionReceipt(res, { userId = null, subscriptionId = null, paymentId = null }) {
  const header = await loadCompanyHeader();

  let payment = null;
  let sub = null;
  let user = null;
  if (paymentId) {
    const [[p]] = await db.query(
      `SELECT * FROM payments WHERE PaymentID=? AND PaymentFor='Subscription'`,
      [paymentId]
    );
    payment = p || null;
    if (payment) {
      const [[u]] = await db.query(`SELECT * FROM users WHERE UserID=? LIMIT 1`, [payment.UserID]);
      user = u || null;
      const [[s]] = await db.query(
        `SELECT * FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1`,
        [payment.UserID]
      );
      sub = s || null;
    }
  }
  if (!payment && subscriptionId) {
    const [[s]] = await db.query(`SELECT * FROM subscription WHERE SubscriptionID=?`, [subscriptionId]);
    if (!s) throw new Error("Subscription not found");
    sub = s;

    const [[u]] = await db.query(`SELECT * FROM users WHERE UserID=? LIMIT 1`, [sub.UserID]);
    user = u || null;
    const [[pByRef]] = await db.query(
      `SELECT * FROM payments 
       WHERE PaymentFor='Subscription' AND ReferenceID=? 
       ORDER BY PaymentDate DESC LIMIT 1`,
      [subscriptionId]
    );
    if (pByRef) {
      payment = pByRef;
    } else {
      const [[pByUser]] = await db.query(
        `SELECT * FROM payments 
         WHERE PaymentFor='Subscription' AND UserID=? 
         ORDER BY PaymentDate DESC LIMIT 1`,
        [sub.UserID]
      );
      payment = pByUser || null;
    }
  }
  if (!payment && !sub && userId) {
    const [[p]] = await db.query(
      `SELECT * FROM payments 
       WHERE UserID=? AND PaymentFor='Subscription' AND Status='Completed'
       ORDER BY PaymentDate DESC LIMIT 1`,
      [userId]
    );
    payment = p || null;
    const [[u]] = await db.query(`SELECT * FROM users WHERE UserID=? LIMIT 1`, [userId]);
    user = u || null;
    const [[s]] = await db.query(
      `SELECT * FROM subscription WHERE UserID=? ORDER BY EndDate DESC LIMIT 1`,
      [userId]
    );
    sub = s || null;
  }
  if (!sub) throw new Error("Subscription not found");
  if (!user) {
    const [[u]] = await db.query(`SELECT * FROM users WHERE UserID=? LIMIT 1`, [sub.UserID]);
    user = u || null;
  }
  const total = Number((payment && payment.Amount) != null ? payment.Amount : (sub.TotalAmount || 0));
  const vatAmount = +(total * header.vatPercent / (100 + header.vatPercent)).toFixed(2);
  const baseAmount = +(total - vatAmount).toFixed(2);
  const safeName = user?.Name ? String(user.Name).replace(/[^\w\u0590-\u05FF\- ]/g, "") : "";
  const namePart = safeName ? `-${encodeURIComponent(safeName)}` : "";
  const doc = beginHebrewPDF(res, `receipt-subscription${namePart}.pdf`);
  drawTopBanner(doc, "חשבונית מס / קבלה — מנוי");
  drawCompanyAndClient(doc, header, {
    id: user?.UserID,
    name: user?.Name,
    email: user?.Email,
    phone: user?.Phone
  });
  doc.font("Heb").fontSize(THEME.fontSize.body);
  doc.text(`מס׳ תשלום: ${payment ? payment.PaymentID : "—"}`, { align: "right" });
  doc.text(`תאריך תשלום: ${payment ? dateIL(payment.PaymentDate) : "—"}`, { align: "right" });
  if (payment?.TransactionID) {
    doc.text(`מס׳ עסקה: ${payment.TransactionID}`, { align: "right" });
  }
  doc.text(`סוג מנוי: ${sub.Type === "Yearly" ? "שנתי" : "חודשי"}`, { align: "right" });
  if (sub.MembershipType) {
    doc.text(`סוג חברות באימונים: ${sub.MembershipType}`, { align: "right" });
  }
  if (sub.CardHolder) {
    doc.text(`אמצעי תשלום/מחזיק כרטיס: ${sub.CardHolder}`, { align: "right" });
  }
  doc.text(`תוקף מנוי: ${dateIL(sub.StartDate)} — ${dateIL(sub.EndDate)}`, { align: "right" });
  doc.moveDown(0.8);

  const periodText = `${dateILshort(sub.StartDate)} — ${dateILshort(sub.EndDate)}`;
  const desc = sub.MembershipType ? `תשלום מנוי (${sub.MembershipType})` : "תשלום מנוי";
const columns = [
  { key: "name", title: "תיאור", w: 280, align: "right" },
  { key: "qty",  title: "כמות", w: 100,  align: "right" },
  { key: "sum",  title: "סה\"כ (כולל מע\"מ)", w: 140, align: "right" },
];
  const rows = [{ desc, period: periodText, sum: nis(total) }];
  drawItemsTable(doc, columns, rows);

  drawTotalsBox(doc, { baseAmount, vatPercent: header.vatPercent, vatAmount, total });

  doc.fontSize(THEME.fontSize.small).fillColor("#666")
     .text("FitTrack.", { align: "center" });

  doc.end();
}
router.get("/subscription/latest/:userId.pdf", async (req, res) => {
  try {
    await buildSubscriptionReceipt(res, { userId: req.params.userId });
  } catch (err) {
    console.error("Receipt subscription latest error:", err);
    if (!res.headersSent) res.status(404).send("Subscription receipt not found");
  }
});
router.get("/subscription/payment/:paymentId.pdf", async (req, res) => {
  try {
    await buildSubscriptionReceipt(res, { paymentId: req.params.paymentId });
  } catch (err) {
    console.error("Receipt subscription by payment error:", err);
    if (!res.headersSent) res.status(404).send("Subscription receipt not found");
  }
});
router.get("/subscription/:subscriptionId.pdf", async (req, res) => {
  try {
    await buildSubscriptionReceipt(res, { subscriptionId: req.params.subscriptionId });
  } catch (err) {
    console.error("Receipt subscription by subId error:", err);
    if (!res.headersSent) res.status(404).send("Subscription receipt not found");
  }
});

module.exports = router;
