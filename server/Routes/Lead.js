import express from 'express';
import * as LeadController from '../Controller/LeadController.js';

const router = express.Router();

// Route for the landing page to submit a new lead
router.post('/submit', LeadController.createLead);

// Routes for the Admin Dashboard
router.get('/all', LeadController.getLeads);
router.post('/broadcast', LeadController.broadcastCampaign);

export default router;