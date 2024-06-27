import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUser, FaGift, FaBalanceScale, FaExchangeAlt, FaHandshake, FaHistory, FaChartLine } from 'react-icons/fa';
import './Dashboard.css';

// Mock API calls
const fetchCardMemberDetails = async (cm15) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { 
    profileID: '12345', 
    groupID: 'G1', 
    customerID: 'C1', 
    acquisitionDate: '2022-01-01', 
    active: true, 
    name: 'John Doe', 
    cardType: 'Platinum' 
  };
};

const fetchBenefits = async (profileID) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { description: 'American Express Monthly Bonus', effectiveDate: '2022-01-15', icon: '🎁' },
    { description: 'Travel Insurance', effectiveDate: '2022-02-01', icon: '✈️' },
    { description: 'Cashback Rewards', effectiveDate: '2022-03-10', icon: '💰' },
  ];
};

const fetchBalance = async (profileID, date) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { points: 50000, cashValue: 500 };
};

const fetchRedemptionDetails = async (profileID) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { pointsUsed: 1000, voucherDescription: 'Amazon Gift Card', date: '2023-05-15' },
    { pointsUsed: 2000, voucherDescription: 'Hotel Discount', date: '2023-06-20' },
    { pointsUsed: 5000, voucherDescription: 'Flight Upgrade', date: '2023-07-05' },
  ];
};

const fetchPartnerDetails = async (profileID) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { partner: 'Delta Airlines', pointsTransferred: 5000, date: '2023-05-01', status: 'success', icon: '✅' },
    { partner: 'Hilton Hotels', pointsTransferred: 3000, date: '2023-06-15', status: 'failed', reason: 'Insufficient points', icon: '❌' },
    { partner: 'Uber', pointsTransferred: 2000, date: '2023-07-10', status: 'success', icon: '✅' },
  ];
};

const fetchTransactionHistory = async (profileID) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { amount: 100, description: 'Grocery Shopping', pointsEarned: 100, type: 'credit', date: '2023-07-01' },
    { amount: -50, description: 'Refund', pointsEarned: -50, type: 'debit', date: '2023-07-02' },
    { amount: 0, description: 'Points Adjustment', pointsEarned: 200, type: 'adjustment', date: '2023-07-03' },
    { amount: -1000, description: 'Gift Card Redemption', pointsEarned: -1000, type: 'redemption', date: '2023-07-04' },
    { amount: 500, description: 'Restaurant', pointsEarned: 500, type: 'credit', date: '2023-07-05' },
  ];
};

const fetchNetSpend = async (profileID, productID, featureID, bucketID) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { netSpend: 2500, threshold: 3000, progress: 83 };
};

const fetchSpendingCategories = async (profileID) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { name: 'Groceries', value: 500 },
    { name: 'Dining', value: 300 },
    { name: 'Travel', value: 1000 },
    { name: 'Entertainment', value: 200 },
    { name: 'Other', value: 500 },
  ];
};

