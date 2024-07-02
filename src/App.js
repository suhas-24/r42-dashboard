import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUser, FaGift, FaBalanceScale, FaExchangeAlt, FaHandshake, FaHistory, FaChartLine } from 'react-icons/fa';
import './Dashboard.css';
import './ChatbotInterface.css'
import dummyData from './dummyData.json';
// Mistral AI API configuration
const MISTRAL_API_KEY = 'Cwczvpnd4GL5Z6iQIiEFhvj6dnGyj01v';
const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions'


const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ChatWithAIButton = ({ onClick }) => {
  return (
    <button onClick={onClick} className="chat-with-ai-button">
      <svg className="chat-icon" viewBox="0 0 100 100" width="40" height="40">
        <circle className="chat-icon-circle" cx="50" cy="50" r="45" />
        <path className="chat-icon-bubble" d="M50 25c-13.8 0-25 9.4-25 21 0 4.4 1.7 8.5 4.6 11.9 0.2 3.4-0.8 8.6-3.6 11.4 5-0.7 9.9-2.8 12.8-4.3 3.5 1.3 7.3 2 11.2 2 13.8 0 25-9.4 25-21S63.8 25 50 25z" />
        <path className="chat-icon-antenna" d="M50 10v10" />
        <circle className="chat-icon-eye left" cx="40" cy="45" r="5" />
        <circle className="chat-icon-eye right" cx="60" cy="45" r="5" />
        <path className="chat-icon-mouth" d="M40 60q10 10 20 0" />
      </svg>
      <span>Chat with AI</span>
    </button>
  );
};
// Chatbot Interface Component

