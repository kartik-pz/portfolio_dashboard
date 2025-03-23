export async function POST(request) {
  try {
    const body = await request.json();
    const { message } = body;
    
    console.log('Server received chat request:', message);
    
    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const API_URL = 'https://api.dify.ai/v1/chat-messages';
    const API_KEY = process.env.DIFY_API_KEY;

    console.log(`[Chat API] Using API key: ${API_KEY ? '✓ Available' : '✗ Missing'}`);
    
    // Make initial request to Dify API with streaming mode
    console.log('Making request to Dify API with streaming mode');
    const difyResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        app_id: 'e0e5d1f0-5185-4cf1-8588-2909a137e9cb',
        user: 'user123',
        inputs: {},
        query: message,
        response_mode: 'streaming', // Using streaming mode
      }),
    });
    
    if (!difyResponse.ok) {
      console.error('Dify API error:', difyResponse.status);
      let errorText;
      try {
        errorText = await difyResponse.text();
        console.error('Dify API error details:', errorText);
      } catch (e) {
        console.error('Failed to get error details:', e);
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to get response from AI service' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('Response content type:', difyResponse.headers.get('content-type'));
    console.log('Response status:', difyResponse.status);
    
    // Process streaming response directly from the initial response
    console.log('Processing streaming response');
    if (!difyResponse.body) {
      return new Response(
        JSON.stringify({ error: 'No response body from Dify API' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the text decoder for the stream
    const reader = difyResponse.body.getReader();
    const decoder = new TextDecoder();
    
    let accumulatedAnswer = '';
    let conversation_id = null;
    let message_id = null;
    let isDone = false;
    let textBuffer = '';
    
    while (!isDone) {
      const { value, done } = await reader.read();
      
      if (done) {
        console.log('Stream reading complete');
        break;
      }
      
      // Decode this chunk and add to buffer
      textBuffer += decoder.decode(value, { stream: true });
      
      // Process any complete events in the buffer
      const lines = textBuffer.split('\n');
      
      // Keep the last line in the buffer if it's not complete
      textBuffer = lines.pop() || '';
      
      for (const line of lines) {
        if (!line.trim()) continue; // Skip empty lines
        
        if (line === 'data: [DONE]') {
          console.log('Received [DONE] message');
          isDone = true;
          break;
        }
        
        if (line.startsWith('data: ')) {
          try {
            const jsonStr = line.replace('data: ', '');
            const data = JSON.parse(jsonStr);
            
            // Extract conversation_id on first event if available
            if (data.conversation_id && !conversation_id) {
              conversation_id = data.conversation_id;
              console.log('Found conversation_id:', conversation_id);
            }
            
            // Extract message_id on first event if available
            if (data.message_id && !message_id) {
              message_id = data.message_id;
              console.log('Found message_id:', message_id);
            }
            
            // Process based on event type
            if (data.event === 'agent_message' && data.answer !== undefined) {
              // Append this part to the answer
              accumulatedAnswer += data.answer;
            } else if (data.event === 'message_end') {
              console.log('Received message_end event');
              isDone = true;
            } else {
              console.log(`Skipping event type: ${data.event}`);
            }
          } catch (error) {
            console.error('Error parsing event:', error.message);
          }
        }
      }
    }
    
    // Flush the decoder to get any remaining bytes
    const remaining = decoder.decode();
    if (remaining) {
      // Process any remaining complete data
      const lines = remaining.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const jsonStr = line.replace('data: ', '');
            const data = JSON.parse(jsonStr);
            
            if (data.event === 'agent_message' && data.answer !== undefined) {
              accumulatedAnswer += data.answer;
            }
          } catch (error) {
            // Ignore parsing errors in final flush
          }
        }
      }
    }
    
    console.log('Final answer length:', accumulatedAnswer.length);
    if (accumulatedAnswer.length > 100) {
      console.log('Final answer (preview):', accumulatedAnswer.substring(0, 100) + '...');
    } else {
      console.log('Final answer:', accumulatedAnswer);
    }
    
    // Send the complete response back to the client
    return new Response(
      JSON.stringify({ 
        answer: accumulatedAnswer,
        conversation_id: conversation_id
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Server error handling chat request:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 