// Client-side email service that calls the server-side API

export const sendContactEmail = async (formData) => {
  try {
    console.log('Sending contact email with data:', formData);
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact',
        formData
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        console.log('Error response text:', errorData);
        
        // Try to parse as JSON if possible
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || errorMessage;
        } catch (parseError) {
          // If not JSON, use the text as error message
          errorMessage = errorData || errorMessage;
        }
      } catch (textError) {
        console.log('Could not read error response:', textError);
      }
      
      throw new Error(errorMessage);
    }

    // Get response text first to check if it's valid JSON
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!responseText) {
      throw new Error('Empty response from server');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text that failed to parse:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Parsed response data:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
};

export const sendAppointmentEmail = async (formData) => {
  try {
    console.log('Sending appointment email with data:', formData);
    
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'appointment',
        formData
      })
    });

    console.log('Response status:', response.status);

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        console.log('Error response text:', errorData);
        
        // Try to parse as JSON if possible
        try {
          const errorJson = JSON.parse(errorData);
          errorMessage = errorJson.error || errorMessage;
        } catch (parseError) {
          // If not JSON, use the text as error message
          errorMessage = errorData || errorMessage;
        }
      } catch (textError) {
        console.log('Could not read error response:', textError);
      }
      
      throw new Error(errorMessage);
    }

    // Get response text first to check if it's valid JSON
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!responseText) {
      throw new Error('Empty response from server');
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Response text that failed to parse:', responseText);
      throw new Error('Invalid JSON response from server');
    }

    console.log('Parsed response data:', data);
    return { success: true, data };
    
  } catch (error) {
    console.error('Email service error:', error);
    throw new Error(error.message || 'Failed to send email');
  }
};