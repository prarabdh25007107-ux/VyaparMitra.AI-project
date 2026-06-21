const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');

router.post('/ask', verifyToken, (req, res) => {
    const { question } = req.body;
    
    let response = "I'm VyapaarMitra AI. I can help you with MSME compliance.";
    
    const qLower = question.toLowerCase();
    
    if (qLower.includes("gst")) {
        response = "For GST, businesses with an annual turnover exceeding ₹40 Lakhs must register. Also consider filing LUT (Letter of Undertaking) if you plan on exporting services without IGST payment. Quarterly Return Monthly Payment (QRMP) scheme is highly recommended for turnover under ₹5 Crores.";
    } else if (qLower.includes("scheme") || qLower.includes("loan")) {
        response = "Popular schemes include PM-FME for food businesses and MUDRA loans. Since you have a strong compliance score, check out the Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE) for collateral-free loans up to ₹200 Lakhs.";
    } else {
        response += " Please specify the exact law or regulation you need deep-dive analysis on.";
    }

    // Artificial delay to simulate AI thinking
    setTimeout(() => {
        res.json({ response });
    }, 1000);
});

module.exports = router;
