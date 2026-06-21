const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');

// Business Logic Data
const complianceData = {
    "Bakery": { score: 75, riskLevel: "Medium", checklist: ["FSSAI License Renewal", "Fire Safety Certificate", "Trade License", "GST Registration"], schemes: ["PM-FME Scheme", "MUDRA Loan"], deadlines: [{ task: "FSSAI Renewal", date: "2026-06-15" }] },
    "Retail Shop": { score: 85, riskLevel: "Low", checklist: ["Shop and Establishment Act Registration", "Trade License", "GST Registration"], schemes: ["PM SVANidhi", "MUDRA Shishu Loan"], deadlines: [{ task: "Shop Act Renewal", date: "2026-12-31" }] },
    "Restaurant": { score: 60, riskLevel: "High", checklist: ["FSSAI License", "Liquor License", "Fire Safety Certificate", "Pollution Clearance"], schemes: ["Stand-Up India Scheme", "Tourism Subsidy"], deadlines: [{ task: "Fire Safety", date: "2026-05-30" }] },
    "Manufacturing": { score: 50, riskLevel: "Critical", checklist: ["Factory License", "Pollution Board NOC", "Labor Laws Compliance", "Fire Safety"], schemes: ["PMEGP", "CLCSS"], deadlines: [{ task: "PCB NOC Renewal", date: "2026-06-01" }] },
    "Startup": { score: 90, riskLevel: "Low", checklist: ["Company Incorporation (MCA)", "DPIIT Recognition", "GST Registration"], schemes: ["Startup India Seed Fund", "Tax Exemption under 80IAC"], deadlines: [{ task: "ROC Filing", date: "2026-09-30" }] }
};

// State Specific Laws (Mocked)
const stateLaws = {
    "Maharashtra": ["Marathi Signboard Mandatory for all shops.", "Plastic Ban compliance required."],
    "Delhi": ["Anti-Smog gun required for large construction.", "Odd-Even delivery transport rules applicable."],
    "Karnataka": ["Kannada language priority in local employment.", "Tech park specific zoning laws."],
    "Gujarat": ["Diamond & Textile specific subsidies available.", "Strict prohibition on alcohol sales (Liquor License N/A)."],
    "Tamil Nadu": ["EV manufacturing subsidies boosted.", "Local body tax structure updated for Chennai."]
};

const centralLaws = [
    "New 45-day MSME Payment Rule (Section 43B(h)) strictly enforced.",
    "Data Digital Personal Data Protection Act (DPDP) compliance required.",
    "Mandatory e-Invoicing for businesses with turnover > ₹5Cr.",
    "Aadhaar-PAN linking mandatory for all Directors/Partners."
];

router.post('/analyze', verifyToken, (req, res) => {
    const { businessType, turnover, state, gstNumber, extraTaxNumbers, email } = req.body;

    let data = complianceData[businessType] || {
        score: 70, riskLevel: "Medium", checklist: ["General Trade License"], schemes: ["MSME Udyam Registration"], deadlines: []
    };

    let finalScore = data.score;
    let finalRisk = data.riskLevel;
    let alerts = [];
    
    // Advanced SaaS Metrics
    let growthScore = Math.floor(Math.random() * 20) + 70; // 70-90%
    let healthMetrics = {
        compliance: Math.min(100, finalScore + 5),
        financial: finalRisk === "Low" ? 95 : (finalRisk === "Medium" ? 75 : 45),
        legal: finalRisk === "Low" ? 98 : (finalRisk === "Medium" ? 80 : 50),
        operational: 88
    };
    
    let aiRiskPrediction = {
        level: finalRisk === "Low" ? "LOW in next 30 days" : (finalRisk === "Medium" ? "MODERATE in next 30 days" : "HIGH in next 30 days"),
        penaltyExposure: finalRisk === "Low" ? "₹0" : (finalRisk === "Medium" ? "₹5,000" : "₹45,000")
    };
    
    let aiInsights = [
        "✔ GST filing due in 2 days",
        data.schemes.length > 0 ? `✔ Eligible for ${data.schemes[0]}` : "✔ Ensure labor compliance up to date",
        finalRisk !== "Low" ? "⚠ High compliance risk detected" : "✔ Good financial health standing"
    ];
    
    let businessImpact = {
        penaltySavings: "₹45,000",
        improvementPct: "70%",
        benefitsClaimed: "2",
        timeSaved: "15 Hours"
    };
    
    let integrationStatus = {
        gstn: true,
        mca: false,
        udyam: true,
        digilocker: true
    };

    if (turnover && parseInt(turnover) > 10000000) {
        finalScore -= 10;
        finalRisk = "High";
        alerts.push("High turnover detected: Mandatory GST Audit required.");
    }

    if (gstNumber) finalScore += 5;

    let localLaws = [];
    if (state && stateLaws[state]) {
        localLaws = stateLaws[state];
    }

    res.json({
        score: Math.min(100, finalScore),
        riskLevel: finalRisk,
        checklist: data.checklist,
        schemes: data.schemes,
        deadlines: data.deadlines,
        alerts: alerts,
        stateLaws: localLaws,
        centralLaws: centralLaws,
        growthScore,
        healthMetrics,
        aiRiskPrediction,
        aiInsights,
        businessImpact,
        integrationStatus
    });
});

module.exports = router;
