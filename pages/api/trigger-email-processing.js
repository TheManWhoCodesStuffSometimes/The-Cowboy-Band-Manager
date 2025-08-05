// pages/api/trigger-email-processing.js
import { get } from '@vercel/edge-config';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Generate a unique job ID for tracking
    const jobId = `email-job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Store initial job status in Edge Config
    // Note: We'll update this via the Vercel API since Edge Config is read-only from runtime
    // For now, we'll let n8n handle the status updates
    
    // Trigger your n8n workflow WITHOUT waiting for it to complete
    const n8nWebhookUrl = 'YOUR_N8N_WEBHOOK_URL_HERE';
    
    // Fire and forget - don't await this!
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId: jobId,
        edgeConfigId: 'ecfg_s1ek1kem6khho2wdqk9sakyyawrb',
        // Add any other data your workflow needs
        ...req.body
      })
    }).catch(error => {
      console.error('N8N trigger failed:', error);
    });

    // Return immediately with job ID
    res.status(202).json({ 
      message: 'Email processing started', 
      jobId: jobId,
      status: 'processing'
    });

  } catch (error) {
    console.error('Trigger error:', error);
    res.status(500).json({ error: 'Failed to start processing' });
  }
}
