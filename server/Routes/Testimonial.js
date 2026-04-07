import express from 'express'
import { AdminMiddleware } from '../Middlewares/AuthMiddleware.js';
import { addTestimonial, deleteTestimonial, getTestimonials, updateTestimonial } from '../Controller/TestimonialController.js';
const router=express.Router();
router.get('/testimonials',getTestimonials);
router.post('/add-testimonial',AdminMiddleware,addTestimonial);
router.put('/update-testimonial/:id',AdminMiddleware,updateTestimonial);
router.delete('/delete-testimonial/:id',AdminMiddleware,deleteTestimonial);
export default router;