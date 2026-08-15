const API_BASE_URL = 'https://echainos-backend.onrender.com';
// 1. User Authentication
export async function loginUser(identifier: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return response.json();
}

// 2. Register New User
export async function registerUser(userData: any) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
}

// 3. Commit Evidence Block / Transfer
export async function transferEvidence(payload: any) {
  const response = await fetch(`${API_BASE_URL}/evidence/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.json();
}

// 4. Get Evidence Chain Logs
export async function getEvidenceChain(evidenceId?: string) {
  const url = evidenceId 
    ? `${API_BASE_URL}/evidence?evidenceId=${encodeURIComponent(evidenceId)}`
    : `${API_BASE_URL}/evidence`;
    
  const response = await fetch(url);
  return response.json();
}