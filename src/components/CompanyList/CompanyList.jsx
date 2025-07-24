import React, { useState, useEffect } from 'react';
import './CompanyList.css'; // Create this CSS file later

const CompanyList = () => {
    const [companies, setCompanies] = useState([]);
    const [filteredRole, setFilteredRole] = useState('');
    const [filteredDomain, setFilteredDomain] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_BASE_URL = 'http://localhost:8000/api'; // Your Django API base URL

    useEffect(() => {
        fetchCompanies();
    }, [filteredRole, filteredDomain]); // Re-fetch when filters change

    const fetchCompanies = async () => {
        setLoading(true);
        setError(null);
        let url = `${API_BASE_URL}/companydrives/`;
        const params = new URLSearchParams();

        if (filteredRole) {
            params.append('search', filteredRole); // Using Django's SearchFilter
        }
        if (filteredDomain) {
            params.append('search', filteredDomain); // Using Django's SearchFilter
        }
        // For distinct role/domain filters, you might need separate search_fields in Django or custom filtering
        // For simplicity, we're using 'search' which applies to both role and domain based on our Django setup.

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCompanies(data);
        } catch (e) {
            console.error("Failed to fetch companies:", e);
            setError("Failed to load company data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleRoleFilterChange = (e) => {
        setFilteredRole(e.target.value);
    };

    const handleDomainFilterChange = (e) => {
        setFilteredDomain(e.target.value);
    };

    if (loading) return <div className="container">Loading companies...</div>;
    if (error) return <div className="container" style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div className="container">
            <h2>Company Drives</h2>
            <div className="filters">
                <input
                    type="text"
                    placeholder="Filter by Role"
                    value={filteredRole}
                    onChange={handleRoleFilterChange}
                />
                <input
                    type="text"
                    placeholder="Filter by Domain"
                    value={filteredDomain}
                    onChange={handleDomainFilterChange}
                />
                <button onClick={() => { setFilteredRole(''); setFilteredDomain(''); }}>Clear Filters</button>
            </div>
            <div className="company-grid">
                {companies.length === 0 ? (
                    <p>No companies found matching your criteria.</p>
                ) : (
                    companies.map(company => (
                        <div key={company.id} className="company-card">
                            <h3>{company.company_name} - {company.role}</h3>
                            <p><strong>Domain:</strong> {company.domain}</p>
                            <p><strong>Salary:</strong> {company.salary_range || 'N/A'}</p>
                            <p><strong>Timeline:</strong> {company.hiring_timeline}</p>
                            <p><strong>Drive Date:</strong> {company.drive_date}</p>
                            <p><strong>Location:</strong> {company.location}</p>
                            <details>
                                <summary>Interview Process</summary>
                                <p>{company.interview_process_description}</p>
                            </details>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CompanyList;