const fetchJSONDetails = async (type, id) => {
  await new Promise(resolve => setTimeout(resolve, 500));

  const dummyData = {
    benefit: {
      id: `BEN-${id}`,
      description: "American Express Monthly Bonus",
      effectiveDate: "2023-01-15",
      pointsAwarded: 5000,
      termsAndConditions: "Monthly bonus of 5000 points for spending over $1000",
      category: "Rewards",
      status: "Active"
    },
    redemption: {
      id: `RED-${id}`,
      date: "2023-07-20",
      voucherDescription: "Amazon Gift Card",
      pointsUsed: 10000,
      cashValue: 100,
      redemptionChannel: "Mobile App",
      status: "Completed",
      deliveryMethod: "Email",
      recipientEmail: "johndoe@example.com"
    },
    partner: {
      id: `PAR-${id}`,
      partner: "Delta Airlines",
      date: "2023-08-05",
      pointsTransferred: 25000,
      status: "Success",
      conversionRate: "1:1",
      partnerAccountID: "DL123456",
      transactionID: "TRF-987654",
      processingTime: "2 minutes"
    },
    transaction: {
      id: `TRX-${id}`,
      date: "2023-08-10",
      amount: 250.75,
      description: "Grocery Shopping at Whole Foods",
      merchantName: "Whole Foods Market",
      merchantCategory: "Grocery Stores",
      pointsEarned: 502,
      pointMultiplier: 2,
      transactionType: "Purchase",
      cardUsed: "Amex Platinum *1234",
      location: "New York, NY"
    }
  };

  return {
    type,
    id,
    details: dummyData[type]
  };
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard = () => {
  const [cm15, setCm15] = useState('');
  const [cardMemberDetails, setCardMemberDetails] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [balance, setBalance] = useState(null);
  const [balanceDate, setBalanceDate] = useState('');
  const [redemptionDetails, setRedemptionDetails] = useState([]);
  const [partnerDetails, setPartnerDetails] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [netSpend, setNetSpend] = useState(null);
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [jsonDetails, setJsonDetails] = useState(null);

  const fetchData = async () => {
    const details = await fetchCardMemberDetails(cm15);
    setCardMemberDetails(details);

    const benefitsData = await fetchBenefits(details.profileID);
    setBenefits(benefitsData);

    const balanceData = await fetchBalance(details.profileID, balanceDate);
    setBalance(balanceData);

    const redemptionData = await fetchRedemptionDetails(details.profileID);
    setRedemptionDetails(redemptionData);

    const partnerData = await fetchPartnerDetails(details.profileID);
    setPartnerDetails(partnerData);

    const transactionData = await fetchTransactionHistory(details.profileID);
    setTransactionHistory(transactionData);

    const netSpendData = await fetchNetSpend(details.profileID, 'productID', 'featureID', 'bucketID');
    setNetSpend(netSpendData);

    const spendingCategoriesData = await fetchSpendingCategories(details.profileID);
    setSpendingCategories(spendingCategoriesData);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setJsonDetails(null);
  };

  const handleItemClick = async (type, id) => {
    const details = await fetchJSONDetails(type, id);
    setJsonDetails(details);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>R42 Dashboard</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter CM15 (Credit Card Number)"
            value={cm15}
            onChange={(e) => setCm15(e.target.value)}
          />
          <button onClick={fetchData}>Fetch Data</button>
        </div>
      </header>

      {cardMemberDetails && (
        <div className="dashboard-content">
          <nav className="dashboard-nav">
            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => handleTabClick('overview')}><FaUser /> Overview</button>
            <button className={activeTab === 'benefits' ? 'active' : ''} onClick={() => handleTabClick('benefits')}><FaGift /> Benefits</button>
            <button className={activeTab === 'balance' ? 'active' : ''} onClick={() => handleTabClick('balance')}><FaBalanceScale /> Balance</button>
            <button className={activeTab === 'redemption' ? 'active' : ''} onClick={() => handleTabClick('redemption')}><FaExchangeAlt /> Redemption</button>
            <button className={activeTab === 'partners' ? 'active' : ''} onClick={() => handleTabClick('partners')}><FaHandshake /> Partners</button>
            <button className={activeTab === 'transactions' ? 'active' : ''} onClick={() => handleTabClick('transactions')}><FaHistory /> Transactions</button>
            <button className={activeTab === 'spend' ? 'active' : ''} onClick={() => handleTabClick('spend')}><FaChartLine /> Spend Analysis</button>
          </nav>

          <main className="dashboard-main">
            {activeTab === 'overview' && (
              <div className="overview-section">
                <div className="card member-details">
                  <h2>Card Member Details</h2>
                  <p><strong>Name:</strong> {cardMemberDetails.name}</p>
                  <p><strong>Card Type:</strong> {cardMemberDetails.cardType}</p>
                  <p><strong>Profile ID:</strong> {cardMemberDetails.profileID}</p>
                  <p><strong>Customer ID:</strong> {cardMemberDetails.customerID}</p>
                  <p><strong>Acquisition Date:</strong> {cardMemberDetails.acquisitionDate}</p>
                  <p><strong>Status:</strong> {cardMemberDetails.active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="card quick-stats">
                  <h2>Quick Stats</h2>
                  <div className="stat">
                    <span className="stat-label">Current Points</span>
                    <span className="stat-value">{balance?.points.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Cash Value</span>
                    <span className="stat-value">${balance?.cashValue.toLocaleString()}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Net Spend</span>
                    <span className="stat-value">${netSpend?.netSpend.toLocaleString()}</span>
                  </div>
                </div>
                <div className="card recent-activity">
                  <h2>Recent Activity</h2>
                  <ul>
                    {transactionHistory.slice(0, 5).map((transaction, index) => (
                      <li key={index} className={`activity-item ${transaction.type}`}>
                        <span className="activity-date">{transaction.date}</span>
                        <span className="activity-description">{transaction.description}</span>
                        <span className="activity-amount">{transaction.amount >= 0 ? '+' : ''}{transaction.amount}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="benefits-section">
                <h2>Your Benefits</h2>
                <div className="benefits-list">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="benefit-card" onClick={() => handleItemClick('benefit', index)}>
                      <span className="benefit-icon">{benefit.icon}</span>
                      <h3>{benefit.description}</h3>
                      <p>Effective from: {benefit.effectiveDate}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'balance' && (
              <div className="balance-section">
                <h2>Points Balance</h2>
                <div className="balance-details">
                  <div className="balance-card">
                    <h3>Current Balance</h3>
                    <p className="balance-amount">{balance?.points.toLocaleString()} points</p>
                    <p className="balance-value">(${balance?.cashValue.toLocaleString()} value)</p>
                  </div>
                  <div className="balance-history">
                    <h3>Balance History</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={transactionHistory}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="pointsEarned" stroke="#8884d8" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="balance-filter">
                  <label htmlFor="balanceDate">View balance as of: </label>
                  <input
                    id="balanceDate"
                    type="date"
                    value={balanceDate}
                    onChange={(e) => setBalanceDate(e.target.value)}
                  />
                  <button onClick={fetchData}>Update</button>
                </div>
              </div>
            )}

            {activeTab === 'redemption' && (
              <div className="redemption-section">
                <h2>Redemption History</h2>
                <table className="redemption-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Points Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redemptionDetails.map((redemption, index) => (
                      <tr key={index} onClick={() => handleItemClick('redemption', index)}>
                        <td>{redemption.date}</td>
                        <td>{redemption.voucherDescription}</td>
                        <td>{redemption.pointsUsed.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'partners' && (
              <div className="partners-section">
                <h2>Partner Interactions</h2>
                <div className="partner-list">
                  {partnerDetails.map((partner, index) => (
                    <div key={index} className={`partner-card ${partner.status}`} onClick={() => handleItemClick('partner', index)}>
                      <h3>{partner.partner}</h3>
                      <p><strong>Date:</strong> {partner.date}</p>
                      <p><strong>Points Transferred:</strong> {partner.pointsTransferred.toLocaleString()}</p>
                      <p><strong>Status:</strong> {partner.status} {partner.icon}</p>
                      {partner.reason && <p><strong>Reason:</strong> {partner.reason}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="transactions-section">
                <h2>Transaction History</h2>
                <div className="transaction-list">
                  {transactionHistory.map((transaction, index) => (
                    <div key={index} className={`transaction-item ${transaction.type}`} onClick={() => handleItemClick('transaction', index)}>
                      <div className="transaction-icon">
                        {transaction.type === 'credit' && '💳'}
                        {transaction.type === 'debit' && '🔻'}
                        {transaction.type === 'adjustment' && '🔄'}
                        {transaction.type === 'redemption' && '🎁'}
                      </div>
                      <div className="transaction-details">
                        <h3>{transaction.description}</h3>
                        <p>{transaction.date}</p>
                      </div>
                      <div className="transaction-amount">
                        <p className={transaction.amount >= 0 ? 'positive' : 'negative'}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p>{transaction.pointsEarned >= 0 ? '+' : ''}{transaction.pointsEarned} points</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'spend' && (
              <div className="spend-section">
                <h2>Spend Analysis</h2>
                <div className="spend-overview">
                  <div className="spend-card">
                    <h3>Net Spend This Month</h3>
                    <p className="spend-amount">${netSpend?.netSpend.toLocaleString()}</p>
                    <div className="spend-progress">
                      <div className="progress-bar" style={{ width: `${netSpend?.progress}%` }}></div>
                    </div>
                    <p className="spend-target">Target: ${netSpend?.threshold.toLocaleString()}</p>
                  </div>
                  <div className="spend-chart">
                    <h3>Spending by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={spendingCategories}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          label
                        >
                          {spendingCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="spend-details">
                  <h3>Monthly Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={transactionHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {jsonDetails && (
              <div className="json-details-modal">
                <h2>{jsonDetails.type.charAt(0).toUpperCase() + jsonDetails.type.slice(1)} Details</h2>
                <pre>{JSON.stringify(jsonDetails.details, null, 2)}</pre>
                <button onClick={() => setJsonDetails(null)}>Close</button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default Dashboard;