const ChatbotInterface = ({ onClose, dashboardData, fetchData }) => {
  const [messages, setMessages] = useState([
    { text: "Welcome! Please enter your CM15 (Credit Card Number) to get started.", user: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const formatResponse = (response) => {
    const lines = response.split('\n');
    let formattedResponse = '';
    let inTable = false;
    let tableHeaders = [];

    for (const line of lines) {
      if (line.includes('|') && !inTable) {
        inTable = true;
        tableHeaders = line.split('|').map(header => header.trim()).filter(Boolean);
        formattedResponse += `<table><thead><tr>${tableHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>`;
      } else if (line.includes('|') && inTable) {
        const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
        formattedResponse += `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;
      } else if (!line.includes('|') && inTable) {
        inTable = false;
        formattedResponse += '</tbody></table>';
        formattedResponse += `<p>${line}</p>`;
      } else {
        formattedResponse += `<p>${line}</p>`;
      }
    }

    if (inTable) {
      formattedResponse += '</tbody></table>';
    }

    return formattedResponse;
  };

  const handleSend = async () => {
    if (input.trim() === '') return;
    setMessages([...messages, { text: input, user: true }]);
    setInput('');
    setIsLoading(true);

    if (!cardNumber) {
      // If card number is not set, treat this input as the card number
      setCardNumber(input);
      try {
        await fetchData(input);
        setMessages(prevMessages => [
          ...prevMessages,
          { text: `Thank you. I've fetched the data for card number ${input}. How can I assist you?`, user: false }
        ]);
      } catch (error) {
        setMessages(prevMessages => [
          ...prevMessages,
          { text: 'Error fetching data. Please try again with a valid card number.', user: false }
        ]);
        setCardNumber('');
      }
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        MISTRAL_API_URL,
        {
          model: 'mistral-tiny',
          messages: [
            { role: 'system', content: `You are a precise data assistant for credit card customer support. You have access to the following data: ${JSON.stringify(dashboardData)}. Analyze this data to answer user queries accurately. Use tables for structured data when appropriate. Be concise and factual. Do not add any creative elements or unnecessary text.` },
            ...messages.map(msg => ({ role: msg.user ? 'user' : 'assistant', content: msg.text })),
            { role: 'user', content: input }
          ],
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${MISTRAL_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const aiResponse = response.data.choices[0].message.content;
      const formattedResponse = formatResponse(aiResponse);
      setMessages(prevMessages => [...prevMessages, { text: formattedResponse, user: false }]);
    } catch (error) {
      console.error('Error processing query:', error);
      setMessages(prevMessages => [...prevMessages, { text: 'Error retrieving data. Please try again.', user: false }]);
    }
    setIsLoading(false);
  };

  return (
    <div className="chatbot-interface">
      <div className="chatbot-header">
        <h2>R42 Chatbot</h2>
        <button onClick={onClose}>Close</button>
      </div>
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.user ? 'user' : 'ai'}`}>
            {message.user ? (
              <p>{message.text}</p>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: message.text }} />
            )}
          </div>
        ))}
        {isLoading && <div className="message ai">Processing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={cardNumber ? "Enter your query" : "Enter your CM15 (Credit Card Number)"}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
};



const Dashboard = () => {
  const [cm15, setCm15] = useState('');
  const [cardMemberDetails, setCardMemberDetails] = useState(null);
  const [benefits, setBenefits] = useState([]);
  const [balance, setBalance] = useState(null);
  const [redemptionDetails, setRedemptionDetails] = useState([]);
  const [partnerDetails, setPartnerDetails] = useState([]);
  const [transactionHistory, setTransactionHistory] = useState([]);
  const [netSpend, setNetSpend] = useState(null);
  const [spendingCategories, setSpendingCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [jsonDetails, setJsonDetails] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);

  const fetchData = async (cardNumber) => {
    // In a real application, you would use the cardNumber to fetch data from an API
    // For this example, we'll just use the dummy data
    setCardMemberDetails(dummyData.cardMemberDetails);
    setBenefits(dummyData.benefits);
    setBalance(dummyData.balanceHistory[dummyData.balanceHistory.length - 1]);
    setRedemptionDetails(dummyData.redemptionDetails);
    setPartnerDetails(dummyData.partnerDetails);
    setTransactionHistory(dummyData.transactionHistory);
    setNetSpend(dummyData.netSpend);
    setSpendingCategories(dummyData.spendingCategories);
    setCm15(cardNumber);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setJsonDetails(null);
  };

  const handleItemClick = (type, id) => {
    let details;
    switch (type) {
      case 'benefit':
        details = dummyData.benefits.find(b => b.id === id);
        break;
      case 'redemption':
        details = dummyData.redemptionDetails.find(r => r.id === id);
        break;
      case 'partner':
        details = dummyData.partnerDetails.find(p => p.id === id);
        break;
      case 'transaction':
        details = dummyData.transactionHistory.find(t => t.id === id);
        break;
      default:
        details = null;
    }
    setJsonDetails({ type, details });
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
          <button onClick={() => fetchData(cm15)}>Fetch Data</button>
        </div>
        <ChatWithAIButton onClick={() => setShowChatbot(true)} />
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
              <span className="stat-value">{balance.points.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Cash Value</span>
              <span className="stat-value">${balance.cashValue.toLocaleString()}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Net Spend</span>
              <span className="stat-value">${netSpend.currentSpend.toLocaleString()}</span>
            </div>
          </div>
          <div className="card recent-activity">
            <h2>Recent Activity</h2>
            <ul>
              {transactionHistory.slice(0, 5).map((transaction) => (
                <li key={transaction.id} className={`activity-item ${transaction.type}`}>
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
            {benefits.map((benefit) => (
              <div key={benefit.id} className="benefit-card" onClick={() => handleItemClick('benefit', benefit.id)}>
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
              <p className="balance-amount">{balance.points.toLocaleString()} points</p>
              <p className="balance-value">(${balance.cashValue.toLocaleString()} value)</p>
            </div>
            <div className="balance-history">
              <h3>Balance History</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dummyData.balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="points" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
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
              {redemptionDetails.map((redemption) => (
                <tr key={redemption.id} onClick={() => handleItemClick('redemption', redemption.id)}>
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
            {partnerDetails.map((partner) => (
              <div key={partner.id} className={`partner-card ${partner.status}`} onClick={() => handleItemClick('partner', partner.id)}>
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
            {transactionHistory.map((transaction) => (
              <div key={transaction.id} className={`transaction-item ${transaction.type}`} onClick={() => handleItemClick('transaction', transaction.id)}>
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
              <p className="spend-amount">${netSpend.currentSpend.toLocaleString()}</p>
              <div className="spend-progress">
                <div className="progress-bar" style={{ width: `${netSpend.progress}%` }}></div>
              </div>
              <p className="spend-target">Target: ${netSpend.threshold.toLocaleString()}</p>
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
    {showChatbot && (
        <div className="chatbot-overlay">
          <ChatbotInterface
            onClose={() => setShowChatbot(false)}
            dashboardData={{
              cardMemberDetails,
              benefits,
              balance,
              redemptionDetails,
              partnerDetails,
              transactionHistory,
              netSpend,
              spendingCategories
            }}
            fetchData={fetchData}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;