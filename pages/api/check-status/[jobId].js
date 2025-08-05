// pages/api/check-status/[jobId].js
// pages/api/check-status/[jobId].js
import { get } from '@vercel/edge-config';

export default async function handler(req, res) {
  const { jobId } = req.query;

  if (!jobId) {
    return res.status(400).json({ error: 'Job ID required' });
  }

  try {
    // Get job status from Edge Config
    const jobStatus = await get(jobId);

    if (!jobStatus) {
      return res.status(200).json({ 
        status: 'processing',
        message: 'Job is still processing or not found'
      });
    }

    res.status(200).json(jobStatus);

  } catch (error) {
    console.error('Edge Config error:', error);
    res.status(500).json({ error: 'Failed to check job status' });
  }
} jobStatuses = getJobStatuses();
  jobStatuses[jobId] = {
    status: status,
    data: data,
    updatedAt: new Date().toISOString()
  };
  
  saveJobStatuses(jobStatuses);
  res.status(200).json({ success: true });
}
