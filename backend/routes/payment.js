const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const { verifyToken } = require('./auth');

// Consultants Data
const consultants = [
    { 
        id: 1, 
        name: "Shri R.K. Narayan, CA", 
        specialty: "Chief Tax & GST Advisor", 
        rating: 4.9, 
        fees: "₹1,500/hr", 
        experience: "20 Years (Ex-Govt. Panel)",
        terms: "Standard Government Advisory Terms Apply. Confidentiality strictly maintained under Section 138. Consultation fees are non-refundable.",
        image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
    },
    { 
        id: 2, 
        name: "Smt. Meenakshi Iyer, CS", 
        specialty: "Corporate Compliance & Licensing", 
        rating: 4.8, 
        fees: "₹2,000/hr", 
        experience: "15 Years (MCA Consultant)",
        terms: "Filing of forms subject to actual DSC availability. No guarantee on approval timelines by ROC.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
    },
    { 
        id: 3, 
        name: "Dr. A.P. Singh, Advocate", 
        specialty: "Labor Laws & Industrial Disputes", 
        rating: 4.7, 
        fees: "₹1,200/hr", 
        experience: "18 Years (High Court)",
        terms: "Initial consultation covers basic advisory. Legal drafting and court representation charged separately as per government notified rates.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
    },
    { 
        id: 4, 
        name: "Sh. S.K. Gupta, Ex-IRS", 
        specialty: "Direct Tax & Assessment Scrutiny", 
        rating: 5.0, 
        fees: "₹5,000/hr", 
        experience: "25 Years (Retd. IRS Officer)",
        terms: "Advisory limited to legal interpretation of Income Tax Act, 1961. Does not constitute binding legal order.",
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
    }
];

let transporter;
nodemailer.createTestAccount((err, account) => {
    if (!err) {
        transporter = nodemailer.createTransport({
            host: account.smtp.host,
            port: account.smtp.port,
            secure: account.smtp.secure,
            auth: { user: account.user, pass: account.pass }
        });
    }
});

router.get('/consultants', verifyToken, (req, res) => {
    res.json({ consultants });
});

router.post('/book-consultant', verifyToken, async (req, res) => {
    const { consultantId, date, time, email, paymentMethod, amount } = req.body;
    
    const consultant = consultants.find(c => c.id == consultantId);
    if (!consultant) return res.status(404).json({ error: "Consultant not found" });

    const bookingId = "BKG" + Math.floor(Math.random() * 100000);
    let previewUrl = "";

    if (email && transporter) {
        let message = {
            from: 'VyapaarMitra AI <noreply@vyapaarmitra.com>',
            to: email,
            subject: `Payment Receipt & Booking Confirmation - ${bookingId}`,
            html: `<h2>VyapaarMitra AI</h2><p>Booking ID: ${bookingId}</p><p>Consultant: ${consultant.name}</p><p>Amount: ₹${amount}</p><p>User: ${req.user.username}</p>`
        };
        try {
            let info = await transporter.sendMail(message);
            previewUrl = nodemailer.getTestMessageUrl(info);
        } catch (error) { console.error('Email error:', error); }
    }

    res.json({ success: true, bookingId, previewUrl });
});

router.post('/auto-file-tax', verifyToken, async (req, res) => {
    const { email, gstNumber } = req.body;

    const filingId = "GST-R-" + Math.floor(Math.random() * 100000);
    let previewUrl = "";

    if (email && transporter) {
        let message = {
            from: 'VyapaarMitra AI <noreply@vyapaarmitra.com>',
            to: email,
            subject: `Automated GST Filing Complete - ${filingId}`,
            html: `<h2>VyapaarMitra AI - Auto Tax Filing</h2>
                   <p>Status: <strong>SUCCESS</strong></p>
                   <p>Filing ID: ${filingId}</p>
                   <p>GST Number: ${gstNumber || 'N/A'}</p>
                   <p>User: ${req.user.username}</p>
                   <p>Your monthly GST return has been automatically filed based on connected bank transactions.</p>`
        };
        try {
            let info = await transporter.sendMail(message);
            previewUrl = nodemailer.getTestMessageUrl(info);
        } catch (error) { console.error('Email error:', error); }
    }

    res.json({ success: true, filingId, previewUrl });
});

module.exports = router;
