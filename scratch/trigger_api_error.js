async function triggerError() {
  const payload = {
    first_name: 'Debug',
    middle_name: 'M',
    surname: 'Test',
    gender: 'Male',
    date_of_birth: '1990-01-01',
    nationality: 'Ghanaian',
    phone_number: '0240000000',
    ghana_card_number: 'GHA-000000000-0',
    mobile_banker: 'Banker A',
    customer_type: '1',
    passport_photo: ''
  };

  try {
    const res = await fetch('http://localhost:3000/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

triggerError();
